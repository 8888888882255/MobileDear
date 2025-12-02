import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Package, Search } from 'lucide-react-native';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

type Order = {
  id: string;
  date: string;
  total: number;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  items: number;
};

const mockOrders: Order[] = [
  { id: 'ORD-123456', date: '2023-06-15', total: 129.99, status: 'delivered', items: 3 },
  { id: 'ORD-123457', date: '2023-06-02', total: 79.5, status: 'shipped', items: 2 },
  { id: 'ORD-123458', date: '2023-05-28', total: 45.99, status: 'processing', items: 1 },
  { id: 'ORD-123459', date: '2023-05-15', total: 199.99, status: 'delivered', items: 4 },
  { id: 'ORD-123460', date: '2023-05-10', total: 59.99, status: 'delivered', items: 1 },
  { id: 'ORD-123461', date: '2023-04-28', total: 149.99, status: 'cancelled', items: 2 }
];

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${item.id}` as `/orders/${string}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{item.id}</Text>
        <OrderStatusBadge status={item.status} />
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Ngày:</Text>
          <Text style={styles.orderValue}>{new Date(item.date).toLocaleDateString('vi-VN')}</Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Sản phẩm:</Text>
          <Text style={styles.orderValue}>{item.items}</Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Tổng tiền:</Text>
          <Text style={styles.orderValue}>{item.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
        <ChevronRight size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as typeof activeTab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {{
                  all: 'Tất cả',
                  processing: 'Đang xử lý',
                  shipped: 'Đã gửi',
                  delivered: 'Đã giao',
                  cancelled: 'Đã hủy'
                }[tab]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Package size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Không có đơn hàng</Text>
          <Text style={styles.emptyText}>
            Bạn chưa có đơn hàng nào {activeTab !== 'all' ? {
              processing: 'đang xử lý',
              shipped: 'đã gửi',
              delivered: 'đã giao',
              cancelled: 'đã hủy'
            }[activeTab] : ''}.
          </Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
            <Text style={styles.shopButtonText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      )}
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
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderLabel: {
    width: 60,
    fontSize: 14,
    color: colors.textLight,
  },
  orderValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
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
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});