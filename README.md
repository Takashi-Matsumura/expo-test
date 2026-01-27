# iOSネイティブ機能学習アプリ

iPhoneのネイティブ機能の使い方を学ぶためのサンプルアプリです。

## 機能

### カメラ
- カメラを起動して写真を撮影
- 撮影した写真を画面に表示

### マイク
- 音声を録音
- 録音した音声を再生

### ストレージ
- **通常メモ（AsyncStorage）**: 暗号化なしのローカル保存
- **機密メモ（SecureStore）**: Keychainに暗号化して保存、認証が必要

## 使用技術

| パッケージ | 用途 |
|-----------|------|
| [Expo](https://expo.dev) | React Nativeフレームワーク |
| [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | カメラ撮影 |
| [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) | 録音・再生 |
| [expo-router](https://docs.expo.dev/router/introduction/) | ファイルベースルーティング |
| [NativeWind](https://www.nativewind.dev/) | Tailwind CSSスタイリング |
| [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | ローカルストレージ |
| [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/) | 生体認証 |
| [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) | Keychain保存 |

## セットアップ

1. 依存関係をインストール

   ```bash
   npm install
   ```

2. アプリを起動

   ```bash
   npx expo start --tunnel
   ```

3. [Expo Go](https://expo.dev/go)アプリでQRコードをスキャン

## ファイル構成

```
app/(tabs)/
  _layout.tsx      # タブナビゲーション設定
  index.tsx        # ホーム画面
  camera.tsx       # カメラ機能
  microphone.tsx   # マイク機能
  storage.tsx      # ストレージ機能（通常＋機密）
```

## 動作確認環境

- Expo Go (iOS)
- Expo SDK 54

## ドキュメント

- [NativeWindとStyleSheetの競合について](docs/nativewind-stylesheet-conflict.md)
- [Expo Goとサーバー接続について](docs/expo-go-server-connection.md)
- [AsyncStorageのデータ保存場所](docs/async-storage-data-location.md)
- [生体認証とExpo Goの制限](docs/biometric-auth-expo-go-limitation.md)

## 注意事項

- カメラとマイクの使用には権限の許可が必要です
- 機密メモへのアクセスには認証（Face ID/Touch ID/パスコード）が必要です
- 生体認証のみ（パスコード不可）の設定はExpo Goでは動作しません（Development Buildが必要）
- NativeWind導入後は`className`でスタイリングすることを推奨
