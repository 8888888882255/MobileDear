import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Package, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  ChevronRight,
  BarChart4,
  Settings
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }
  
  const stats = [
    { title: 'Total Orders', value: '156', icon: Package, color: colors.primary },
    { title: 'Total Products', value: '48', icon: ShoppingBag, color: '#4CAF50' },
    { title: 'Total Users', value: '1,254', icon: Users, color: '#2196F3' },
    { title: 'Total Revenue', value: '$12,458', icon: DollarSign, color: '#FF9800' },
  ];
  
  const recentOrders = [
    { id: '1', customer: 'John Doe', date: '2023-06-15', total: '$129.99', status: 'delivered' },
    { id: '2', customer: 'Jane Smith', date: '2023-06-14', total: '$89.50', status: 'shipped' },
    { id: '3', customer: 'Robert Johnson', date: '2023-06-13', total: '$245.00', status: 'processing' },
    { id: '4', customer: 'Emily Davis', date: '2023-06-12', total: '$67.25', status: 'pending' },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {user?.name}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </Card>
          ))}
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/products')}
            >
              <ShoppingBag size={24} color={colors.primary} />
              <Text style={styles.actionText}>Sản Phẩm</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/categorys')}
            >
              <Package size={24} color={colors.primary} />
              <Text style={styles.actionText}>Danh Mục</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/users')}
            >
              <Users size={24} color={colors.primary} />
              <Text style={styles.actionText}>Manage Users</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/comments')}
            >
              <BarChart4 size={24} color={colors.primary} />
              <Text style={styles.actionText}>Bình Luận</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/settings')}
            >
              <Settings size={24} color={colors.primary} />
              <Text style={styles.actionText}>Giao diện</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/admin/orders')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <Card style={styles.ordersCard}>
            {recentOrders.map((order, index) => (
              <TouchableOpacity 
                key={order.id}
                style={[
                  styles.orderItem,
                  index < recentOrders.length - 1 && styles.orderItemBorder
                ]}
                onPress={() => router.push(`/order/${order.id}`)}
              >
                <View>
                  <Text style={styles.orderCustomer}>{order.customer}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>{order.total}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sales Overview</Text>
          </View>
          
          <Card style={styles.chartCard}>
            <View style={styles.chartPlaceholder}>
              <TrendingUp size={48} color={colors.primary} />
              <Text style={styles.chartText}>Sales Chart</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return colors.pending;
    case 'processing':
      return colors.processing;
    case 'shipped':
      return colors.shipped;
    case 'delivered':
      return colors.success;
    case 'cancelled':
      return colors.error;
    default:
      return colors.textLight;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  ordersCard: {
    padding: 0,
    overflow: 'hidden',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: colors.textLight,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  chartCard: {
    padding: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  chartText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textLight,
  },
});