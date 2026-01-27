// マイク画面 - expo-avを使用した録音・再生機能
import { useState, useRef } from 'react';
import { Pressable, Alert, View, Text } from 'react-native';
import { Audio } from 'expo-av';

import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MicrophoneScreen() {
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
    <View className="flex-1 p-5 pt-16 bg-white dark:bg-gray-900">
      {/* 画面タイトル */}
      <Text className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        マイク
      </Text>

      {/* 説明テキスト */}
      <Text className="mb-6 text-gray-500 dark:text-gray-400">
        音声を録音して再生できます。
      </Text>

      {/* 録音状態の表示 */}
      <View className="flex-row items-center justify-center gap-2 mb-6">
        <View
          className={`w-3 h-3 rounded-full ${
            isRecording ? 'bg-red-500' : 'bg-gray-500'
          }`}
        />
        <Text className="text-base text-gray-700 dark:text-gray-300">
          {isRecording ? '録音中...' : hasRecording ? '録音完了' : '待機中'}
        </Text>
      </View>

      {/* マイクアイコン */}
      <View className="flex-1 justify-center items-center">
        <IconSymbol
          name="mic.fill"
          size={100}
          color={isRecording ? '#ef4444' : '#9ca3af'}
        />
      </View>

      {/* ボタンエリア */}
      <View className="gap-3">
        {/* 録音開始/停止ボタン */}
        <Pressable
          className={`items-center justify-center p-4 rounded-xl active:opacity-80 ${
            isRecording ? 'bg-red-500' : 'bg-[#0a7ea4]'
          }`}
          onPress={isRecording ? stopRecording : startRecording}>
          <Text className="text-white text-lg font-semibold">
            {isRecording ? '録音停止' : '録音開始'}
          </Text>
        </Pressable>

        {/* 再生ボタン（録音がある場合のみ表示） */}
        {hasRecording && (
          <Pressable
            className="items-center justify-center p-4 rounded-xl bg-green-500 active:opacity-80 disabled:opacity-50"
            onPress={playRecording}
            disabled={isPlaying || isRecording}>
            <Text className="text-white text-lg font-semibold">
              {isPlaying ? '再生中...' : '再生'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
