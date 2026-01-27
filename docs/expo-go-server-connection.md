# Expo Goとサーバー接続について

## 概要

Expo Goで起動したアプリは、Expoサーバー（Metro Bundler）との接続が切れると動作しなくなります。このドキュメントでは、その仕組みと対処法を説明します。

## Expo Goの仕組み

Expo Goは**開発用クライアント**であり、アプリのコードを内蔵していません。

### 動作フロー

```
[Expo Go] ←→ [Metro Bundler (開発サーバー)] ←→ [ソースコード]
    ↓
JavaScriptバンドルを取得して実行
```

### サーバー状態による動作

| 状態 | 動作 |
|-----|------|
| サーバー接続中 | JavaScriptバンドルをサーバーから取得して実行 |
| サーバー切断 | バンドルを取得できず、アプリが動作しない |

## なぜサーバーが必要なのか

### 1. 開発効率のため

- **ホットリロード**: コード変更が即座に反映される
- **デバッグ**: エラーメッセージやログがリアルタイムで表示される
- **ビルド不要**: ネイティブビルドなしで開発できる

### 2. Expo Goの設計思想

Expo Goは「開発用サンドボックス」として設計されています。本番アプリとして使用することは想定されていません。

## サーバーなしで動作させる方法

### 開発ビルド（Development Build）

Expo Go不要で、カスタムネイティブコードも使用可能：

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### 本番ビルド（Production Build）

App Store / Google Playにリリースするためのビルド：

```bash
# EAS Buildを使用
eas build --platform ios
eas build --platform android

# ローカルビルド
npx expo build:ios
npx expo build:android
```

### ビルドの違い

| 種類 | 用途 | サーバー必要 |
|-----|------|------------|
| Expo Go | 開発・プロトタイプ | 必要 |
| Development Build | 開発（カスタムネイティブコード対応） | 必要（デバッグ時） |
| Production Build | 本番リリース | 不要 |

## 開発中のTips

### サーバーを起動したままにする

```bash
# 開発サーバーを起動
npx expo start --tunnel
```

ターミナルを閉じるとサーバーが停止するため、開発中は起動したままにしておきます。

### 切断された場合の対処

1. サーバーを再起動
   ```bash
   npx expo start --tunnel
   ```

2. Expo Goでアプリをリロード
   - デバイスをシェイクして「Reload」を選択
   - または、Expo Goのホーム画面から再度アプリを開く

### バックグラウンドで実行

サーバーをバックグラウンドで実行したい場合：

```bash
# tmuxやscreenを使用
tmux new -s expo
npx expo start --tunnel
# Ctrl+B, D でデタッチ

# 再接続
tmux attach -t expo
```

## 参考リンク

- [Expo Go公式ドキュメント](https://docs.expo.dev/get-started/expo-go/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## 更新履歴

- 2024-01-27: 初版作成
