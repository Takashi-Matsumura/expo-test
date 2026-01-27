// カメラ画面 - expo-image-pickerを使用した写真撮影機能
import { useState } from 'react';
import { StyleSheet, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CameraScreen() {
  const colorScheme = useColorScheme();
  // 撮影した写真のURIを保存するstate
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // カメラを起動して写真を撮影する関数
  const takePhoto = async () => {
    // カメラの権限を確認・要求
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      // 権限が拒否された場合
      Alert.alert(
        '権限エラー',
        'カメラを使用するには、カメラへのアクセス権限が必要です。設定アプリから権限を許可してください。'
      );
      return;
    }

    // カメラを起動
    const result = await ImagePicker.launchCameraAsync({
      // 撮影後に編集を許可するかどうか
      allowsEditing: true,
      // 画像の品質（0-1）
      quality: 0.8,
    });

    // ユーザーがキャンセルしなかった場合
    if (!result.canceled && result.assets[0]) {
      // 撮影した写真のURIをstateに保存
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* 画面タイトル */}
      <ThemedText type="title" style={styles.title}>
        カメラ
      </ThemedText>

      {/* 説明テキスト */}
      <ThemedText style={styles.description}>
        ボタンを押してカメラで写真を撮影できます。
      </ThemedText>

      {/* 写真表示エリア */}
      <ThemedView style={styles.photoContainer}>
        {photoUri ? (
          // 写真がある場合は表示
          <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
        ) : (
          // 写真がない場合はプレースホルダー
          <ThemedView style={styles.placeholder}>
            <IconSymbol
              name="camera.fill"
              size={64}
              color={Colors[colorScheme ?? 'light'].icon}
            />
            <ThemedText style={styles.placeholderText}>
              まだ写真がありません
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* 撮影ボタン */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint },
          pressed && styles.buttonPressed,
        ]}
        onPress={takePhoto}>
        <IconSymbol name="camera.fill" size={24} color="#fff" />
        <ThemedText style={styles.buttonText}>写真を撮影</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
  },
  photoContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
  },
  placeholderText: {
    marginTop: 16,
    opacity: 0.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
