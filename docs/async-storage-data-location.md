# AsyncStorageのデータ保存場所

## 概要

AsyncStorageで保存したデータがiPhone上のどこに保存されるかを説明します。

## iOS（iPhone）の保存場所

### ファイルパス

```
/var/mobile/Containers/Data/Application/[APP-UUID]/Library/Application Support/
```

### 内部構造

AsyncStorageは内部的に**SQLiteデータベース**を使用しています。

```
RCTAsyncLocalStorage_V1/
  └── manifest.db    # キーと値のペアを保存
```

## 特徴

| 項目 | 内容 |
|-----|------|
| 保存形式 | SQLite（キーバリューストア） |
| 暗号化 | なし（平文） |
| アクセス | そのアプリのみ（サンドボックス） |
| 削除タイミング | アプリ削除時 |
| 容量制限 | 推奨6MB以下 |

## セキュリティ上の注意

AsyncStorageは**暗号化されていません**。以下のデータの保存には適していません：

- ❌ パスワード
- ❌ 認証トークン
- ❌ APIキー
- ❌ 個人情報（クレジットカード番号など）

### 適切な用途

- ✅ ユーザー設定（テーマ、言語など）
- ✅ キャッシュデータ
- ✅ 一時的なフォームデータ
- ✅ 非機密のユーザーデータ

## 機密データの保存方法

機密データには`expo-secure-store`を使用してください。

```tsx
import * as SecureStore from 'expo-secure-store';

// Keychainに暗号化して保存
await SecureStore.setItemAsync('token', 'secret-value');

// 読み込み
const token = await SecureStore.getItemAsync('token');

// 削除
await SecureStore.deleteItemAsync('token');
```

### SecureStoreの特徴

| 項目 | 内容 |
|-----|------|
| 保存場所 | iOS Keychain |
| 暗号化 | あり（ハードウェアレベル） |
| 容量制限 | 値は2048バイトまで |
| 生体認証連携 | 可能 |

## Android の場合

Androidでは以下の場所に保存されます：

```
/data/data/[パッケージ名]/databases/
  └── RKStorage    # SQLiteデータベース
```

## デバッグ方法

### React Native Debugger

React Native Debuggerを使用すると、AsyncStorageの内容を確認できます。

### Expo Go での確認

Expo Goでは直接ファイルシステムにアクセスできませんが、アプリ内でデータをログ出力することで確認できます：

```tsx
const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  console.log('AsyncStorage contents:', items);
};
```

## AsyncStorage vs SecureStore の違い

| 項目 | AsyncStorage | SecureStore |
|-----|-------------|-------------|
| 暗号化 | なし | あり（Keychain） |
| キーの文字 | `@`使用可能 | 英数字、`.`、`-`、`_`のみ |
| 値のサイズ | 推奨6MB以下 | 2048バイトまで |
| 用途 | 設定、キャッシュ | パスワード、トークン |

### キー命名の注意点

```tsx
// AsyncStorage - @プレフィックスが慣例
const STORAGE_KEY = '@memos';  // ✅ OK

// SecureStore - @は使用不可
const SECURE_KEY = '@secret';   // ❌ エラー
const SECURE_KEY = 'secret';    // ✅ OK
const SECURE_KEY = 'app.secret'; // ✅ OK
const SECURE_KEY = 'app-secret'; // ✅ OK
const SECURE_KEY = 'app_secret'; // ✅ OK
```

### エラーメッセージ

SecureStoreで無効なキーを使用すると以下のエラーが発生します：

```
Error: Invalid key provided to SecureStore.
Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".
```

## 参考リンク

- [AsyncStorage公式ドキュメント](https://react-native-async-storage.github.io/async-storage/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

## 更新履歴

- 2024-01-27: 初版作成
