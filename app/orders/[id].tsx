import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  Share2,
} from 'lucide-react-native';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';

// Define types for order data
interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Shipping {
  method: string;
  cost: number;
  address: Address;
  tracking: string;
}

interface Payment {
  method: string;
  last4?: string;
  email?: string;
  subtotal: number;
  tax: number;
  total: number;
}

interface TimelineEvent {
  status: string;
  date: string;
  description: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  shipping: Shipping;
  payment: Payment;
  timeline: TimelineEvent[];
}

// Mock order details
const mockOrderDetails: { [key: string]: Order } = {
  'ORD-123456': {
    id: 'ORD-123456',
    date: '2023-06-15',
    status: 'delivered',
    items: [
      {
        id: 'P001',
        name: 'Áo Thun Cotton',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60',
        price: 29.99,
        quantity: 2,
        color: 'Xanh Dương',
        size: 'M',
      },
      {
        id: 'P002',
        name: 'Quần Jeans Ôm',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=60',
        price: 49.99,
        quantity: 1,
        color: 'Xanh Đậm',
        size: '32',
      },
      {
        id: 'P003',
        name: 'Dây Lưng Da',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=60',
        price: 19.99,
        quantity: 1,
        color: 'Nâu',
        size: 'One Size',
      },
    ],
    shipping: {
      method: 'Giao Hàng Tiêu Chuẩn',
      cost: 5.99,
      address: {
        name: 'John Doe',
        street: '123 Đường Chính',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'Hoa Kỳ',
      },
      tracking: 'TRK123456789US',
    },
    payment: {
      method: 'Thẻ Tín Dụng',
      last4: '4242',
      subtotal: 129.96,
      tax: 10.4,
      total: 146.35,
    },
    timeline: [
      {
        status: 'ordered',
        date: '2023-06-15T10:30:00Z',
        description: 'Đơn hàng đã đặt',
      },
      {
        status: 'processing',
        date: '2023-06-15T14:45:00Z',
        description: 'Thanh toán đã xác nhận',
      },
      {
        status: 'shipped',
        date: '2023-06-16T09:15:00Z',
        description: 'Đơn hàng đã giao',
      },
      {
        status: 'delivered',
        date: '2023-06-18T13:20:00Z',
        description: 'Đơn hàng đã giao đến',
      },
    ],
  },
  'ORD-123457': {
    id: 'ORD-123457',
    date: '2023-06-02',
    status: 'shipped',
    items: [
      {
        id: 'P004',
        name: 'Giày Chạy Bộ',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60',
        price: 59.99,
        quantity: 1,
        color: 'Đen/Đỏ',
        size: '42',
      },
      {
        id: 'P005',
        name: 'Tất Thể Thao (3 Đôi)',
        image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=500&q=60',
        price: 12.99,
        quantity: 1,
        color: 'Hỗn Hợp',
        size: 'M',
      },
    ],
    shipping: {
      method: 'Giao Hàng Nhanh',
      cost: 12.99,
      address: {
        name: 'John Doe',
        street: '123 Đường Chính',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'Hoa Kỳ',
      },
      tracking: 'TRK987654321US',
    },
    payment: {
      method: 'PayPal',
      email: 'john.doe@example.com',
      subtotal: 72.98,
      tax: 5.84,
      total: 91.81,
    },
    timeline: [
      {
        status: 'ordered',
        date: '2023-06-02T15:20:00Z',
        description: 'Đơn hàng đã đặt',
      },
      {
        status: 'processing',
        date: '2023-06-02T15:45:00Z',
        description: 'Thanh toán đã xác nhận',
      },
      {
        status: 'shipped',
        date: '2023-06-03T10:30:00Z',
        description: 'Đơn hàng đã giao',
      },
    ],
  },
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch order details
    const timer = setTimeout(() => {
      // Handle id as string or first element of string array
      const orderId = Array.isArray(id) ? id[0] : id;
      const orderData = mockOrderDetails[orderId] || null;
      setOrder(orderData);
      setIsLoading(false);

      if (!orderData) {
        Alert.alert(
          'Không Tìm Thấy Đơn Hàng',
          'Đơn hàng bạn đang tìm không tồn tại.',
          [{ text: 'Quay Lại', onPress: () => router.back() }],
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  const handleTrackOrder = () => {
    if (order?.shipping?.tracking) {
      Alert.alert(
        'Theo Dõi Đơn Hàng',
        `Mã theo dõi: ${order.shipping.tracking}`,
        [{ text: 'OK' }],
      );
    }
  };

  const handleContactSupport = () => {
    router.push('/contact');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return null; // Will redirect in useEffect
  }

  const calculateSubtotal = () => {
    return order.items.reduce(
      (total: number, item: OrderItem) => total + item.price * item.quantity,
      0,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderDate}>
              Đặt ngày {new Date(order.date).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <OrderStatusBadge status={order.status as 'shipped' | 'pending' | 'processing' | 'delivered' | 'cancelled'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dòng Thời Gian Đơn Hàng</Text>

          <View style={styles.timeline}>
            {order.timeline.map((event: TimelineEvent, index: number) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index < order.timeline.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {new Date(event.date).toLocaleString('vi-VN')}
                  </Text>
                  <Text style={styles.timelineDescription}>{event.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {order.status === 'shipped' && (
            <Button
              title="Theo Dõi Đơn Hàng"
              onPress={handleTrackOrder}
              style={styles.trackButton}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản Phẩm</Text>

          {order.items.map((item: OrderItem, index: number) => (
            <View
              key={item.id}
              style={[styles.itemCard, index < order.items.length - 1 && styles.itemCardBorder]}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemMetaText}>Màu: {item.color}</Text>
                  <Text style={styles.itemMetaText}>Kích cỡ: {item.size}</Text>
                </View>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Giao Hàng</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MapPin size={20} color={colors.primary} />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Địa Chỉ Giao Hàng</Text>
              <Text style={styles.infoText}>{order.shipping.address.name}</Text>
              <Text style={styles.infoText}>{order.shipping.address.street}</Text>
              <Text style={styles.infoText}>
                {order.shipping.address.city}, {order.shipping.address.state}{' '}
                {order.shipping.address.zipCode}
              </Text>
              <Text style={styles.infoText}>{order.shipping.address.country}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Package size={20} color={colors.primary} />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Phương Thức Giao Hàng</Text>
              <Text style={styles.infoText}>{order.shipping.method}</Text>
              {order.shipping.tracking && (
                <Text style={styles.infoText}>Mã theo dõi: {order.shipping.tracking}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Thanh Toán</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <CreditCard size={20} color={colors.primary} />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Phương Thức Thanh Toán</Text>
              <Text style={styles.infoText}>
                {order.payment.method}
                {order.payment.last4 && ` (**** **** **** ${order.payment.last4})`}
                {order.payment.email && ` (${order.payment.email})`}
              </Text>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm Tính</Text>
              <Text style={styles.summaryValue}>
                ${order.payment.subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí Giao Hàng</Text>
              <Text style={styles.summaryValue}>
                ${order.shipping.cost.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thuế</Text>
              <Text style={styles.summaryValue}>${order.payment.tax.toFixed(2)}</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng Cộng</Text>
              <Text style={styles.totalValue}>${order.payment.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.supportSection}>
          <Text style={styles.supportText}>Cần trợ giúp với đơn hàng của bạn?</Text>
          <Button
            title="Liên Hệ Hỗ Trợ"
            variant="outline"
            onPress={handleContactSupport}
            style={styles.supportButton}
          />
        </View>
      </ScrollView>
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
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: colors.textLight,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  timeline: {
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginRight: 12,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 20,
    bottom: -20,
    width: 2,
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: colors.text,
  },
  trackButton: {
    marginTop: 8,
  },
  itemCard: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  itemCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  itemMeta: {
    marginBottom: 8,
  },
  itemMetaText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.textLight,
  },
  infoCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  summaryContainer: {
    marginTop: 16,
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
  supportSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  supportText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  supportButton: {
    width: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
});