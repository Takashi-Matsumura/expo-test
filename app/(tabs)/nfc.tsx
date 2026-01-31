// NFC画面 - FeliCaカードリーダー
import { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Alert, ScrollView, NativeModules } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

// Expo Goではネイティブモジュールが存在しないため、動的に読み込む
const hasNfc = !!NativeModules.NfcManager;
const NfcManager = hasNfc ? require('react-native-nfc-manager').default : null;
const NfcTech = hasNfc ? require('react-native-nfc-manager').NfcTech : {};

// システムコードの説明
function getSystemCodeLabel(code: string): string {
  const labels: Record<string, string> = {
    '0003': '交通系IC',
    '88B4': '交通系IC（独自領域）',
    '8005': 'FeliCa Standard',
    '8008': 'FeliCa Lite',
    FE00: 'FeliCa Lite-S / NDEF',
    '12FC': 'PASPY等',
  };
  return labels[code.toUpperCase()] ?? '不明';
}

interface CardData {
  idm: string;
  systemCode: string;
  tech: string;
}

export default function NfcScreen() {
  const [scanning, setScanning] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nfcReady, setNfcReady] = useState(false);

  // NFCマネージャーの初期化
  useEffect(() => {
    if (!hasNfc) {
      setError('NFCモジュールが利用できません。開発ビルド（Xcode）で実行してください。');
      return;
    }

    async function init() {
      try {
        const supported = await NfcManager.isSupported();
        if (!supported) {
          setError('このデバイスはNFCに対応していません');
          return;
        }
        await NfcManager.start();
        setNfcReady(true);
      } catch (ex: any) {
        setError(`NFC初期化エラー: ${ex?.message ?? ex}`);
      }
    }
    init();

    return () => {
      NfcManager?.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const startScan = useCallback(async () => {
    if (!nfcReady) {
      Alert.alert('エラー', 'NFCの初期化が完了していません。');
      return;
    }

    setScanning(true);
    setCardData(null);
    setError(null);

    try {
      const techs = [NfcTech.FelicaIOS, NfcTech.MifareIOS, NfcTech.Iso15693IOS, NfcTech.IsoDep];
      const detectedTech = await NfcManager.requestTechnology(techs, {
        alertMessage: 'カードをiPhone上部にかざしてください',
      });

      const tag = await NfcManager.getTag();
      if (!tag) {
        throw new Error('カードを読み取れませんでした');
      }

      const idm = (tag as any).idm ?? tag.id ?? '';
      const systemCode = (tag as any).systemCode ?? '';

      setCardData({
        idm,
        systemCode,
        tech: String(detectedTech),
      });
    } catch (ex: any) {
      const msg = ex?.message ?? ex?.toString?.() ?? '不明なエラー';
      if (msg.includes('cancelled') || msg.includes('canceled') || msg.includes('UserCancel')) {
        // ユーザーキャンセルは無視
      } else {
        setError(msg);
      }
    } finally {
      NfcManager?.cancelTechnologyRequest().catch(() => {});
      setScanning(false);
    }
  }, [nfcReady]);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-5 pt-16">
        {/* 画面タイトル */}
        <Text className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          NFC カードリーダー
        </Text>
        <Text className="mb-6 text-gray-500 dark:text-gray-400">
          FeliCaカードをかざしてIDmを読み取ります
        </Text>

        {/* スキャンボタン */}
        <Pressable
          className={`flex-row items-center justify-center gap-3 p-5 rounded-xl mb-6 ${
            scanning || !nfcReady ? 'bg-gray-400' : 'bg-[#FF6D00] active:opacity-80'
          }`}
          onPress={startScan}
          disabled={scanning || !nfcReady}>
          <IconSymbol name="wave.3.right" size={28} color="#fff" />
          <Text className="text-white text-xl font-semibold">
            {scanning ? 'スキャン中...' : 'スキャン開始'}
          </Text>
        </Pressable>

        {/* エラー表示 */}
        {error && (
          <View className="p-4 rounded-xl mb-4 bg-red-100 dark:bg-red-900/30">
            <Text className="text-red-700 dark:text-red-300 font-semibold mb-1">
              エラー
            </Text>
            <Text className="text-red-600 dark:text-red-400">{error}</Text>
          </View>
        )}

        {/* カード情報表示 */}
        {cardData && (
          <View className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* カードヘッダー */}
            <View className="bg-[#2E7D32] p-5">
              <Text className="text-white text-sm opacity-80">
                {getSystemCodeLabel(cardData.systemCode)}
              </Text>
              <Text className="text-white text-2xl font-bold mt-1">
                カード読み取り完了
              </Text>
            </View>

            {/* カード詳細 */}
            <View className="p-5 gap-4">
              {/* IDm */}
              <View>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  IDm（製造ID）
                </Text>
                <Text className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {cardData.idm}
                </Text>
              </View>

              {/* システムコード */}
              <View>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  システムコード
                </Text>
                <Text className="text-base font-mono text-gray-900 dark:text-white">
                  {cardData.systemCode || '—'}{' '}
                  <Text className="text-gray-500">
                    ({getSystemCodeLabel(cardData.systemCode)})
                  </Text>
                </Text>
              </View>

              {/* 検出技術 */}
              <View>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  検出技術
                </Text>
                <Text className="text-base font-mono text-gray-900 dark:text-white">
                  {cardData.tech}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 使い方 */}
        {!cardData && !error && !scanning && (
          <View className="items-center mt-10 gap-4">
            <IconSymbol name="wave.3.right" size={64} color="#ccc" />
            <Text className="text-gray-400 text-center text-base">
              「スキャン開始」をタップして{'\n'}カードをiPhone上部にかざしてください
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
