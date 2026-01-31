# テスト環境の仕組み：Expo Go vs 開発ビルド（Xcode）

## なぜ2つの環境があるのか

このプロジェクトでは、機能によって2つの異なる環境を使い分けている。

| 環境 | 使う場面 | 必要なもの |
|------|---------|-----------|
| **Expo Go** | カメラ・マイク・ストレージなど標準機能の開発 | Expo Goアプリのみ |
| **開発ビルド（Xcode）** | NFC・生体認証など端末固有の機能の開発 | Mac + Xcode + USB接続 |

## Expo Goの仕組み

```
┌─────────────┐    JavaScriptを取得    ┌─────────────────┐
│   iPhone    │ ◄──────────────────── │  Mac            │
│  Expo Go    │                       │  Metro Bundler  │
│ （汎用アプリ）│ ────────────────────► │ （開発サーバー）  │
└─────────────┘    画面を表示          └─────────────────┘
```

- Expo Goは**Appleが公開している汎用の開発アプリ**
- App Storeからインストールするだけで使える
- Mac上の開発サーバー（Metro Bundler）からJavaScriptコードを受け取り実行する
- **ネイティブコードは変更できない**（Expo Goに最初から入っているものだけ使える）

### Expo Goで使える機能の例

- カメラ（`expo-image-picker`）
- マイク（`expo-av`）
- ストレージ（`AsyncStorage`, `expo-secure-store`）
- 画面遷移、スタイリングなどのUI全般

### Expo Goで使えない機能

- **NFC**（`react-native-nfc-manager`）
- 一部の生体認証設定
- その他のサードパーティ製ネイティブモジュール

使えない理由は、これらの機能が**iOSのネイティブコード（Objective-C/Swift）の追加**を必要とするため。Expo Goにはこれらのコードが含まれていない。

## 開発ビルド（Xcode）の仕組み

```
┌─────────────┐    JavaScriptを取得    ┌─────────────────┐
│   iPhone    │ ◄──────────────────── │  Mac            │
│  自分のアプリ │                       │  Metro Bundler  │
│ （専用ビルド）│ ────────────────────► │ （開発サーバー）  │
└─────────────┘    画面を表示          └─────────────────┘
       │
       │ アプリ内にネイティブコードが含まれている
       │ （NFC, 生体認証 etc.）
       ▼
  NFCハードウェアに直接アクセス可能
```

- **自分専用のアプリ**をXcodeでビルドし、iPhoneにインストールする
- Expo Goと同じようにMetro Bundlerからコードを取得するが、**ネイティブコードを自由に追加できる**
- NFC機能のコード（`react-native-nfc-manager`のiOS実装）がアプリに組み込まれる

## ビルドの流れ

### ステップ1: prebuild（ネイティブプロジェクト生成）

```bash
npx expo prebuild --clean
```

`app.json` の設定をもとに、`ios/` フォルダにXcodeプロジェクトを自動生成する。

```
app.json の設定：
  - NFC許可メッセージ
  - FeliCa systemCodes
  - バンドルID
         │
         ▼
ios/ フォルダに生成されるもの：
  - Info.plist（NFC設定、systemCodes含む）
  - expotest.entitlements（NFC権限）
  - Podfile → CocoaPods で react-native-nfc-manager 等を取得
```

**重要**: `app.json` を変更した場合は `npx expo prebuild --clean` を再実行する必要がある。
JavaScriptのコード変更だけなら不要（ホットリロードで反映される）。

### ステップ2: 実機ビルド

```bash
# 接続デバイスを確認
xcrun xctrace list devices

# ビルド＆インストール
npx expo run:ios --device "デバイスUDID"
```

または、Xcodeを開いて直接ビルドする：

```bash
open ios/expotest.xcworkspace
```

このステップで起きること：

1. ネイティブコード（Objective-C/C++）のコンパイル
2. NFC機能を含むアプリバイナリの生成
3. コード署名（Apple Developer証明書）
4. iPhoneへのインストール

### ステップ3: Metro Bundler起動

```bash
npx expo start --dev-client
```

ビルドしたアプリを起動すると、Metro BundlerからJavaScriptコードを取得する。
ここからは**Expo Goと同じ開発体験**（ホットリロード、エラー表示等）になる。

## 何を変更したら何が必要か

| 変更内容 | 必要なアクション |
|---------|----------------|
| UIの修正（`className`変更等） | 何もしない（ホットリロード） |
| TypeScript/JSのロジック変更 | 何もしない（ホットリロード） |
| `app.json` の変更（権限、systemCodes等） | `npx expo prebuild --clean` → Xcodeビルド |
| ネイティブパッケージの追加 | `npm install` → `npx expo prebuild --clean` → Xcodeビルド |
| ネイティブコードの直接編集 | Xcodeビルド |

## 2つの環境の使い分けまとめ

```
開発の流れ:

1. 新機能の画面レイアウトやロジックを作る
   → Expo Go で十分（高速、手軽）

2. NFC等のネイティブ機能を使う
   → 開発ビルド（Xcode）が必要

3. 本番リリース
   → EAS Build または Xcode Archive
```

### 日常の開発サイクル

```
[コード修正] → 自動ホットリロード → iPhone上で即確認
                 （Expo Go でも開発ビルドでも同じ）

[app.json修正] → prebuild → Xcodeビルド → iPhone上で確認
                 （開発ビルドのみ）
```

## このプロジェクトでの実際の使い分け

| 機能 | 環境 | 理由 |
|------|------|------|
| ホーム画面 | Expo Go | UIのみ、ネイティブ機能不要 |
| カメラ | Expo Go | `expo-image-picker` はExpo Go対応 |
| マイク | Expo Go | `expo-av` はExpo Go対応 |
| ストレージ | Expo Go | `AsyncStorage` / `expo-secure-store` はExpo Go対応 |
| NFC カードリーダー | 開発ビルド | `react-native-nfc-manager` はネイティブモジュール |
| 生体認証（一部設定） | 開発ビルド | `disableDeviceFallback` 等の設定が必要 |

## トラブルシューティング

### 「NFCモジュールが利用できません」

Expo Goで実行している。開発ビルドが必要。

### 「No script URL provided」

Xcodeからビルドした後、Metro Bundlerが起動していない。`npx expo start --dev-client` を実行する。

### prebuild後にビルドエラー

```bash
# クリーンしてやり直す
npx expo prebuild --clean
```

### 署名エラー（No profiles found）

Xcodeで直接プロジェクトを開き、Signing & CapabilitiesでTeamを設定する。
詳細は [nfc-detection-setup.md](./nfc-detection-setup.md) の「手順3」を参照。
