import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { CartItemComponent } from '@/components/CartItem';
import { useCartStore } from '@/store/cart-store';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function CartScreen() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const shippingCost = subtotal > 0 ? 5.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Cần Đăng Nhập',
        'Vui lòng đăng nhập để tiếp tục thanh toán.',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Đăng Nhập', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.push('/checkout');
    }, 1000);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Xoá Giỏ Hàng',
      'Bạn có chắc muốn xoá tất cả sản phẩm trong giỏ hàng?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Xoá', style: 'destructive', onPress: () => clearCart() },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>
            Khám phá sản phẩm và thêm vào giỏ hàng của bạn
          </Text>
          <Button
            title="Mua sắm ngay"
            onPress={() => router.push('/')}
            style={styles.shopButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Giỏ Hàng</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>Xoá Tất Cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <CartItemComponent
            key={`${item.product.id}-${item.size}-${item.color}-${index}`}
            item={item}
          />
        ))}
      </ScrollView>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí giao hàng</Text>
          <Text style={styles.summaryValue}>${shippingCost.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Thuế (8%)</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <Button
          title="Tiến hành thanh toán"
          onPress={handleCheckout}
          fullWidth
          loading={isProcessing}
          style={styles.checkoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearText: {
    fontSize: 14,
    color: colors.error,
  },
  scrollContent: {
    padding: 16,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  checkoutButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    width: 200,
  },
});
