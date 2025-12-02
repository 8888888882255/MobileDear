import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Ticket,
  Copy,
  Clock,
  RotateCcw,
  Calendar,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

// Định nghĩa kiểu dữ liệu Voucher
interface Voucher {
  id: string;
  code: string;
  discount: string;
  minSpend: number;
  validUntil: string;
  isUsed: boolean;
  type: 'percent' | 'shipping' | 'fixed';
}

export default function VouchersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    const mockVouchers: Voucher[] = [
      {
        id: 'V001',
        code: 'WELCOME20',
        discount: '20%',
        minSpend: 50,
        validUntil: '2025-12-31',
        isUsed: false,
        type: 'percent',
      },
      {
        id: 'V002',
        code: 'FREESHIP',
        discount: 'Miễn phí vận chuyển',
        minSpend: 30,
        validUntil: '2025-11-30',
        isUsed: false,
        type: 'shipping',
      },
      {
        id: 'V003',
        code: 'SAVE10',
        discount: '100.000đ',
        minSpend: 100,
        validUntil: '2025-10-15',
        isUsed: false,
        type: 'fixed',
      },
      {
        id: 'V004',
        code: 'SUMMER5',
        discount: '50.000đ',
        minSpend: 20,
        validUntil: '2025-09-30',
        isUsed: true,
        type: 'fixed',
      },
    ];

    const timer = setTimeout(() => {
      setVouchers(mockVouchers);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const filteredVouchers = vouchers.filter(
    (v) => (activeTab === 'available' && !v.isUsed) || (activeTab === 'used' && v.isUsed)
  );

  const handleCopyCode = (code: string) => {
    Alert.alert('Đã sao chép', `Mã ${code} đã được sao chép!`);
  };

  const renderVoucherItem = ({ item }: { item: Voucher }) => (
    <View style={styles.voucherCard}>
      <View style={styles.voucherLeft}>
        <View
          style={[
            styles.discountBadge,
            item.type === 'shipping'
              ? styles.shippingBadge
              : item.type === 'fixed'
              ? styles.fixedBadge
              : styles.percentBadge,
          ]}
        >
          <Ticket size={16} color="#fff" />
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      </View>

      <View style={styles.voucherDivider}>
        <View style={styles.dividerCircle} />
        <View style={styles.dividerLine} />
        <View style={styles.dividerCircle} />
      </View>

      <View style={styles.voucherRight}>
        <Text style={styles.voucherCode}>{item.code}</Text>

        <View style={styles.voucherDetails}>
          <Text style={styles.voucherMinSpend}>Đơn tối thiểu: {item.minSpend}.000đ</Text>

          <View style={styles.voucherValidity}>
            <Calendar size={12} color={colors.textLight} />
            <Text style={styles.validityText}>
              Hạn: {new Date(item.validUntil).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>

        {activeTab === 'available' ? (
          <TouchableOpacity style={styles.copyButton} onPress={() => handleCopyCode(item.code)}>
            <Copy size={14} color={colors.primary} />
            <Text style={styles.copyText}>Sao chép mã</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.usedBadge}>
            <Text style={styles.usedText}>Đã sử dụng</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mã giảm giá của tôi</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/vouchers/history')}
        >
          <Clock size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.spinBanner}>
        <View style={styles.spinBannerContent}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1640158615573-cd28feb1bf4e?auto=format&fit=crop&w=500&q=60',
            }}
            style={styles.spinImage}
          />
          <View style={styles.spinTextContainer}>
            <Text style={styles.spinTitle}>Vòng quay may mắn</Text>
            <Text style={styles.spinSubtitle}>Thử vận may nhận voucher hấp dẫn!</Text>
            <Button title="Quay ngay" size="small" onPress={() => router.push('/vouchers/spin')} />
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Chưa dùng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'used' && styles.activeTab]}
          onPress={() => setActiveTab('used')}
        >
          <Text style={[styles.tabText, activeTab === 'used' && styles.activeTabText]}>
            Đã dùng
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải mã giảm giá...</Text>
        </View>
      ) : filteredVouchers.length > 0 ? (
        <FlatList
          data={filteredVouchers}
          renderItem={renderVoucherItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.vouchersList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ticket size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Không có mã nào</Text>
          <Text style={styles.emptyText}>Bạn chưa có mã giảm giá {activeTab === 'used' ? 'đã dùng' : 'chưa dùng'}.</Text>
          <TouchableOpacity
            style={styles.spinNowButton}
            onPress={() => router.push('/vouchers/spin')}
          >
            <RotateCcw size={16} color="#fff" />
            <Text style={styles.spinNowText}>Thử quay nhận mã</Text>
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
  historyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.primary + '10',
  },
  spinBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  spinImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  spinTextContainer: {
    flex: 1,
  },
  spinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  spinSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  spinButton: {
    alignSelf: 'flex-start',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
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
  vouchersList: {
    padding: 16,
    paddingTop: 0,
  },
  voucherCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    height: 120,
  },
  voucherLeft: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
  },
  discountBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  percentBadge: {
    backgroundColor: colors.primary,
  },
  fixedBadge: {
    backgroundColor: colors.secondary,
  },
  shippingBadge: {
    backgroundColor: colors.success,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
  },
  voucherDivider: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  dividerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    position: 'absolute',
  },
  dividerLine: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
    position: 'absolute',
    left: 10,
  },
  voucherRight: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  voucherDetails: {
    marginBottom: 8,
  },
  voucherMinSpend: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  voucherValidity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validityText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  copyText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  usedBadge: {
    backgroundColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  usedText: {
    fontSize: 12,
    color: colors.textLight,
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
  spinNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  spinNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});