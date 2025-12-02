import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CheckCircle,
  Package,
  ChevronRight,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';

export default function OrderConfirmationScreen() {
  const router = useRouter();

  const orderNumber = `DH-${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    return () => {
      // Không làm gì khi unmount để tránh quay lại checkout
    };
  }, []);

  const handleViewOrder = () => {
    router.replace(`/orders/${orderNumber}`);
  };

  const handleContinueShopping = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={colors.success} />
          <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
          <Text style={styles.successMessage}>
            Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Chúng tôi sẽ gửi email xác nhận trong thời gian sớm nhất.
          </Text>
        </View>

        <View style={styles.orderInfoContainer}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Mã đơn hàng:</Text>
            <Text style={styles.orderInfoValue}>{orderNumber}</Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Ngày đặt:</Text>
            <Text style={styles.orderInfoValue}>
              {new Date().toLocaleDateString('vi-VN')}
            </Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Thanh toán:</Text>
            <Text style={styles.orderInfoValue}>Thẻ tín dụng</Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Vận chuyển:</Text>
            <Text style={styles.orderInfoValue}>Giao hàng tiêu chuẩn</Text>
          </View>
        </View>

        <View style={styles.nextStepsContainer}>
          <Text style={styles.nextStepsTitle}>Tiếp theo là gì?</Text>

          <View style={styles.stepCard}>
            <View style={styles.stepIconContainer}>
              <Package size={24} color={colors.primary} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Đang xử lý đơn hàng</Text>
              <Text style={styles.stepDescription}>
                Chúng tôi đang chuẩn bị hàng cho bạn. Bạn sẽ nhận được thông báo khi đơn hàng được gửi đi.
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            title="Xem đơn hàng"
            onPress={handleViewOrder}
            fullWidth
            style={styles.viewOrderButton}
          />

          <Button
            title="Tiếp tục mua sắm"
            onPress={handleContinueShopping}
            variant="outline"
            fullWidth
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scrollContent: {
    padding: 24,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  orderInfoContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  nextStepsContainer: {
    marginBottom: 32,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  buttonsContainer: {
    marginTop: 16,
  },
  viewOrderButton: {
    marginBottom: 12,
  },
  continueButton: {
    marginBottom: 24,
  },
});
