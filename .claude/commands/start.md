# Expo開発サーバー起動

Expo開発サーバーをトンネルモードで起動し、トンネルURLを表示してください。

## 手順

1. 既存のExpoプロセスがあれば停止
2. `npx expo start --tunnel` をバックグラウンドで実行
3. トンネル接続を待機（約15-20秒）
4. ngrok APIからトンネルURLを取得
5. ユーザーにトンネルURLを表示

## 出力形式

```
Expoサーバーを起動しました。

トンネルURL: exp://xxxxx.exp.direct

Expo GoアプリでこのURLをスキャンまたは開いてください。
```
