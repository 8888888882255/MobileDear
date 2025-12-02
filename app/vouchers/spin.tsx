import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Gift, Info } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

const wheelSegments = [
  { id: 1, prize: 'Giảm 10%', color: '#FF6B6B', textColor: '#FFFFFF' },
  { id: 2, prize: 'Miễn phí vận chuyển', color: '#4ECDC4', textColor: '#FFFFFF' },
  { id: 3, prize: 'Giảm 5.000₫', color: '#FFD166', textColor: '#333333' },
  { id: 4, prize: 'Thử lại', color: '#F8F9FA', textColor: '#333333' },
  { id: 5, prize: 'Giảm 20%', color: '#6A0572', textColor: '#FFFFFF' },
  { id: 6, prize: 'Giảm 10.000₫', color: '#1A535C', textColor: '#FFFFFF' },
  { id: 7, prize: 'Thử lại', color: '#F8F9FA', textColor: '#333333' },
  { id: 8, prize: 'Giảm 5%', color: '#FF9F1C', textColor: '#FFFFFF' },
];

export default function SpinWheelScreen() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinsRemaining, setSpinsRemaining] = useState(3);
  const [lastPrize, setLastPrize] = useState<string | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);

  const handleSpin = () => {
    if (isSpinning || spinsRemaining <= 0) return;

    setIsSpinning(true);
    const randomSegment = Math.floor(Math.random() * wheelSegments.length);
    const segmentAngle = 360 / wheelSegments.length;
    const targetRotation =
      (3 + Math.floor(Math.random() * 3)) * 360 +
      randomSegment * segmentAngle +
      Math.random() * segmentAngle;

    Animated.timing(spinValue, {
      toValue: targetRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      setIsSpinning(false);
      setSpinsRemaining(prev => prev - 1);

      const normalizedRotation = targetRotation % 360;
      const segmentIndex = Math.floor(normalizedRotation / segmentAngle);
      const prize = wheelSegments[segmentIndex].prize;

      setLastPrize(prize);

      if (prize !== 'Thử lại') {
        Alert.alert(
          "Chúc mừng!",
          `Bạn đã nhận được ${prize}`,
          [{ text: "Nhận ngay", onPress: () => router.push('/vouchers') }]
        );
      } else {
        Alert.alert(
          "Rất tiếc!",
          "Bạn chưa trúng thưởng. Hãy thử lại nhé!",
          [{ text: "OK" }]
        );
      }
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  const renderWheelSegments = () => {
    return wheelSegments.map((segment, index) => {
      const angle = 360 / wheelSegments.length;
      const rotation = index * angle;
      return (
        <View
          key={segment.id}
          style={[
            styles.segment,
            {
              backgroundColor: segment.color,
              transform: [{ rotate: `${rotation}deg` }]
            }
          ]}
        >
          <Text style={[styles.segmentText, { color: segment.textColor }]}>
            {segment.prize}
          </Text>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vòng quay may mắn</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() =>
            Alert.alert(
              "Cách chơi",
              "Bạn có 3 lượt quay mỗi ngày. Quay để nhận các phần quà hấp dẫn!"
            )
          }
        >
          <Info size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.spinInfo}>
          <Text style={styles.spinTitle}>Thử vận may!</Text>
          <Text style={styles.spinSubtitle}>
            Quay vòng để nhận ngay ưu đãi cực hấp dẫn!
          </Text>
          <Text style={styles.spinsRemaining}>
            Lượt quay còn lại: <Text style={styles.spinsCount}>{spinsRemaining}</Text>
          </Text>
        </View>

        <View style={styles.wheelContainer}>
          <View style={styles.wheelMarker} />

          <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
            {renderWheelSegments()}
          </Animated.View>

          <View style={styles.wheelCenter}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1596367407372-96cb88503db6?auto=format&fit=crop&w=500&q=60' }}
              style={styles.wheelLogo}
            />
          </View>
        </View>

        <Button
          title={isSpinning ? "Đang quay..." : "Quay ngay"}
          onPress={handleSpin}
          disabled={isSpinning || spinsRemaining <= 0}
          style={styles.spinButton}
        />

        {lastPrize && (
          <View style={styles.lastPrizeContainer}>
            <Text style={styles.lastPrizeLabel}>Kết quả lượt quay:</Text>
            <Text style={styles.lastPrizeValue}>{lastPrize}</Text>
          </View>
        )}

        {spinsRemaining <= 0 && (
          <View style={styles.noSpinsContainer}>
            <Gift size={20} color={colors.primary} />
            <Text style={styles.noSpinsText}>
              Bạn đã dùng hết lượt quay hôm nay. Hãy quay lại vào ngày mai nhé!
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/vouchers/history')}
        >
          <Text style={styles.historyButtonText}>Xem lịch sử trúng thưởng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  spinInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  spinTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  spinSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  spinsRemaining: {
    fontSize: 14,
    color: colors.text,
  },
  spinsCount: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  wheelContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  wheel: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#333',
  },
  segment: {
    position: 'absolute',
    width: 300,
    height: 300,
    transform: [{ translateY: 150 }],
    transformOrigin: 'center bottom',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: 'bold',
    transform: [{ rotate: '180deg' }],
  },
  wheelCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    zIndex: 10,
  },
  wheelLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  wheelMarker: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.primary,
    zIndex: 20,
  },
  spinButton: {
    marginTop: 24,
    width: 200,
  },
  lastPrizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  lastPrizeLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: 8,
  },
  lastPrizeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  noSpinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noSpinsText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  historyButton: {
    marginTop: 24,
    padding: 8,
  },
  historyButtonText: {
    fontSize: 14,
    color: colors.primary,
  },
});