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

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `package.json` | `react-native-nfc-manager` 追加 |
| `app.json` | プラグイン設定追加（NFCパーミッション） |
| `app/(tabs)/index.tsx` | NFC検出ロジック＋ステータスカードUI |
