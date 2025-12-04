import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Modal,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Filter, 
  ChevronDown,
  ChevronUp,
  Package,
  User,
  MapPin,
  DollarSign,
  X,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download
} from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import { Order, CartItem } from '@/types';

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: '1',
    items: [
      {
        product: {
          id: '1',
          name: 'Premium Wireless Headphones',
          description: 'High-quality wireless headphones',
          price: 299.99,
          discountPrice: 249.99,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
          category: 'Electronics',
          sizes: ['One Size'],
          colors: ['Black', 'Silver'],
          tags: ['wireless', 'audio'],
          rating: 4.5,
          reviewCount: 128,
          stock: 45,
          featured: true,
          createdAt: '2023-01-15',
          updatedAt: '2024-01-10'
        },
        quantity: 2,
        size: 'One Size',
        color: 'Black'
      }
    ],
    status: 'pending',
    shippingAddress: {
      id: '1',
      name: 'Home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isDefault: true
    },
    paymentMethod: 'Credit Card',
    subtotal: 499.98,
    shippingCost: 15.00,
    tax: 40.00,
    total: 554.98,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'ORD-002',
    userId: '2',
    items: [
      {
        product: {
          id: '2',
          name: 'Classic Leather Jacket',
          description: 'Premium leather jacket',
          price: 499.99,
          images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
          category: 'Fashion',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black', 'Brown'],
          tags: ['leather', 'jacket'],
          rating: 4.8,
          reviewCount: 256,
          stock: 30,
          featured: true,
          createdAt: '2023-02-01',
          updatedAt: '2024-01-10'
        },
        quantity: 1,
        size: 'M',
        color: 'Black'
      }
    ],
    status: 'processing',
    shippingAddress: {
      id: '2',
      name: 'Work',
      street: '456 Business Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      isDefault: true
    },
    paymentMethod: 'PayPal',
    subtotal: 499.99,
    shippingCost: 20.00,
    tax: 41.60,
    total: 561.59,
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'ORD-003',
    userId: '1',
    items: [
      {
        product: {
          id: '3',
          name: 'Smart Watch Pro',
          description: 'Advanced fitness tracking smartwatch',
          price: 399.99,
          discountPrice: 349.99,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
          category: 'Electronics',
          sizes: ['One Size'],
          colors: ['Black', 'Silver', 'Gold'],
          tags: ['smartwatch', 'fitness'],
          rating: 4.6,
          reviewCount: 512,
          stock: 120,
          featured: true,
          createdAt: '2023-03-10',
          updatedAt: '2024-01-10'
        },
        quantity: 1,
        size: 'One Size',
        color: 'Silver'
      }
    ],
    status: 'shipped',
    shippingAddress: {
      id: '1',
      name: 'Home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isDefault: true
    },
    paymentMethod: 'Credit Card',
    subtotal: 349.99,
    shippingCost: 15.00,
    tax: 29.20,
    total: 394.19,
    createdAt: '2024-01-12T08:15:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: 'ORD-004',
    userId: '3',
    items: [
      {
        product: {
          id: '4',
          name: 'Designer Sunglasses',
          description: 'UV protection designer sunglasses',
          price: 199.99,
          images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
          category: 'Fashion',
          sizes: ['One Size'],
          colors: ['Black', 'Tortoise'],
          tags: ['sunglasses', 'accessories'],
          rating: 4.3,
          reviewCount: 89,
          stock: 75,
          featured: false,
          createdAt: '2023-04-05',
          updatedAt: '2024-01-10'
        },
        quantity: 2,
        size: 'One Size',
        color: 'Black'
      }
    ],
    status: 'delivered',
    shippingAddress: {
      id: '3',
      name: 'Home',
      street: '789 Park Lane',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
      isDefault: true
    },
    paymentMethod: 'Credit Card',
    subtotal: 399.98,
    shippingCost: 12.00,
    tax: 32.96,
    total: 444.94,
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-13T10:30:00Z'
  },
  {
    id: 'ORD-005',
    userId: '4',
    items: [
      {
        product: {
          id: '5',
          name: 'Running Shoes',
          description: 'Comfortable athletic running shoes',
          price: 129.99,
          discountPrice: 99.99,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
          category: 'Sports',
          sizes: ['7', '8', '9', '10', '11'],
          colors: ['White', 'Black', 'Blue'],
          tags: ['running', 'shoes'],
          rating: 4.7,
          reviewCount: 432,
          stock: 200,
          featured: true,
          createdAt: '2023-05-12',
          updatedAt: '2024-01-10'
        },
        quantity: 1,
        size: '9',
        color: 'White'
      }
    ],
    status: 'cancelled',
    shippingAddress: {
      id: '4',
      name: 'Home',
      street: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA',
      isDefault: true
    },
    paymentMethod: 'Debit Card',
    subtotal: 99.99,
    shippingCost: 10.00,
    tax: 8.80,
    total: 118.79,
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-09T09:20:00Z'
  }
];

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([...mockOrders]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, filterStatus);
  };
  
  const applyFilters = (query: string, status: typeof filterStatus) => {
    let filtered = [...mockOrders];
    
    if (query.trim() !== '') {
      filtered = filtered.filter(
        order => 
          order.id.toLowerCase().includes(query.toLowerCase()) ||
          order.shippingAddress.street.toLowerCase().includes(query.toLowerCase()) ||
          order.shippingAddress.city.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(order => order.status === status);
    }
    
    applySorting(filtered);
  };
  
  const applySorting = (orders: Order[]) => {
    const sorted = [...orders].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredOrders(sorted);
  };
  
  const handleSort = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newSortOrder);
    applySorting(filteredOrders);
  };
  
  const handleFilterStatus = (status: typeof filterStatus) => {
    setFilterStatus(status);
    applyFilters(searchQuery, status);
  };
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    Alert.alert(
      "Update Order Status",
      `Are you sure you want to change the order status to "${newStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            const updated = filteredOrders.map(order => 
              order.id === orderId 
                ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
                : order
            );
            setFilteredOrders(updated);
            
            if (selectedOrder?.id === orderId) {
              setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            
            Alert.alert("Success", "Order status updated successfully");
          }
        }
      ]
    );
  };
  
  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => handleUpdateStatus(orderId, 'cancelled')
        }
      ]
    );
  };
  
  const handleExportOrders = () => {
    Alert.alert(
      "Export Orders",
      "Export functionality would generate a CSV/Excel file with order data.",
      [{ text: "OK" }]
    );
  };
  
  const getOrderStats = () => {
    const stats = {
      total: mockOrders.length,
      pending: mockOrders.filter(o => o.status === 'pending').length,
      processing: mockOrders.filter(o => o.status === 'processing').length,
      shipped: mockOrders.filter(o => o.status === 'shipped').length,
      delivered: mockOrders.filter(o => o.status === 'delivered').length,
      cancelled: mockOrders.filter(o => o.status === 'cancelled').length,
      revenue: mockOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0)
    };
    return stats;
  };
  
  const stats = getOrderStats();
  
  const renderOrderItem = ({ item }: { item: Order }) => {
    const itemCount = item.items.reduce((sum, i) => sum + i.quantity, 0);
    
    return (
      <TouchableOpacity onPress={() => handleViewOrder(item)}>
        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderId}>{item.id}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <OrderStatusBadge status={item.status} />
          </View>
          
          <View style={styles.orderBody}>
            <View style={styles.orderInfo}>
              <User size={16} color={colors.textLight} />
              <Text style={styles.orderInfoText} numberOfLines={1}>
                User ID: {item.userId}
              </Text>
            </View>
            
            <View style={styles.orderInfo}>
              <Package size={16} color={colors.textLight} />
              <Text style={styles.orderInfoText}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
            
            <View style={styles.orderInfo}>
              <DollarSign size={16} color={colors.textLight} />
              <Text style={styles.orderInfoText}>
                ${item.total.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.orderInfo}>
              <MapPin size={16} color={colors.textLight} />
              <Text style={styles.orderInfoText} numberOfLines={1}>
                {item.shippingAddress.city}, {item.shippingAddress.state}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderActions}>
            {item.status === 'pending' && (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.processBtn]}
                onPress={() => handleUpdateStatus(item.id, 'processing')}
              >
                <Clock size={14} color={colors.processing} />
                <Text style={[styles.actionBtnText, { color: colors.processing }]}>
                  Process
                </Text>
              </TouchableOpacity>
            )}
            
            {item.status === 'processing' && (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.shipBtn]}
                onPress={() => handleUpdateStatus(item.id, 'shipped')}
              >
                <Truck size={14} color={colors.shipped} />
                <Text style={[styles.actionBtnText, { color: colors.shipped }]}>
                  Ship
                </Text>
              </TouchableOpacity>
            )}
            
            {item.status === 'shipped' && (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.deliverBtn]}
                onPress={() => handleUpdateStatus(item.id, 'delivered')}
              >
                <CheckCircle size={14} color={colors.success} />
                <Text style={[styles.actionBtnText, { color: colors.success }]}>
                  Deliver
                </Text>
              </TouchableOpacity>
            )}
            
            {item.status !== 'cancelled' && item.status !== 'delivered' && (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleCancelOrder(item.id)}
              >
                <XCircle size={14} color={colors.error} />
                <Text style={[styles.actionBtnText, { color: colors.error }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.viewBtn]}
              onPress={() => handleViewOrder(item)}
            >
              <Edit size={14} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                View
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.processing}</Text>
            <Text style={styles.statLabel}>Processing</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.shipped}</Text>
            <Text style={styles.statLabel}>Shipped</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>${stats.revenue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </Card>
        </ScrollView>
      </View>
      
      <View style={styles.header}>
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon={<Search size={20} color={colors.textLight} />}
          containerStyle={styles.searchContainer}
        />
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={handleExportOrders}
        >
          <Download size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Status:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterButtons}
            >
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterStatus === 'all' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterStatus('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'all' && styles.activeFilterChipText
                ]}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterStatus === 'pending' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterStatus('pending')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'pending' && styles.activeFilterChipText
                ]}>Pending</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterStatus === 'processing' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterStatus('processing')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'processing' && styles.activeFilterChipText
                ]}>Processing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterStatus === 'shipped' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterStatus('shipped')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'shipped' && styles.activeFilterChipText
                ]}>Shipped</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterStatus === 'delivered' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterStatus('delivered')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'delivered' && styles.activeFilterChipText
                ]}>Delivered</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterStatus === 'cancelled' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterStatus('cancelled')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'cancelled' && styles.activeFilterChipText
                ]}>Cancelled</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By:</Text>
            <View style={styles.sortButtons}>
              <TouchableOpacity 
                style={[
                  styles.sortButton,
                  sortBy === 'date' && styles.activeSortButton
                ]}
                onPress={() => handleSort('date')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'date' && styles.activeSortButtonText
                ]}>Date</Text>
                {sortBy === 'date' && (
                  sortOrder === 'asc' ? 
                  <ChevronUp size={16} color={colors.primary} /> : 
                  <ChevronDown size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sortButton,
                  sortBy === 'total' && styles.activeSortButton
                ]}
                onPress={() => handleSort('total')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'total' && styles.activeSortButtonText
                ]}>Total</Text>
                {sortBy === 'total' && (
                  sortOrder === 'asc' ? 
                  <ChevronUp size={16} color={colors.primary} /> : 
                  <ChevronDown size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sortButton,
                  sortBy === 'status' && styles.activeSortButton
                ]}
                onPress={() => handleSort('status')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'status' && styles.activeSortButtonText
                ]}>Status</Text>
                {sortBy === 'status' && (
                  sortOrder === 'asc' ? 
                  <ChevronUp size={16} color={colors.primary} /> : 
                  <ChevronDown size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.listHeader}>
        <Text style={styles.orderCount}>
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
        </Text>
      </View>
      
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
      
      <Modal
        visible={showOrderDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity 
                onPress={() => setShowOrderDetails(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <ScrollView 
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Text style={styles.modalSectionTitle}>Order Information</Text>
                    <OrderStatusBadge status={selectedOrder.status} />
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Order ID:</Text>
                    <Text style={styles.modalValue}>{selectedOrder.id}</Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Date:</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>User ID:</Text>
                    <Text style={styles.modalValue}>{selectedOrder.userId}</Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Payment:</Text>
                    <Text style={styles.modalValue}>{selectedOrder.paymentMethod}</Text>
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Items</Text>
                  
                  {selectedOrder.items.map((item: CartItem, index: number) => (
                    <View key={index} style={styles.orderItem}>
                      <Image 
                        source={{ uri: item.product.images[0] }} 
                        style={styles.orderItemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName} numberOfLines={2}>
                          {item.product.name}
                        </Text>
                        <Text style={styles.orderItemDetails}>
                          Size: {item.size} • Color: {item.color}
                        </Text>
                        <Text style={styles.orderItemDetails}>
                          Qty: {item.quantity}
                        </Text>
                      </View>
                      <View style={styles.orderItemPrice}>
                        <Text style={styles.orderItemPriceText}>
                          ${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Shipping Address</Text>
                  
                  <View style={styles.addressCard}>
                    <Text style={styles.addressName}>
                      {selectedOrder.shippingAddress.name}
                    </Text>
                    <Text style={styles.addressText}>
                      {selectedOrder.shippingAddress.street}
                    </Text>
                    <Text style={styles.addressText}>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </Text>
                    <Text style={styles.addressText}>
                      {selectedOrder.shippingAddress.country}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order Summary</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>
                      ${selectedOrder.subtotal.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping:</Text>
                    <Text style={styles.summaryValue}>
                      ${selectedOrder.shippingCost.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax:</Text>
                    <Text style={styles.summaryValue}>
                      ${selectedOrder.tax.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={[styles.summaryRow, styles.summaryTotal]}>
                    <Text style={styles.summaryTotalLabel}>Total:</Text>
                    <Text style={styles.summaryTotalValue}>
                      ${selectedOrder.total.toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  <Text style={styles.modalActionsTitle}>Update Status</Text>
                  
                  <View style={styles.statusButtons}>
                    {selectedOrder.status !== 'pending' && (
                      <Button
                        title="Mark as Pending"
                        onPress={() => {
                          setShowOrderDetails(false);
                          handleUpdateStatus(selectedOrder.id, 'pending');
                        }}
                        variant="outline"
                        size="small"
                        style={styles.statusButton}
                      />
                    )}
                    
                    {selectedOrder.status !== 'processing' && (
                      <Button
                        title="Mark as Processing"
                        onPress={() => {
                          setShowOrderDetails(false);
                          handleUpdateStatus(selectedOrder.id, 'processing');
                        }}
                        variant="outline"
                        size="small"
                        style={styles.statusButton}
                      />
                    )}
                    
                    {selectedOrder.status !== 'shipped' && (
                      <Button
                        title="Mark as Shipped"
                        onPress={() => {
                          setShowOrderDetails(false);
                          handleUpdateStatus(selectedOrder.id, 'shipped');
                        }}
                        variant="outline"
                        size="small"
                        style={styles.statusButton}
                      />
                    )}
                    
                    {selectedOrder.status !== 'delivered' && (
                      <Button
                        title="Mark as Delivered"
                        onPress={() => {
                          setShowOrderDetails(false);
                          handleUpdateStatus(selectedOrder.id, 'delivered');
                        }}
                        variant="outline"
                        size="small"
                        style={styles.statusButton}
                      />
                    )}
                    
                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                      <Button
                        title="Cancel Order"
                        onPress={() => {
                          setShowOrderDetails(false);
                          handleCancelOrder(selectedOrder.id);
                        }}
                        variant="outline"
                        size="small"
                        style={styles.statusButton}
                      />
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  statsContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    minWidth: 100,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportButton: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterChip: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
  },
  activeFilterChipText: {
    color: colors.primary,
    fontWeight: '500',
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeSortButton: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  activeSortButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  listHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  orderBody: {
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderInfoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  orderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  processBtn: {
    backgroundColor: colors.processing + '10',
    borderColor: colors.processing,
  },
  shipBtn: {
    backgroundColor: colors.shipped + '10',
    borderColor: colors.shipped,
  },
  deliverBtn: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
  },
  cancelBtn: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error,
  },
  viewBtn: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  modalValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  orderItemDetails: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  orderItemPrice: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  orderItemPriceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  addressCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
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
  summaryTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalActions: {
    padding: 20,
  },
  modalActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
  },
});
