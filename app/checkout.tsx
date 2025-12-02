import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  CreditCard,
  Truck,
  Check,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { CartItemComponent } from '@/components/CartItem';
import { useCartStore } from '@/store/cart-store';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useUserStore();

  const [selectedAddress, setSelectedAddress] = useState(
    user?.addresses.find(addr => addr.isDefault) || user?.addresses[0]
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const shippingCost = selectedShippingMethod === 'express' ? 29000 : 15000;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert('Lỗi', 'Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      router.replace('/order-confirmation');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Địa chỉ giao hàng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          </View>

          {user?.addresses.length ? (
            <>
              {user.addresses.map(address => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressCard,
                    selectedAddress?.id === address.id && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedAddress(address)}
                >
                  <View style={styles.addressContent}>
                    <Text style={styles.addressName}>{address.name}</Text>
                    <Text style={styles.addressText}>
                      {address.street}, {address.city}, {address.state} {address.zipCode}
                    </Text>
                    <Text style={styles.addressText}>{address.country}</Text>
                  </View>

                  {selectedAddress?.id === address.id && (
                    <View style={styles.selectedIndicator}>
                      <Check size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/addresses/new')}
              >
                <Text style={styles.addButtonText}>+ Thêm địa chỉ mới</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Bạn chưa có địa chỉ nào</Text>
              <Button
                title="Thêm địa chỉ"
                onPress={() => router.push('/addresses/new')}
                size="small"
                style={styles.emptyButton}
              />
            </View>
          )}
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>

          {[
            { key: 'credit_card', label: 'Thẻ tín dụng', desc: 'Thanh toán bằng Visa, Mastercard...' },
            { key: 'paypal', label: 'PayPal', desc: 'Thanh toán qua tài khoản PayPal' },
            { key: 'cash', label: 'Thanh toán khi nhận hàng', desc: 'Trả tiền khi nhận được hàng' },
          ].map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionCard,
                selectedPaymentMethod === option.key && styles.selectedCard,
              ]}
              onPress={() => setSelectedPaymentMethod(option.key)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.desc}</Text>
              </View>
              {selectedPaymentMethod === option.key && (
                <View style={styles.selectedIndicator}>
                  <Check size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Phương thức vận chuyển */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Phương thức giao hàng</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedShippingMethod === 'standard' && styles.selectedCard,
            ]}
            onPress={() => setSelectedShippingMethod('standard')}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Giao hàng tiêu chuẩn</Text>
              <Text style={styles.optionDescription}>3-5 ngày làm việc</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionPrice}>15.000đ</Text>
              {selectedShippingMethod === 'standard' && (
                <View style={styles.selectedIndicator}>
                  <Check size={16} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedShippingMethod === 'express' && styles.selectedCard,
            ]}
            onPress={() => setSelectedShippingMethod('express')}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Giao hàng nhanh</Text>
              <Text style={styles.optionDescription}>1-2 ngày làm việc</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionPrice}>29.000đ</Text>
              {selectedShippingMethod === 'express' && (
                <View style={styles.selectedIndicator}>
                  <Check size={16} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Tóm tắt đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>

          <View style={styles.orderItems}>
            {items.map((item, index) => (
              <CartItemComponent
                key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                item={item}
              />
            ))}
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{subtotal.toLocaleString()}đ</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>{shippingCost.toLocaleString()}đ</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thuế (8%)</Text>
              <Text style={styles.summaryValue}>{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}đ</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}đ</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Nút đặt hàng */}
      <View style={styles.bottomContainer}>
        <Button
          title="Đặt hàng"
          onPress={handlePlaceOrder}
          fullWidth
          loading={isProcessing}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  optionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  optionRight: {
    alignItems: 'flex-end',
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  orderItems: {
    marginTop: 12,
    marginBottom: 16,
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
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
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  emptySection: {
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  emptyButton: {
    minWidth: 120,
  },
});