# NFC対応状況検出

## 概要
ホーム画面にデバイスのNFC対応状況を表示するステータスカードを実装。
`react-native-nfc-manager`を使用してNFCハードウェアの有無を検出する。

## 動作環境

| 環境 | 表示 | 備考 |
|------|------|------|
| iPhone 7以降の実機（開発ビルド） | 緑色「対応しています」 | 開発ビルド必須 |
| iPhone 6以前 / iPod touch | グレー「非対応です」 | |
| iOSシミュレータ | グレー「非対応です」 | |
| Expo Go | グレー「非対応です」 | ネイティブモジュール未対応 |
| NFC対応Android実機 | 緑色「対応しています」 | 開発ビルド必須 |

## Expo Goでの制限

`react-native-nfc-manager`はネイティブモジュールのため、Expo Goでは動作しない。
`NativeModules.NfcManager`の存在を事前チェックすることで、Expo Goでのクラッシュを回避している。

```typescript
// Expo Goではネイティブモジュールが存在しないため、requireを実行しない
if (!NativeModules.NfcManager) {
  setNfcSupported(false);
  return;
}
const NfcManager = require('react-native-nfc-manager').default;
```

## テスト方法

### 前提条件

- Mac + Xcode（バージョン26以降推奨）
- USB-Cケーブルで実機を接続
- Apple Developer アカウント（無料でも可）

### 手順1: prebuild

ネイティブプロジェクトを生成する。

```bash
npx expo prebuild --clean
```

### 手順2: CLIからビルドを試す

```bash
npx expo run:ios --device "デバイス名"
```

接続中のデバイスを確認するには：

```bash
xcrun xctrace list devices
```

### 手順3: 署名エラーが出た場合（Xcodeで直接ビルド）

`npx expo run:ios` で以下のようなエラーが出ることがある：

```
error: No profiles for 'com.matsbaccano.expotest' were found
```

この場合、Xcodeで直接プロジェクトを開いて署名を設定する。

```bash
open ios/expotest.xcworkspace
```

Xcodeでの設定手順：

1. 左のナビゲーターで **expotest** プロジェクトを選択
2. TARGETSで **expotest** を選択
3. **Signing & Capabilities** タブを開く
4. **Automatically manage signing** にチェックを入れる
5. **Team** でApple Developer アカウントを選択
6. 上部のデバイス選択で接続済みのiPhoneを選択
7. **▶ (Run)** ボタンでビルド＆実行

### 手順4: Metro bundlerを起動

Xcodeからビルドした場合、アプリ起動時に以下のエラーが表示される：

```
No script URL provided. Make sure the packager is running
or you have embedded a JS bundle in your application bundle.
```

別ターミナルでMetro bundlerを起動する：

```bash
npx expo start --dev-client
```

起動後、iPhone側で **「Reload JS」** をタップするとアプリが読み込まれる。

### 手順5: 動作確認

iPhone 7以降の実機では、ホーム画面下部の「デバイス情報」セクションに
NFCカードが緑色で「対応しています」と表示される。

### EAS Build（クラウドビルド）

ローカルにXcodeがない場合はクラウドビルドも使える。

```bash
npx eas-cli build --profile development --platform ios
```

### iPhone側の事前準備

実機ビルドで「developer disk image could not be mounted」エラーが出た場合：

1. iPhoneのロックを解除した状態でMacに接続
2. 「このコンピュータを信頼しますか？」で **「信頼」** をタップ
3. **設定 > プライバシーとセキュリティ > デベロッパモード** を有効にする

## FeliCaカードリーダー機能

### 概要

NFCタブ画面からFeliCaカードのIDm（製造ID）とシステムコードを読み取る機能。
社員証などのFeliCaカードのIDmを取得し、社内アプリの認証基盤として利用できる。

### 読み取れるデータ

| データ | 説明 | 例 |
|--------|------|-----|
| IDm（製造ID） | カード固有の8バイト識別子。カードごとにユニーク | `1116020053187C01` |
| システムコード | カードの種別を示すコード | `FE00`, `0003` |
| 検出技術 | NFCの通信プロトコル | `felica`, `mifare` 等 |

### システムコード一覧

| コード | 種別 |
|--------|------|
| `0003` | 交通系IC（Suica, PASMO, ICOCA等） |
| `88B4` | 交通系IC（独自領域） |
| `8005` | FeliCa Standard |
| `8008` | FeliCa Lite |
| `FE00` | FeliCa Lite-S / NDEF |
| `12FC` | PASPY等 |

### 実機テスト結果

以下の3種類のカードで読み取りを確認済み：

| カード | IDm | システムコード | 種別 |
|--------|-----|---------------|------|
| 社員証 | `1116020053187C01` | `FE00` | FeliCa Lite-S / NDEF |
| 交通系IC | `01010910811B8804` | `0003` | 交通系IC |
| FeliCa Lite | `1110440097196407` | `FE00` | FeliCa Lite-S / NDEF |

### app.json のシステムコード設定

iOSでFeliCaを読み取るには、Info.plistに対象のシステムコードを登録する必要がある。
`app.json`のプラグイン設定で指定する：

```json
["react-native-nfc-manager", {
  "nfcPermission": "NFCを使用してカードを読み取ります",
  "systemCodes": ["0003", "88B4", "8005", "8008", "FE00", "12FC"]
}]
```

`systemCodes`に含まれないシステムコードのカードは検出されない。新しい種別のカードを読み取る場合は、そのカードのシステムコードをここに追加し、`npx expo prebuild --clean` で再ビルドが必要。

### NFC初期化の注意点

- `NfcManager.start()` を呼ばないとNFCセッションが開始されない
- `requestTechnology` に複数の技術を配列で渡すと、FeliCa以外のNFCカードも検出可能
- `useCallback` の依存配列に `nfcReady` を含めないと、クロージャ内で初期化状態が古いままになる

```typescript
// 複数技術を同時にリクエスト
const techs = [NfcTech.FelicaIOS, NfcTech.MifareIOS, NfcTech.Iso15693IOS, NfcTech.IsoDep];
const detectedTech = await NfcManager.requestTechnology(techs, {
  alertMessage: 'カードをiPhone上部にかざしてください',
});
```

### FeliCaタグ情報の取得

`getTag()` で取得できるタグオブジェクトのプロパティはカード種別により異なる：

```typescript
const tag = await NfcManager.getTag();

// FeliCaカードの場合
const idm = (tag as any).idm;         // "1116020053187C01"
const systemCode = (tag as any).systemCode;  // "FE00"

// MiFare等の場合
const id = tag.id;  // カードID
```

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `package.json` | `react-native-nfc-manager` 追加 |
| `app.json` | プラグイン設定追加（NFCパーミッション + systemCodes） |
| `app/(tabs)/index.tsx` | NFC検出ロジック＋ステータスカードUI → NFC画面への遷移ボタン |
| `app/(tabs)/nfc.tsx` | FeliCaカードリーダー画面（新規） |
| `app/(tabs)/_layout.tsx` | NFCタブ追加 |
