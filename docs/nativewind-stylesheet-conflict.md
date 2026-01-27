# NativeWindとStyleSheetの競合について

## 概要

NativeWindを導入後、`StyleSheet.create()`で定義したスタイルが適用されなくなる問題が発生しました。このドキュメントでは、その原因と解決方法を記録します。

## 発生した問題

ホーム画面のカメラ・マイクボタンが表示されなくなりました。ボタン自体は存在しており、タップすると画面遷移は動作しましたが、視覚的に見えない状態でした。

### 問題のコード

```tsx
// StyleSheetを使用（NativeWind導入後に表示されなくなった）
<Pressable
  style={({ pressed }) => [
    styles.menuButton,
    styles.cameraButton,
    pressed && styles.menuButtonPressed,
  ]}
  onPress={() => router.push('/camera')}>
  <View style={styles.menuButtonTextContainer}>
    <Text style={styles.menuButtonTitle}>カメラ</Text>
    <Text style={styles.menuButtonDescription}>写真を撮影する</Text>
  </View>
</Pressable>

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  cameraButton: {
    backgroundColor: '#0a7ea4',
  },
  menuButtonTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  // ...
});
```

## 原因

### 1. ベーススタイルのリセット

NativeWindの`global.css`に含まれる`@tailwind base`が、`View`や`Text`コンポーネントのデフォルトスタイルをリセットします。

```css
/* global.css */
@tailwind base;      /* ← これがリセットを適用 */
@tailwind components;
@tailwind utilities;
```

### 2. StyleSheetの優先度低下

NativeWindはBabelプラグインを通じて`View`や`Text`コンポーネントにパッチを当て、`className`プロップをサポートします。この処理により、従来の`style`プロップの処理方法が変わり、`StyleSheet.create()`で定義したスタイルが正しく適用されないことがあります。

### 3. コンポーネントの内部変換

NativeWindが有効な場合、以下のような内部変換が行われます：

```tsx
// 元のコード
<View style={styles.container} />

// NativeWindによる変換後（概念的）
<View style={[nativeWindBaseStyles, styles.container]} />
```

この変換により、スタイルの優先順位や適用方法が変わる可能性があります。

## 解決方法

NativeWindの`className`を使用することで、NativeWindの仕組みに沿ったスタイリングができます。

### 修正後のコード

```tsx
// classNameを使用（正しく表示される）
<Pressable
  className="flex-row items-center gap-4 p-5 rounded-xl mb-3 bg-[#0a7ea4] active:opacity-80"
  onPress={() => router.push('/camera')}>
  <View className="flex-1">
    <Text className="text-white text-xl font-semibold">カメラ</Text>
    <Text className="text-white/80 text-sm mt-1">写真を撮影する</Text>
  </View>
</Pressable>
```

## ベストプラクティス

### 1. StyleSheetとclassNameを混在させない

NativeWindを導入したプロジェクトでは、スタイリング方法を統一することを推奨します。

```tsx
// 悪い例：混在
<View style={styles.container} className="mt-4">

// 良い例：classNameに統一
<View className="flex-1 p-4 mt-4">
```

### 2. 新規コンポーネントはclassNameで書く

既存のコードを全て書き換える必要はありませんが、新しく追加するコンポーネントは`className`で書くことを推奨します。

### 3. カスタムカラーの指定方法

Tailwindに定義されていない色は、角括弧記法で指定できます。

```tsx
// カスタムカラー
<View className="bg-[#0a7ea4]">
<Text className="text-[#ff6600]">

// 透明度の指定
<Text className="text-white/80">  {/* 80%の不透明度 */}
```

## 参考リンク

- [NativeWind公式ドキュメント](https://www.nativewind.dev/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)

## 更新履歴

- 2024-01-27: 初版作成
