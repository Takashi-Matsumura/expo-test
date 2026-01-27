// マイク画面 - expo-avを使用した録音・再生機能
import { useState, useRef } from 'react';
import { StyleSheet, Pressable, Alert } from 'react-native';
import { Audio } from 'expo-av';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MicrophoneScreen() {
  const colorScheme = useColorScheme();
  // 録音中かどうかを管理するstate
  const [isRecording, setIsRecording] = useState(false);
  // 録音データがあるかどうか
  const [hasRecording, setHasRecording] = useState(false);
  // 再生中かどうか
  const [isPlaying, setIsPlaying] = useState(false);

  // 録音オブジェクトへの参照
  const recordingRef = useRef<Audio.Recording | null>(null);
  // 録音ファイルのURI
  const recordingUriRef = useRef<string | null>(null);
  // 再生用サウンドオブジェクト
  const soundRef = useRef<Audio.Sound | null>(null);

  // 録音を開始する関数
  const startRecording = async () => {
    try {
      // マイクの権限を確認・要求
      const permissionResult = await Audio.requestPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          '権限エラー',
          'マイクを使用するには、マイクへのアクセス権限が必要です。設定アプリから権限を許可してください。'
        );
        return;
      }

      // オーディオモードを設定（録音を許可）
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 新しい録音を作成して開始
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('録音開始エラー:', error);
      Alert.alert('エラー', '録音を開始できませんでした。');
    }
  };

  // 録音を停止する関数
  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      // 録音を停止
      await recordingRef.current.stopAndUnloadAsync();

      // 録音ファイルのURIを保存
      recordingUriRef.current = recordingRef.current.getURI();
      recordingRef.current = null;

      // オーディオモードを再生用に戻す
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setIsRecording(false);
      setHasRecording(true);
    } catch (error) {
      console.error('録音停止エラー:', error);
      Alert.alert('エラー', '録音を停止できませんでした。');
    }
  };

  // 録音を再生する関数
  const playRecording = async () => {
    try {
      if (!recordingUriRef.current) return;

      // 既存のサウンドがあればアンロード
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // 新しいサウンドオブジェクトを作成
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUriRef.current },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      // 再生が終了したときのコールバック
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('再生エラー:', error);
      Alert.alert('エラー', '録音を再生できませんでした。');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* 画面タイトル */}
      <ThemedText type="title" style={styles.title}>
        マイク
      </ThemedText>

      {/* 説明テキスト */}
      <ThemedText style={styles.description}>
        音声を録音して再生できます。
      </ThemedText>

      {/* 録音状態の表示 */}
      <ThemedView style={styles.statusContainer}>
        <ThemedView
          style={[
            styles.statusIndicator,
            { backgroundColor: isRecording ? '#ff4444' : '#666' },
          ]}
        />
        <ThemedText style={styles.statusText}>
          {isRecording
            ? '録音中...'
            : hasRecording
            ? '録音完了'
            : '待機中'}
        </ThemedText>
      </ThemedView>

      {/* マイクアイコン */}
      <ThemedView style={styles.iconContainer}>
        <IconSymbol
          name="mic.fill"
          size={100}
          color={
            isRecording
              ? '#ff4444'
              : Colors[colorScheme ?? 'light'].icon
          }
        />
      </ThemedView>

      {/* ボタンエリア */}
      <ThemedView style={styles.buttonContainer}>
        {/* 録音開始/停止ボタン */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: isRecording
                ? '#ff4444'
                : Colors[colorScheme ?? 'light'].tint,
            },
            pressed && styles.buttonPressed,
          ]}
          onPress={isRecording ? stopRecording : startRecording}>
          <ThemedText style={styles.buttonText}>
            {isRecording ? '録音停止' : '録音開始'}
          </ThemedText>
        </Pressable>

        {/* 再生ボタン（録音がある場合のみ表示） */}
        {hasRecording && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.playButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={playRecording}
            disabled={isPlaying || isRecording}>
            <ThemedText style={styles.buttonText}>
              {isPlaying ? '再生中...' : '再生'}
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
