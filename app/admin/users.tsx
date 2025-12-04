import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Filter, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldOff,
  Ban,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  ShoppingBag
} from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import { User } from '@/types';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isAdmin: false,
    addresses: [
      {
        id: '1',
        name: 'Home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isDefault: true
      }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234 567 8901',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isAdmin: false,
    addresses: [
      {
        id: '2',
        name: 'Work',
        street: '456 Business Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        isDefault: true
      }
    ]
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '+1 234 567 8902',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isAdmin: true,
    addresses: [
      {
        id: '3',
        name: 'Home',
        street: '789 Park Lane',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        isDefault: true
      }
    ]
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1 234 567 8903',
    avatar: 'https://i.pravatar.cc/150?img=4',
    isAdmin: false,
    addresses: [
      {
        id: '4',
        name: 'Home',
        street: '321 Elm Street',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        country: 'USA',
        isDefault: true
      }
    ]
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '+1 234 567 8904',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isAdmin: false,
    addresses: []
  },
  {
    id: '6',
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    phone: '+1 234 567 8905',
    avatar: 'https://i.pravatar.cc/150?img=6',
    isAdmin: false,
    addresses: [
      {
        id: '5',
        name: 'Home',
        street: '654 Oak Drive',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        country: 'USA',
        isDefault: true
      }
    ]
  },
  {
    id: '7',
    name: 'David Martinez',
    email: 'david.m@example.com',
    avatar: 'https://i.pravatar.cc/150?img=7',
    isAdmin: false,
    addresses: [
      {
        id: '6',
        name: 'Apartment',
        street: '987 Pine Street',
        city: 'Philadelphia',
        state: 'PA',
        zipCode: '19019',
        country: 'USA',
        isDefault: true
      }
    ]
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    phone: '+1 234 567 8907',
    avatar: 'https://i.pravatar.cc/150?img=8',
    isAdmin: false,
    addresses: []
  }
];

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastActive: string;
  status: 'active' | 'banned';
}

