# プロジェクト固有のルール

## 開発サーバーの起動

開発サーバーを起動する際は、以下の手順を必ず実行してください：

1. **Expoをトンネルモードで起動**
   ```bash
   npx expo start --tunnel
   ```

2. **トンネルURLを取得して表示**
   ```bash
   curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['tunnels'][0]['public_url'] if d.get('tunnels') else 'No tunnels')"
   ```

3. **ユーザーにURLを提示**
   ```
   トンネルURL: exp://xxxxx.exp.direct
   ```

## スタイリング

- NativeWindを使用（`className`でスタイリング）
- StyleSheetとclassNameを混在させない

## 言語

- UIは日本語
- コード内のコメントは日本語
- ドキュメントは日本語
