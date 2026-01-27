// ホーム画面 - カメラ・マイク学習アプリのメイン画面
import { Image } from 'expo-image';
import { StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

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
        style={({ pressed }) => [
          styles.menuButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint },
          pressed && styles.menuButtonPressed,
        ]}
        onPress={() => router.push('/camera')}>
        <IconSymbol name="camera.fill" size={32} color="#fff" />
        <ThemedView style={styles.menuButtonTextContainer}>
          <ThemedText style={styles.menuButtonTitle}>カメラ</ThemedText>
          <ThemedText style={styles.menuButtonDescription}>
            写真を撮影する
          </ThemedText>
        </ThemedView>
      </Pressable>

      {/* マイク機能へのリンクボタン */}
      <Pressable
        style={({ pressed }) => [
          styles.menuButton,
          { backgroundColor: '#4CAF50' },
          pressed && styles.menuButtonPressed,
        ]}
        onPress={() => router.push('/microphone')}>
        <IconSymbol name="mic.fill" size={32} color="#fff" />
        <ThemedView style={styles.menuButtonTextContainer}>
          <ThemedText style={styles.menuButtonTitle}>マイク</ThemedText>
          <ThemedText style={styles.menuButtonDescription}>
            音声を録音・再生する
          </ThemedText>
        </ThemedView>
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
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuButtonPressed: {
    opacity: 0.8,
  },
  menuButtonTextContainer: {
    backgroundColor: 'transparent',
  },
  menuButtonTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  menuButtonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
