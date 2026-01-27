// ストレージ画面 - AsyncStorageとSecureStoreを使用したデータ永続化
import { useState, useEffect } from 'react';
import { Pressable, Alert, View, Text, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

import { IconSymbol } from '@/components/ui/icon-symbol';

// メモのデータ型を定義
type Memo = {
  id: string;
  text: string;
  createdAt: string;
};

// AsyncStorageのキー（通常のメモ）
const STORAGE_KEY = '@memos';
// SecureStoreのキー（機密メモ）
// 注意: SecureStoreのキーは英数字、"."、"-"、"_"のみ使用可能（@は不可）
const SECURE_STORAGE_KEY = 'secure_memo';

export default function StorageScreen() {
  // === 通常のメモ（AsyncStorage）===
  const [memos, setMemos] = useState<Memo[]>([]);
  const [inputText, setInputText] = useState('');

  // === 機密メモ（SecureStore）===
  const [secureInputText, setSecureInputText] = useState('');
  const [secureMemo, setSecureMemo] = useState<string | null>(null);
  const [isSecureUnlocked, setIsSecureUnlocked] = useState(false);

  // ロード中かどうか
  const [isLoading, setIsLoading] = useState(true);

  // アプリ起動時にデータを読み込む
  useEffect(() => {
    loadMemos();
  }, []);

  // ========== AsyncStorage（通常のメモ）==========

  // AsyncStorageからメモを読み込む関数
  const loadMemos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        const loadedMemos = JSON.parse(jsonValue) as Memo[];
        setMemos(loadedMemos);
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // メモを保存する関数
  const saveMemo = async () => {
    if (!inputText.trim()) {
      Alert.alert('入力エラー', 'メモを入力してください。');
      return;
    }

    try {
      const newMemo: Memo = {
        id: Date.now().toString(),
        text: inputText.trim(),
        createdAt: new Date().toLocaleString('ja-JP'),
      };

      const updatedMemos = [newMemo, ...memos];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemos));
      setMemos(updatedMemos);
      setInputText('');
    } catch (error) {
      console.error('データ保存エラー:', error);
      Alert.alert('エラー', 'データの保存に失敗しました。');
    }
  };

  // 特定のメモを削除する関数
  const deleteMemo = async (id: string) => {
    try {
      const updatedMemos = memos.filter((memo) => memo.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemos));
      setMemos(updatedMemos);
    } catch (error) {
      console.error('データ削除エラー:', error);
      Alert.alert('エラー', 'データの削除に失敗しました。');
    }
  };

  // ========== SecureStore（機密メモ）==========

  // 認証してSecureStoreのデータを表示
  const unlockSecureStorage = async () => {
    try {
      // 生体認証/パスコードで認証
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '機密メモにアクセス',
        cancelLabel: 'キャンセル',
        disableDeviceFallback: false, // パスコードフォールバックを許可
      });

      if (result.success) {
        setIsSecureUnlocked(true);
        // SecureStoreからデータを読み込む
        const data = await SecureStore.getItemAsync(SECURE_STORAGE_KEY);
        setSecureMemo(data);
      } else {
        Alert.alert('認証失敗', '認証がキャンセルされました。');
      }
    } catch (error) {
      console.error('認証エラー:', error);
      Alert.alert('エラー', '認証処理中にエラーが発生しました。');
    }
  };

  // 機密メモを保存
  const saveSecureMemo = async () => {
    if (!secureInputText.trim()) {
      Alert.alert('入力エラー', '機密メモを入力してください。');
      return;
    }

    try {
      const newSecureMemo = `${secureInputText.trim()}\n保存日時: ${new Date().toLocaleString('ja-JP')}`;
      await SecureStore.setItemAsync(SECURE_STORAGE_KEY, newSecureMemo);
      setSecureMemo(newSecureMemo);
      setSecureInputText('');
      Alert.alert('保存完了', '機密メモをKeychainに安全に保存しました。');
    } catch (error) {
      console.error('SecureStore保存エラー:', error);
      Alert.alert('エラー', '機密メモの保存に失敗しました。');
    }
  };

  // 機密メモを削除
  const deleteSecureMemo = async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORAGE_KEY);
      setSecureMemo(null);
      Alert.alert('削除完了', '機密メモを削除しました。');
    } catch (error) {
      console.error('SecureStore削除エラー:', error);
      Alert.alert('エラー', '機密メモの削除に失敗しました。');
    }
  };

  // 機密エリアをロック
  const lockSecureStorage = () => {
    setIsSecureUnlocked(false);
    setSecureMemo(null);
    setSecureInputText('');
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-5 pt-16">
        {/* 画面タイトル */}
        <Text className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          ストレージ
        </Text>
        <Text className="mb-6 text-gray-500 dark:text-gray-400">
          通常のメモと機密メモを保存できます。
        </Text>

        {/* ========== 機密メモセクション ========== */}
        <View className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6 border border-orange-200 dark:border-orange-800">
          <View className="flex-row items-center gap-2 mb-3">
            <IconSymbol name="faceid" size={20} color="#f97316" />
            <Text className="text-lg font-semibold text-orange-700 dark:text-orange-400">
              機密メモ（SecureStore）
            </Text>
          </View>

          <Text className="text-xs text-orange-600 dark:text-orange-400 mb-3">
            Keychainに暗号化して保存。アクセスには認証が必要です。
          </Text>

          {!isSecureUnlocked ? (
            // ロック状態
            <Pressable
              className="items-center justify-center p-4 rounded-xl bg-orange-500 active:opacity-80"
              onPress={unlockSecureStorage}>
              <Text className="text-white text-base font-semibold">
                認証してアクセス
              </Text>
            </Pressable>
          ) : (
            // アンロック状態
            <View className="gap-3">
              {/* 保存されている機密メモ */}
              <View className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  保存済みの機密メモ:
                </Text>
                <Text className="text-sm text-gray-900 dark:text-white">
                  {secureMemo || '(なし)'}
                </Text>
              </View>

              {/* 機密メモ入力 */}
              <TextInput
                className="border border-orange-300 dark:border-orange-700 rounded-lg p-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder="機密メモを入力..."
                placeholderTextColor="#9ca3af"
                value={secureInputText}
                onChangeText={setSecureInputText}
              />

              {/* ボタン */}
              <View className="flex-row gap-2">
                <Pressable
                  className="flex-1 items-center justify-center p-3 rounded-lg bg-orange-500 active:opacity-80"
                  onPress={saveSecureMemo}>
                  <Text className="text-white text-sm font-semibold">保存</Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center justify-center p-3 rounded-lg bg-red-500 active:opacity-80"
                  onPress={deleteSecureMemo}>
                  <Text className="text-white text-sm font-semibold">削除</Text>
                </Pressable>
                <Pressable
                  className="items-center justify-center p-3 rounded-lg bg-gray-500 active:opacity-80"
                  onPress={lockSecureStorage}>
                  <Text className="text-white text-sm font-semibold">ロック</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* ========== 通常メモセクション ========== */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <IconSymbol name="externaldrive.fill" size={20} color="#0a7ea4" />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              通常メモ（AsyncStorage）
            </Text>
          </View>

          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            暗号化なし。設定やキャッシュ向け。
          </Text>

          {/* 入力エリア */}
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 mb-3"
            placeholder="メモを入力..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={2}
          />

          {/* 保存ボタン */}
          <Pressable
            className="items-center justify-center p-4 rounded-xl bg-[#0a7ea4] active:opacity-80 mb-4"
            onPress={saveMemo}>
            <Text className="text-white text-base font-semibold">メモを保存</Text>
          </Pressable>

          {/* メモ件数 */}
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            保存済み: {memos.length}件
          </Text>

          {/* メモ一覧 */}
          {memos.length === 0 ? (
            <View className="items-center py-8">
              <IconSymbol name="externaldrive.fill" size={32} color="#9ca3af" />
              <Text className="mt-2 text-gray-400 dark:text-gray-500 text-sm">
                メモがありません
              </Text>
            </View>
          ) : (
            memos.map((memo) => (
              <View
                key={memo.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-3">
                    <Text className="text-base text-gray-900 dark:text-white">
                      {memo.text}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {memo.createdAt}
                    </Text>
                  </View>
                  <Pressable
                    className="p-2 active:opacity-60"
                    onPress={() => deleteMemo(memo.id)}>
                    <IconSymbol name="trash.fill" size={18} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
