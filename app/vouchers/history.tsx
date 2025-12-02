import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Gift, Calendar, Check, X } from 'lucide-react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

type VoucherHistoryItem = {
  id: string;
  date: string;
  prize: string;
  code: string | null;
  status: 'claimed' | 'used' | 'expired' | 'lost';
  source: string;
};

const mockVoucherHistory: VoucherHistoryItem[] = [
  { id: 'H001', date: '2023-06-15', prize: 'Giảm 20%', code: 'WELCOME20', status: 'claimed', source: 'spin' },
  { id: 'H002', date: '2023-06-10', prize: 'Miễn phí vận chuyển', code: 'FREESHIP', status: 'claimed', source: 'spin' },
  { id: 'H003', date: '2023-06-05', prize: 'Thử lại lần nữa', code: null, status: 'lost', source: 'spin' },
  { id: 'H004', date: '2023-05-28', prize: 'Giảm 5k', code: 'SAVE5', status: 'expired', source: 'spin' },
  { id: 'H005', date: '2023-05-20', prize: 'Giảm 10%', code: 'SPIN10', status: 'used', source: 'spin' },
  { id: 'H006', date: '2023-05-15', prize: 'Thử lại lần nữa', code: null, status: 'lost', source: 'spin' },
];

export default function VoucherHistoryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const [history, setHistory] = useState<VoucherHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    const timer = setTimeout(() => {
      setHistory(mockVoucherHistory);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const getStatusColor = (status: VoucherHistoryItem['status']) => {
    switch (status) {
      case 'claimed':
        return colors.primary;
      case 'used':
        return colors.success;
      case 'expired':
        return colors.textLight;
      case 'lost':
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  const getStatusIcon = (status: VoucherHistoryItem['status']) => {
    switch (status) {
      case 'claimed':
      case 'used':
        return <Check size={16} color="#fff" />;
      case 'expired':
      case 'lost':
        return <X size={16} color="#fff" />;
      default:
        return null;
    }
  };

  const renderHistoryItem = ({ item }: { item: VoucherHistoryItem }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={colors.textLight} />
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {getStatusIcon(item.status)}
          <Text style={styles.statusText}>
            {{
              claimed: 'Đã nhận',
              used: 'Đã dùng',
              expired: 'Hết hạn',
              lost: 'Thua',
            }[item.status]}
          </Text>
        </View>
      </View>

      <View style={styles.historyContent}>
        <View style={styles.prizeContainer}>
          <Gift size={20} color={colors.primary} />
          <Text style={styles.prizeText}>{item.prize}</Text>
        </View>

        {item.code && (
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Mã:</Text>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
        )}
      </View>

      <View style={styles.sourceContainer}>
        <Text style={styles.sourceText}>
          Nguồn: {item.source === 'spin' ? 'Vòng quay may mắn' : item.source}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử voucher</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Gift size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
          <Text style={styles.emptyText}>Bạn chưa nhận được voucher nào. Hãy thử vận may!</Text>
          <TouchableOpacity
            style={styles.spinButton}
            onPress={() => router.push('/vouchers/spin')}
          >
            <Text style={styles.spinButtonText}>Đi đến vòng quay may mắn</Text>
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
  placeholder: {
    width: 40,
  },
  historyList: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  historyContent: {
    marginBottom: 12,
  },
  prizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prizeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: 8,
    borderRadius: 4,
  },
  codeLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: 8,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  sourceContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  sourceText: {
    fontSize: 14,
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
  spinButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
