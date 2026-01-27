# カメラ・マイク学習アプリ

iPhoneのネイティブ機能（カメラ、マイク）の使い方を学ぶためのサンプルアプリです。

## 機能

### カメラ
- カメラを起動して写真を撮影
- 撮影した写真を画面に表示

### マイク
- 音声を録音
- 録音した音声を再生

## 使用技術

| パッケージ | 用途 |
|-----------|------|
| [Expo](https://expo.dev) | React Nativeフレームワーク |
| [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | カメラ撮影 |
| [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) | 録音・再生 |
| [expo-router](https://docs.expo.dev/router/introduction/) | ファイルベースルーティング |

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
```

## 動作確認環境

- Expo Go (iOS)
- Expo SDK 54

## 注意事項

- カメラとマイクの使用には権限の許可が必要です
- 実機（iPhone）での動作確認を推奨します
