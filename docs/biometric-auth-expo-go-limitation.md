# 生体認証とExpo Goの制限

## 概要

Expo Goで生体認証（Face ID / Touch ID）をテストする際の制限事項をまとめます。

## 動作確認結果

| 設定 | Expo Go | Development Build |
|-----|---------|-------------------|
| `disableDeviceFallback: false` | ✅ 動作 | ✅ 動作 |
| `disableDeviceFallback: true` | ❌ エラー | ✅ 動作 |

## エラー内容

`disableDeviceFallback: true`（生体認証のみ、パスコード不可）を設定すると、以下のエラーが発生します：

```
missing_usage_description
```

## 原因

### NSFaceIDUsageDescription

iOSでは、Face IDを使用するアプリは`Info.plist`に使用理由を記載する必要があります。

```xml
<key>NSFaceIDUsageDescription</key>
<string>セキュアなデータにアクセスするためにFace IDを使用します</string>
```

### Expo Goの制限

Expo Goは事前にビルドされたアプリであり、`app.json`で設定した`infoPlist`は反映されません。

```json
// app.json - この設定はExpo Goでは無効
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSFaceIDUsageDescription": "..."
      }
    }
  }
}
```

## 解決方法

### 1. パスコードフォールバックを許可（Expo Goで動作）

```tsx
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: '認証してください',
  disableDeviceFallback: false, // パスコードフォールバックを許可
});
```

この方法では、生体認証が失敗した場合にパスコードで認証できます。

### 2. Development Buildを使用（推奨）

本格的な生体認証テストには、Development Buildを作成します：

```bash
# ローカルでビルド
npx expo run:ios

# EAS Buildを使用
eas build --profile development --platform ios
```

Development Buildでは`app.json`の設定が反映されるため、`disableDeviceFallback: true`も動作します。

## Expo Goで検証可能な機能

| 機能 | 検証可否 |
|-----|---------|
| 生体認証ハードウェアの確認 | ✅ |
| 生体認証の登録状態確認 | ✅ |
| 認証タイプの取得（Face ID / Touch ID） | ✅ |
| パスコード併用の認証 | ✅ |
| 生体認証のみの認証 | ❌ |
| SecureStoreへの保存 | ✅ |

## 実装上の推奨事項

### 開発段階

1. Expo Goで`disableDeviceFallback: false`を使用して基本機能を開発
2. 認証フローのUIとエラーハンドリングを実装
3. SecureStoreとの連携をテスト

### 本番準備段階

1. Development Buildを作成
2. `disableDeviceFallback: true`で生体認証のみの動作を確認
3. 認証失敗時のフォールバック処理を実装

## 参考リンク

- [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Apple - Face ID](https://developer.apple.com/documentation/localauthentication)

## 更新履歴

- 2024-01-27: 初版作成
