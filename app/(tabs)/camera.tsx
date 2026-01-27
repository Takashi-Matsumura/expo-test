// カメラ画面 - expo-image-pickerを使用した写真撮影機能
import { useState } from 'react';
import { Pressable, Alert, View, Text } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CameraScreen() {
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
    <View className="flex-1 p-5 pt-16 bg-white dark:bg-gray-900">
      {/* 画面タイトル */}
      <Text className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        カメラ
      </Text>

      {/* 説明テキスト */}
      <Text className="mb-6 text-gray-500 dark:text-gray-400">
        ボタンを押してカメラで写真を撮影できます。
      </Text>

      {/* 写真表示エリア */}
      <View className="flex-1 rounded-xl overflow-hidden mb-6">
        {photoUri ? (
          // 写真がある場合は表示
          <Image source={{ uri: photoUri }} className="w-full h-full" contentFit="cover" />
        ) : (
          // 写真がない場合はプレースホルダー
          <View className="flex-1 justify-center items-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
            <IconSymbol name="camera.fill" size={64} color="#9ca3af" />
            <Text className="mt-4 text-gray-400 dark:text-gray-500">
              まだ写真がありません
            </Text>
          </View>
        )}
      </View>

      {/* 撮影ボタン */}
      <Pressable
        className="flex-row items-center justify-center gap-2 p-4 rounded-xl bg-[#0a7ea4] active:opacity-80"
        onPress={takePhoto}>
        <IconSymbol name="camera.fill" size={24} color="#fff" />
        <Text className="text-white text-lg font-semibold">写真を撮影</Text>
      </Pressable>
    </View>
  );
}
