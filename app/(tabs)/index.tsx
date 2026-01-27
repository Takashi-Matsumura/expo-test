// ホーム画面 - カメラ・マイク学習アプリのメイン画面
import { Image } from 'expo-image';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const router = useRouter();

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
