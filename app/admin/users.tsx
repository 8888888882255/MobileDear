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
import { AuthService } from '@/src/services/authService';
import Constants from 'expo-constants';



export default function AdminUsersScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/');
    }
  }, [user]);

  if (!user?.isAdmin) {
    return null;
  }

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await AuthService.getAllUsers();
      // Map backend data to frontend User interface
      const mappedUsers: User[] = data.map((u: any) => ({
        id: String(u.maNguoiDung),
        name: u.hoTen,
        email: u.email,
        phone: u.sdt,
        avatar: u.avt && (u.avt.startsWith('http') || u.avt.startsWith('data:')) 
          ? u.avt 
          : u.avt ? `${Constants.expoConfig?.extra?.apiUrl}/${u.avt}` : undefined,
        isAdmin: u.vaiTro === 1,
        addresses: [], 
        status: u.trangThai === 0 ? 'banned' : 'active',
        rawData: u
      }));
      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, filterRole, filterStatus, users);
  };
  
  const applyFilters = (
    query: string, 
    role: typeof filterRole, 
    status: typeof filterStatus,
    sourceUsers: User[]
  ) => {
    let filtered = [...sourceUsers];
    
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
      filtered = filtered.filter(u => 
        status === 'active' ? (u as any).status !== 'banned' : (u as any).status === 'banned'
      );
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
        default:
          comparison = 0;
      }
      
      return newSortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(sorted);
  };
  
  const handleFilterRole = (role: typeof filterRole) => {
    setFilterRole(role);
    applyFilters(searchQuery, role, filterStatus, users);
  };
  
  const handleFilterStatus = (status: typeof filterStatus) => {
    setFilterStatus(status);
    applyFilters(searchQuery, filterRole, status, users);
  };
  
  const handleViewUser = (userData: User) => {
    setSelectedUser(userData);
    setShowUserDetails(true);
  };
  
  const handleEditUser = (userId: string) => {
    router.push(`/admin/user/${userId}`);
  };
  
  const handleToggleAdmin = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    
    Alert.alert(
      targetUser.isAdmin ? "Remove Admin" : "Make Admin",
      `Are you sure you want to ${targetUser.isAdmin ? 'remove admin privileges from' : 'make'} ${targetUser.name} ${targetUser.isAdmin ? '' : 'an admin'}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            setProcessingId(userId);
            // Optimistic update
            const updatedUsers = users.map(u => 
              u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
            );
            setUsers(updatedUsers);
            applyFilters(searchQuery, filterRole, filterStatus, updatedUsers);

            try {
              // Construct full update object to avoid validation errors
              const updateData = {
                MaNguoiDung: targetUser.rawData.maNguoiDung,
                HoTen: targetUser.rawData.hoTen,
                Email: targetUser.rawData.email,
                Sdt: targetUser.rawData.sdt,
                Avt: targetUser.rawData.avt,
                GioiTinh: targetUser.rawData.gioiTinh,
                NgaySinh: targetUser.rawData.ngaySinh,
                TieuSu: targetUser.rawData.tieuSu,
                TrangThai: targetUser.rawData.trangThai,
                VaiTro: targetUser.isAdmin ? 0 : 1
              };
              
              await AuthService.updateUserProfile(Number(userId), updateData);
            } catch (error) {
              // Revert on error
              console.error('Failed to update role, reverting', error);
              setUsers(users);
              applyFilters(searchQuery, filterRole, filterStatus, users);
              Alert.alert('Error', 'Failed to update user role');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };
  
  const handleToggleBan = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    
    const isBanned = (targetUser as any).status === 'banned';
    
    Alert.alert(
      isBanned ? "Unban User" : "Ban User",
      `Are you sure you want to ${isBanned ? 'unban' : 'ban'} ${targetUser.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          style: isBanned ? "default" : "destructive",
          onPress: async () => {
            setProcessingId(userId);
            // Optimistic update
            const updatedUsers = users.map(u => 
              u.id === userId ? { ...u, status: isBanned ? 'active' : 'banned' } as any : u
            );
            setUsers(updatedUsers);
            applyFilters(searchQuery, filterRole, filterStatus, updatedUsers);

            try {
              // Construct full update object to avoid validation errors
              const updateData = {
                MaNguoiDung: targetUser.rawData.maNguoiDung,
                HoTen: targetUser.rawData.hoTen,
                Email: targetUser.rawData.email,
                Sdt: targetUser.rawData.sdt,
                Avt: targetUser.rawData.avt,
                GioiTinh: targetUser.rawData.gioiTinh,
                NgaySinh: targetUser.rawData.ngaySinh,
                TieuSu: targetUser.rawData.tieuSu,
                VaiTro: targetUser.rawData.vaiTro,
                TrangThai: isBanned ? 1 : 0
              };

              await AuthService.updateUserProfile(Number(userId), updateData);
            } catch (error) {
              // Revert on error
              console.error('Failed to update status, reverting', error);
              setUsers(users);
              applyFilters(searchQuery, filterRole, filterStatus, users);
              Alert.alert('Error', 'Failed to update user status');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };
  
  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    
    Alert.alert(
      "Delete User",
      `Are you sure you want to permanently delete ${targetUser.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            setProcessingId(userId);
            try {
              await AuthService.deleteUser(Number(userId));
              // Update state locally
              const updatedUsers = users.filter(u => u.id !== userId);
              setUsers(updatedUsers);
              applyFilters(searchQuery, filterRole, filterStatus, updatedUsers);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            } finally {
              setProcessingId(null);
            }
          } 
        }
      ]
    );
  };
  
  const renderUserItem = ({ item }: { item: User }) => {
    const isBanned = (item as any).status === 'banned';
    const isProcessing = processingId === item.id;
    
    return (
      <TouchableOpacity onPress={() => handleViewUser(item)} disabled={isProcessing}>
        <Card style={isProcessing ? [styles.userCard, { opacity: 0.7 }] : styles.userCard}>
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
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleToggleAdmin(item.id)}
                disabled={isProcessing}
              >
                {item.isAdmin ? (
                  <ShieldOff size={18} color={isProcessing ? colors.textLight : colors.textLight} />
                ) : (
                  <Shield size={18} color={isProcessing ? colors.textLight : colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleToggleBan(item.id)}
                disabled={isProcessing}
              >
                {isBanned ? (
                  <UserCheck size={18} color={isProcessing ? colors.textLight : colors.success} />
                ) : (
                  <Ban size={18} color={isProcessing ? colors.textLight : colors.error} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteUser(item.id)}
                disabled={isProcessing}
              >
                <Trash2 size={18} color={isProcessing ? colors.textLight : colors.error} />
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
                  sortBy === 'email' && styles.activeSortButton
                ]}
                onPress={() => handleSort('email')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'email' && styles.activeSortButtonText
                ]}>Email</Text>
                {sortBy === 'email' && (
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
            {users.filter(u => u.isAdmin).length} admins
          </Text>
          <Text style={styles.statsDivider}>•</Text>
          <Text style={styles.statsText}>
            {users.filter(u => (u as any).status === 'active').length} active
          </Text>
        </View>
      </View>
      
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={fetchUsers}
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
              <View style={{ flex: 1 }}>
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
                      {(selectedUser as any).status === 'banned' && (
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
  
                    <View style={styles.infoItem}>
                      <Calendar size={20} color={colors.textLight} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Joined</Text>
                        <Text style={styles.infoValue}>
                          {selectedUser.rawData?.ngayTao 
                            ? new Date(selectedUser.rawData.ngayTao).toLocaleDateString() 
                            : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
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
                </ScrollView>
                
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
                      selectedUser.status === 'banned' 
                        ? "Unban User" 
                        : "Ban User"
                    }
                    onPress={() => {
                      setShowUserDetails(false);
                      handleToggleBan(selectedUser.id);
                    }}
                    variant={
                      selectedUser.status === 'banned' 
                        ? "outline" 
                        : "outline"
                    }
                    style={styles.modalActionButton}
                  />
                </View>
              </View>
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card, // Ensure background is opaque
  },
  modalActionButton: {
    marginBottom: 12,
  },
});
