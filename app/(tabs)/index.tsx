// ホーム画面 - カメラ・マイク学習アプリのメイン画面
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, View, Text, ActivityIndicator, NativeModules } from 'react-native';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const router = useRouter();
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // ネイティブモジュールが存在するか確認（Expo Goでは存在しない）
    if (!NativeModules.NfcManager) {
      setNfcSupported(false);
      return;
    }
    const NfcManager = require('react-native-nfc-manager').default;
    NfcManager.isSupported()
      .then(setNfcSupported)
      .catch(() => setNfcSupported(false));
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      {/* ウェルカムメッセージ */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">ようこそ！</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* アプリの説明 */}
      <ThemedView style={styles.descriptionContainer}>
        <ThemedText>
          このアプリでは、iPhoneのネイティブ機能の使い方を学ぶことができます。
        </ThemedText>
      </ThemedView>

      {/* 機能選択メニュー */}
      <ThemedText type="subtitle" style={styles.menuTitle}>
        機能を選んでください
      </ThemedText>

      {/* カメラ機能へのリンクボタン */}
      <Pressable
        className="flex-row items-center gap-4 p-5 rounded-xl mb-3 bg-[#0a7ea4] active:opacity-80"
        onPress={() => router.push('/camera')}>
        <IconSymbol name="camera.fill" size={32} color="#fff" />
        <View className="flex-1">
          <Text className="text-white text-xl font-semibold">カメラ</Text>
          <Text className="text-white/80 text-sm mt-1">
            写真を撮影する
          </Text>
        </View>
      </Pressable>

      {/* マイク機能へのリンクボタン */}
      <Pressable
        className="flex-row items-center gap-4 p-5 rounded-xl mb-3 bg-[#4CAF50] active:opacity-80"
        onPress={() => router.push('/microphone')}>
        <IconSymbol name="mic.fill" size={32} color="#fff" />
        <View className="flex-1">
          <Text className="text-white text-xl font-semibold">マイク</Text>
          <Text className="text-white/80 text-sm mt-1">
            音声を録音・再生する
          </Text>
        </View>
      </Pressable>

      {/* ストレージ機能へのリンクボタン */}
      <Pressable
        className="flex-row items-center gap-4 p-5 rounded-xl mb-3 bg-[#9C27B0] active:opacity-80"
        onPress={() => router.push('/storage')}>
        <IconSymbol name="externaldrive.fill" size={32} color="#fff" />
        <View className="flex-1">
          <Text className="text-white text-xl font-semibold">ストレージ</Text>
          <Text className="text-white/80 text-sm mt-1">
            データ保存・認証付き機密保存
          </Text>
        </View>
      </Pressable>

      {/* デバイス情報 */}
      <ThemedText type="subtitle" className="mt-6 mb-4">
        デバイス情報
      </ThemedText>

      <View
        className={`flex-row items-center gap-4 p-5 rounded-xl ${
          nfcSupported === null
            ? 'bg-gray-400'
            : nfcSupported
              ? 'bg-[#2E7D32]'
              : 'bg-gray-500'
        }`}>
        <IconSymbol name="wave.3.right" size={32} color="#fff" />
        <View className="flex-1">
          <Text className="text-white text-xl font-semibold">NFC</Text>
          {nfcSupported === null ? (
            <View className="flex-row items-center gap-2 mt-1">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white/80 text-sm">確認中...</Text>
            </View>
          ) : (
            <Text className="text-white/80 text-sm mt-1">
              {nfcSupported ? '対応しています' : '非対応です'}
            </Text>
          )}
        </View>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  menuTitle: {
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
