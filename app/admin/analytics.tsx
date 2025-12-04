import React, { useState } from 'react';
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
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Eye,
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';



interface Metric {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: any;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  views: number;
  rating: number;
}

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }
  
  const metrics: Metric[] = [
    {
      title: 'Total Revenue',
      value: '$45,234',
      change: 12.5,
      changeLabel: 'vs last month',
      icon: DollarSign,
      color: '#4CAF50'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: 8.3,
      changeLabel: 'vs last month',
      icon: ShoppingBag,
      color: colors.primary
    },
    {
      title: 'New Customers',
      value: '342',
      change: -3.2,
      changeLabel: 'vs last month',
      icon: Users,
      color: '#2196F3'
    },
    {
      title: 'Avg Order Value',
      value: '$67.45',
      change: 5.7,
      changeLabel: 'vs last month',
      icon: Package,
      color: '#FF9800'
    }
  ];
  
  const revenueData: ChartData[] = [
    { label: 'Mon', value: 4200 },
    { label: 'Tue', value: 5800 },
    { label: 'Wed', value: 4500 },
    { label: 'Thu', value: 7200 },
    { label: 'Fri', value: 8900 },
    { label: 'Sat', value: 6300 },
    { label: 'Sun', value: 5100 }
  ];
  
  const ordersData: ChartData[] = [
    { label: 'Mon', value: 65 },
    { label: 'Tue', value: 89 },
    { label: 'Wed', value: 72 },
    { label: 'Thu', value: 105 },
    { label: 'Fri', value: 134 },
    { label: 'Sat', value: 98 },
    { label: 'Sun', value: 81 }
  ];
  
  const categoryData: ChartData[] = [
    { label: 'Electronics', value: 35 },
    { label: 'Fashion', value: 28 },
    { label: 'Home', value: 18 },
    { label: 'Sports', value: 12 },
    { label: 'Beauty', value: 7 }
  ];
  
  const topProducts: ProductPerformance[] = [
    { 
      id: '1', 
      name: 'Wireless Headphones', 
      revenue: 12450, 
      orders: 156, 
      views: 3420,
      rating: 4.8
    },
    { 
      id: '2', 
      name: 'Smart Watch', 
      revenue: 9800, 
      orders: 98, 
      views: 2890,
      rating: 4.6
    },
    { 
      id: '3', 
      name: 'Running Shoes', 
      revenue: 8200, 
      orders: 164, 
      views: 2560,
      rating: 4.7
    },
    { 
      id: '4', 
      name: 'Laptop Backpack', 
      revenue: 5600, 
      orders: 112, 
      views: 1890,
      rating: 4.5
    },
    { 
      id: '5', 
      name: 'Bluetooth Speaker', 
      revenue: 4900, 
      orders: 98, 
      views: 1650,
      rating: 4.9
    }
  ];
  
  const customerSegments = [
    { label: 'New', value: 42, color: '#4CAF50' },
    { label: 'Returning', value: 38, color: colors.primary },
    { label: 'VIP', value: 20, color: '#FF9800' }
  ];
  
  const maxRevenueValue = Math.max(...revenueData.map(d => d.value));
  const maxOrdersValue = Math.max(...ordersData.map(d => d.value));
  const maxCategoryValue = Math.max(...categoryData.map(d => d.value));
  
  const renderMetricCard = (metric: Metric, index: number) => {
    const isPositive = metric.change >= 0;
    const Icon = metric.icon;
    const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    
    return (
      <Card key={index} style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <View style={[styles.iconContainer, { backgroundColor: metric.color + '20' }]}>
            <Icon size={20} color={metric.color} />
          </View>
          <View style={[
            styles.changeContainer,
            { backgroundColor: isPositive ? '#4CAF5020' : '#FF5A5A20' }
          ]}>
            <ChangeIcon 
              size={14} 
              color={isPositive ? '#4CAF50' : '#FF5A5A'} 
            />
            <Text style={[
              styles.changeText,
              { color: isPositive ? '#4CAF50' : '#FF5A5A' }
            ]}>
              {Math.abs(metric.change)}%
            </Text>
          </View>
        </View>
        <Text style={styles.metricValue}>{metric.value}</Text>
        <Text style={styles.metricTitle}>{metric.title}</Text>
        <Text style={styles.metricChange}>{metric.changeLabel}</Text>
      </Card>
    );
  };
  
  const renderBarChart = (data: ChartData[], maxValue: number, color: string) => {
    const chartHeight = 120;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  <Text style={styles.barValue}>
                    {item.value > 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                  </Text>
                  <View 
                    style={[
                      styles.bar,
                      { 
                        height: barHeight,
                        backgroundColor: color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  const renderHorizontalBarChart = (data: ChartData[], maxValue: number) => {
    return (
      <View style={styles.horizontalChartContainer}>
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * 100;
          const colors_1 = ['#4CAF50', colors.primary, '#2196F3', '#FF9800', '#F44336'];
          
          return (
            <View key={index} style={styles.horizontalBarWrapper}>
              <Text style={styles.horizontalBarLabel}>{item.label}</Text>
              <View style={styles.horizontalBarContainer}>
                <View 
                  style={[
                    styles.horizontalBar,
                    { 
                      width: `${barWidth}%`,
                      backgroundColor: colors_1[index % colors_1.length]
                    }
                  ]} 
                />
              </View>
              <Text style={styles.horizontalBarValue}>{item.value}%</Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  const renderDonutChart = (data: typeof customerSegments) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <View style={styles.donutContainer}>
        <View style={styles.donutCenter}>
          <Text style={styles.donutTotal}>{total}%</Text>
          <Text style={styles.donutLabel}>Customers</Text>
        </View>
        <View style={styles.donutLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>{item.value}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Performance Overview</Text>
          </View>
          
          <View style={styles.timeRangeContainer}>
            <TouchableOpacity 
              style={[
                styles.timeRangeButton,
                timeRange === 'week' && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange('week')}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === 'week' && styles.timeRangeTextActive
              ]}>Week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeRangeButton,
                timeRange === 'month' && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange('month')}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === 'month' && styles.timeRangeTextActive
              ]}>Month</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeRangeButton,
                timeRange === 'year' && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange('year')}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === 'year' && styles.timeRangeTextActive
              ]}>Year</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => renderMetricCard(metric, index))}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue Overview</Text>
            <TrendingUp size={20} color={colors.primary} />
          </View>
          <Card style={styles.chartCard}>
            {renderBarChart(revenueData, maxRevenueValue, '#4CAF50')}
          </Card>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Orders Trend</Text>
            <ShoppingBag size={20} color={colors.primary} />
          </View>
          <Card style={styles.chartCard}>
            {renderBarChart(ordersData, maxOrdersValue, colors.primary)}
          </Card>
        </View>
        
        <View style={styles.twoColumnSection}>
          <View style={styles.halfWidth}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sales by Category</Text>
            </View>
            <Card style={styles.chartCard}>
              {renderHorizontalBarChart(categoryData, maxCategoryValue)}
            </Card>
          </View>
          
          <View style={styles.halfWidth}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customer Segments</Text>
            </View>
            <Card style={styles.chartCard}>
              {renderDonutChart(customerSegments)}
            </Card>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Performing Products</Text>
            <Star size={20} color="#FF9800" />
          </View>
          <Card style={styles.productsCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.productNameColumn]}>Product</Text>
              <Text style={[styles.tableHeaderText, styles.numberColumn]}>Revenue</Text>
              <Text style={[styles.tableHeaderText, styles.numberColumn]}>Orders</Text>
              <Text style={[styles.tableHeaderText, styles.numberColumn]}>Views</Text>
              <Text style={[styles.tableHeaderText, styles.numberColumn]}>Rating</Text>
            </View>
            {topProducts.map((product, index) => (
              <View 
                key={product.id}
                style={[
                  styles.tableRow,
                  index < topProducts.length - 1 && styles.tableRowBorder
                ]}
              >
                <View style={styles.productNameColumn}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.numberColumn]}>
                  ${(product.revenue / 1000).toFixed(1)}k
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn]}>
                  {product.orders}
                </Text>
                <View style={styles.numberColumn}>
                  <View style={styles.viewsContainer}>
                    <Eye size={12} color={colors.textLight} />
                    <Text style={styles.viewsText}>{product.views}</Text>
                  </View>
                </View>
                <View style={styles.numberColumn}>
                  <View style={styles.ratingContainer}>
                    <Star size={12} color="#FF9800" fill="#FF9800" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <Calendar size={20} color={colors.primary} />
          </View>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>87.5%</Text>
              <Text style={styles.statLabel}>Conversion Rate</Text>
              <View style={styles.statChange}>
                <ArrowUpRight size={14} color="#4CAF50" />
                <Text style={styles.statChangeText}>+2.3%</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>3.2m</Text>
              <Text style={styles.statLabel}>Page Views</Text>
              <View style={styles.statChange}>
                <ArrowUpRight size={14} color="#4CAF50" />
                <Text style={styles.statChangeText}>+15.7%</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>2m 34s</Text>
              <Text style={styles.statLabel}>Avg Session</Text>
              <View style={styles.statChange}>
                <ArrowDownRight size={14} color="#FF5A5A" />
                <Text style={[styles.statChangeText, { color: '#FF5A5A' }]}>-0.5%</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>42.8%</Text>
              <Text style={styles.statLabel}>Bounce Rate</Text>
              <View style={styles.statChange}>
                <ArrowDownRight size={14} color="#4CAF50" />
                <Text style={styles.statChangeText}>-3.2%</Text>
              </View>
            </Card>
          </View>
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
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  metricChange: {
    fontSize: 12,
    color: colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  chartCard: {
    padding: 16,
  },
  chartContainer: {
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '70%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginTop: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 8,
  },
  horizontalChartContainer: {
    width: '100%',
  },
  horizontalBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  horizontalBarLabel: {
    fontSize: 12,
    color: colors.text,
    width: 80,
  },
  horizontalBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  horizontalBar: {
    height: '100%',
    borderRadius: 12,
  },
  horizontalBarValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    width: 40,
    textAlign: 'right',
  },
  donutContainer: {
    alignItems: 'center',
  },
  donutCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  donutTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  donutLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  donutLegend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  twoColumnSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  halfWidth: {
    width: '48%',
  },
  productsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productNameColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rankText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
  },
  productName: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  numberColumn: {
    width: 60,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
});