const userStats: Record<string, UserStats> = {
  '1': { totalOrders: 12, totalSpent: 1249.99, joinedDate: '2023-01-15', lastActive: '2024-01-10', status: 'active' },
  '2': { totalOrders: 8, totalSpent: 789.50, joinedDate: '2023-02-20', lastActive: '2024-01-09', status: 'active' },
  '3': { totalOrders: 5, totalSpent: 456.00, joinedDate: '2022-11-10', lastActive: '2024-01-11', status: 'active' },
  '4': { totalOrders: 15, totalSpent: 1890.25, joinedDate: '2023-03-05', lastActive: '2024-01-08', status: 'active' },
  '5': { totalOrders: 3, totalSpent: 234.75, joinedDate: '2023-05-12', lastActive: '2023-12-20', status: 'active' },
  '6': { totalOrders: 20, totalSpent: 2450.00, joinedDate: '2022-09-18', lastActive: '2024-01-11', status: 'active' },
  '7': { totalOrders: 7, totalSpent: 567.80, joinedDate: '2023-04-22', lastActive: '2024-01-07', status: 'active' },
  '8': { totalOrders: 1, totalSpent: 89.99, joinedDate: '2023-12-01', lastActive: '2024-01-05', status: 'banned' },
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([...mockUsers]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, filterRole, filterStatus);
  };
  
  const applyFilters = (
    query: string, 
    role: typeof filterRole, 
    status: typeof filterStatus
  ) => {
    let filtered = [...mockUsers];
    
    if (query.trim() !== '') {
      filtered = filtered.filter(
        u => 
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          (u.phone && u.phone.includes(query))
      );
    }
    
    if (role !== 'all') {
      filtered = filtered.filter(u => 
        role === 'admin' ? u.isAdmin : !u.isAdmin
      );
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(u => {
        const stats = userStats[u.id];
        return stats && stats.status === status;
      });
    }
    
    setFilteredUsers(filtered);
  };
  
  const handleSort = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newSortOrder);
    
    const sorted = [...filteredUsers].sort((a, b) => {
      let comparison = 0;
      
      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'orders':
          comparison = (userStats[a.id]?.totalOrders || 0) - (userStats[b.id]?.totalOrders || 0);
          break;
        case 'spent':
          comparison = (userStats[a.id]?.totalSpent || 0) - (userStats[b.id]?.totalSpent || 0);
          break;
        default:
          comparison = 0;
      }
      
      return newSortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(sorted);
  };
  
  const handleFilterRole = (role: typeof filterRole) => {
    setFilterRole(role);
    applyFilters(searchQuery, role, filterStatus);
  };
  
  const handleFilterStatus = (status: typeof filterStatus) => {
    setFilterStatus(status);
    applyFilters(searchQuery, filterRole, status);
  };
  
  const handleViewUser = (userData: User) => {
    setSelectedUser(userData);
    setShowUserDetails(true);
  };
  
  const handleEditUser = (userId: string) => {
    router.push(`/admin/user/${userId}`);
  };
  
  const handleToggleAdmin = (userId: string) => {
    const targetUser = filteredUsers.find(u => u.id === userId);
    if (!targetUser) return;
    
    Alert.alert(
      targetUser.isAdmin ? "Remove Admin" : "Make Admin",
      `Are you sure you want to ${targetUser.isAdmin ? 'remove admin privileges from' : 'make'} ${targetUser.name} ${targetUser.isAdmin ? '' : 'an admin'}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            const updated = filteredUsers.map(u => 
              u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
            );
            setFilteredUsers(updated);
          }
        }
      ]
    );
  };
  
  const handleToggleBan = (userId: string) => {
    const targetUser = filteredUsers.find(u => u.id === userId);
    const stats = userStats[userId];
    if (!targetUser || !stats) return;
    
    const isBanned = stats.status === 'banned';
    
    Alert.alert(
      isBanned ? "Unban User" : "Ban User",
      `Are you sure you want to ${isBanned ? 'unban' : 'ban'} ${targetUser.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          style: isBanned ? "default" : "destructive",
          onPress: () => {
            userStats[userId].status = isBanned ? 'active' : 'banned';
            setFilteredUsers([...filteredUsers]);
          }
        }
      ]
    );
  };
  
  const handleDeleteUser = (userId: string) => {
    const targetUser = filteredUsers.find(u => u.id === userId);
    if (!targetUser) return;
    
    Alert.alert(
      "Delete User",
      `Are you sure you want to permanently delete ${targetUser.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            const updated = filteredUsers.filter(u => u.id !== userId);
            setFilteredUsers(updated);
          } 
        }
      ]
    );
  };
  
  const renderUserItem = ({ item }: { item: User }) => {
    const stats = userStats[item.id];
    const isBanned = stats?.status === 'banned';
    
    return (
      <TouchableOpacity onPress={() => handleViewUser(item)}>
        <Card style={styles.userCard}>
          <View style={styles.userContainer}>
            <View style={styles.avatarContainer}>
              {item.avatar ? (
                <Image 
                  source={{ uri: item.avatar }} 
                  style={styles.avatar} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {item.isAdmin && (
                <View style={styles.adminBadge}>
                  <Shield size={12} color="#fff" />
                </View>
              )}
              {isBanned && (
                <View style={styles.bannedBadge}>
                  <Ban size={12} color="#fff" />
                </View>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                {item.isAdmin && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>Admin</Text>
                  </View>
                )}
                {isBanned && (
                  <View style={[styles.roleBadge, styles.bannedStatusBadge]}>
                    <Text style={styles.roleBadgeText}>Banned</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
              {stats && (
                <View style={styles.userStats}>
                  <Text style={styles.userStat}>
                    {stats.totalOrders} orders
                  </Text>
                  <Text style={styles.userStatDivider}>•</Text>
                  <Text style={styles.userStat}>
                    ${stats.totalSpent.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleToggleAdmin(item.id)}
              >
                {item.isAdmin ? (
                  <ShieldOff size={18} color={colors.textLight} />
                ) : (
                  <Shield size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleToggleBan(item.id)}
              >
                {isBanned ? (
                  <UserCheck size={18} color={colors.success} />
                ) : (
                  <Ban size={18} color={colors.error} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteUser(item.id)}
              >
                <Trash2 size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Search users..."
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
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Role:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterRole === 'all' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterRole('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterRole === 'all' && styles.activeFilterChipText
                ]}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterRole === 'admin' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterRole('admin')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterRole === 'admin' && styles.activeFilterChipText
                ]}>Admin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterRole === 'user' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterRole('user')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterRole === 'user' && styles.activeFilterChipText
                ]}>User</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Status:</Text>
            <View style={styles.filterButtons}>
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
                  filterStatus === 'active' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterStatus('active')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'active' && styles.activeFilterChipText
                ]}>Active</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  filterStatus === 'banned' && styles.activeFilterChip
                ]}
                onPress={() => handleFilterStatus('banned')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'banned' && styles.activeFilterChipText
                ]}>Banned</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By:</Text>
            <View style={styles.sortButtons}>
              <TouchableOpacity 
                style={[
                  styles.sortButton,
                  sortBy === 'name' && styles.activeSortButton
                ]}
                onPress={() => handleSort('name')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'name' && styles.activeSortButtonText
                ]}>Name</Text>
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? 
                  <ChevronUp size={16} color={colors.primary} /> : 
                  <ChevronDown size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sortButton,
                  sortBy === 'orders' && styles.activeSortButton
                ]}
                onPress={() => handleSort('orders')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'orders' && styles.activeSortButtonText
                ]}>Orders</Text>
                {sortBy === 'orders' && (
                  sortOrder === 'asc' ? 
                  <ChevronUp size={16} color={colors.primary} /> : 
                  <ChevronDown size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sortButton,
                  sortBy === 'spent' && styles.activeSortButton
                ]}
                onPress={() => handleSort('spent')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'spent' && styles.activeSortButtonText
                ]}>Spent</Text>
                {sortBy === 'spent' && (
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
        <Text style={styles.userCount}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
        </Text>
        
        <View style={styles.statsInfo}>
          <Text style={styles.statsText}>
            {mockUsers.filter(u => u.isAdmin).length} admins
          </Text>
          <Text style={styles.statsDivider}>•</Text>
          <Text style={styles.statsText}>
            {Object.values(userStats).filter(s => s.status === 'active').length} active
          </Text>
        </View>
      </View>
      
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
      
      <Modal
        visible={showUserDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity 
                onPress={() => setShowUserDetails(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedUser && (
              <ScrollView 
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.detailsSection}>
                  <View style={styles.detailsAvatarContainer}>
                    {selectedUser.avatar ? (
                      <Image 
                        source={{ uri: selectedUser.avatar }} 
                        style={styles.detailsAvatar} 
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.detailsAvatarPlaceholder}>
                        <Text style={styles.detailsAvatarText}>
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.detailsName}>{selectedUser.name}</Text>
                  
                  <View style={styles.detailsBadges}>
                    {selectedUser.isAdmin && (
                      <View style={styles.detailsRoleBadge}>
                        <Shield size={14} color={colors.primary} />
                        <Text style={styles.detailsRoleBadgeText}>Admin</Text>
                      </View>
                    )}
                    {userStats[selectedUser.id]?.status === 'banned' && (
                      <View style={[styles.detailsRoleBadge, styles.detailsBannedBadge]}>
                        <Ban size={14} color={colors.error} />
                        <Text style={[styles.detailsRoleBadgeText, styles.detailsBannedBadgeText]}>
                          Banned
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Contact Information</Text>
                  
                  <View style={styles.infoItem}>
                    <Mail size={20} color={colors.textLight} />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{selectedUser.email}</Text>
                    </View>
                  </View>
                  
                  {selectedUser.phone && (
                    <View style={styles.infoItem}>
                      <Phone size={20} color={colors.textLight} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{selectedUser.phone}</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {userStats[selectedUser.id] && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>Activity</Text>
                    
                    <View style={styles.infoItem}>
                      <ShoppingBag size={20} color={colors.textLight} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Total Orders</Text>
                        <Text style={styles.infoValue}>
                          {userStats[selectedUser.id].totalOrders}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <ShoppingBag size={20} color={colors.textLight} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Total Spent</Text>
                        <Text style={styles.infoValue}>
                          ${userStats[selectedUser.id].totalSpent.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Calendar size={20} color={colors.textLight} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Joined</Text>
                        <Text style={styles.infoValue}>
                          {userStats[selectedUser.id].joinedDate}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Calendar size={20} color={colors.textLight} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Last Active</Text>
                        <Text style={styles.infoValue}>
                          {userStats[selectedUser.id].lastActive}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                
                {selectedUser.addresses.length > 0 && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>Addresses</Text>
                    
                    {selectedUser.addresses.map((address) => (
                      <View key={address.id} style={styles.addressCard}>
                        <View style={styles.addressHeader}>
                          <MapPin size={18} color={colors.primary} />
                          <Text style={styles.addressName}>{address.name}</Text>
                          {address.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressText}>
                          {address.street}
                        </Text>
                        <Text style={styles.addressText}>
                          {address.city}, {address.state} {address.zipCode}
                        </Text>
                        <Text style={styles.addressText}>
                          {address.country}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.modalActions}>
                  <Button
                    title="Edit User"
                    onPress={() => {
                      setShowUserDetails(false);
                      handleEditUser(selectedUser.id);
                    }}
                    variant="outline"
                    style={styles.modalActionButton}
                  />
                  
                  <Button
                    title={selectedUser.isAdmin ? "Remove Admin" : "Make Admin"}
                    onPress={() => {
                      setShowUserDetails(false);
                      handleToggleAdmin(selectedUser.id);
                    }}
                    variant="outline"
                    style={styles.modalActionButton}
                  />
                  
                  <Button
                    title={
                      userStats[selectedUser.id]?.status === 'banned' 
                        ? "Unban User" 
                        : "Ban User"
                    }
                    onPress={() => {
                      setShowUserDetails(false);
                      handleToggleBan(selectedUser.id);
                    }}
                    variant={
                      userStats[selectedUser.id]?.status === 'banned' 
                        ? "outline" 
                        : "outline"
                    }
                    style={styles.modalActionButton}
                  />
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
  filtersContainer: {
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: colors.textLight,
  },
  statsDivider: {
    marginHorizontal: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    marginBottom: 12,
    padding: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  bannedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.primary + '20',
    marginRight: 4,
  },
  bannedStatusBadge: {
    backgroundColor: colors.error + '20',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userStatDivider: {
    marginHorizontal: 6,
    fontSize: 12,
    color: colors.textLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    borderColor: colors.error + '40',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
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
  detailsSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailsAvatarContainer: {
    marginBottom: 16,
  },
  detailsAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  detailsAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsAvatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  detailsBadges: {
    flexDirection: 'row',
  },
  detailsRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    marginHorizontal: 4,
  },
  detailsBannedBadge: {
    backgroundColor: colors.error + '20',
  },
  detailsRoleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  detailsBannedBadgeText: {
    color: colors.error,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
  },
  addressCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.primary + '20',
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  addressText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  modalActions: {
    padding: 20,
  },
  modalActionButton: {
    marginBottom: 12,
  },
});