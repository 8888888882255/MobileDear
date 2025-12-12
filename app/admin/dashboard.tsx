import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router'; // ĐÃ SỬA: chỉ import 1 lần
import { 
  Package, 
  Users, 
  ShoppingBag, 
  Settings,
  MessageSquare 
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, isLoading } = useUserStore();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  // Bảo vệ route: chỉ admin mới được vào
  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }
  
  const stats = [
    { title: 'Tổng đánh giá', value: '156', icon: MessageSquare , color: colors.primary },
    { title: 'Tổng sản phẩm', value: '48', icon: ShoppingBag, color: '#4CAF50' },
    { title: 'Tổng người dùng', value: '1.254', icon: Users, color: '#2196F3' },
    { title: 'Danh mục', value: '12', icon: Package, color: '#FF9800' },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quản trị hệ thống</Text>
        </View>
        
        {/* Hành động nhanh */}
        <View style={styles.sectionContainer}>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/products')}
            >
              <ShoppingBag size={28} color={colors.primary} />
              <Text style={styles.actionText}>Sản phẩm</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/categorys')}
            >
              <Package size={28} color={colors.primary} />
              <Text style={styles.actionText}>Danh mục</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/users')}
            >
              <Users size={28} color={colors.primary} />
              <Text style={styles.actionText}>Người dùng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/comments')}
            >
              <MessageSquare  size={28} color={colors.primary} />
              <Text style={styles.actionText}>Đánh giá</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/settings')}
            >
              <Settings size={28} color={colors.primary} />
              <Text style={styles.actionText}>Cài đặt</Text>
            </TouchableOpacity>
          </View>
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
    padding: 16,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});