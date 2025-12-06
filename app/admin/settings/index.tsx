import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  Check,
  X,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import colors from '@/constants/colors';
import { GiaoDien, SETTING_TYPES } from '@/types';
import { SettingsService } from '@/src/services/settingsService';
import { Switch, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

type TabType = 'all' | 'logo' | 'banner' | 'slider';

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://localhost:5083';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [allItems, setAllItems] = useState<GiaoDien[]>([]);
  const [filteredItems, setFilteredItems] = useState<GiaoDien[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isConflictModalVisible, setIsConflictModalVisible] = useState(false);
  const [conflictingLogos, setConflictingLogos] = useState<GiaoDien[]>([]);

  const getTypeFromTab = (tab: TabType): number | undefined => {
    switch (tab) {
      case 'logo':
        return SETTING_TYPES.LOGO;
      case 'banner':
        return SETTING_TYPES.BANNER;
      case 'slider':
        return SETTING_TYPES.SLIDER;
      default:
        return undefined;
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all data once
      const data = await SettingsService.getAll();
      setAllItems(data);
      
      // Check for multiple active logos
      const activeLogos = data.filter(
        item => item.loaiGiaoDien === SETTING_TYPES.LOGO && item.trangThai === 1
      );

      if (activeLogos.length > 1) {
        setConflictingLogos(activeLogos);
        setIsConflictModalVisible(true);
      }

      // Reset selection
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResolveConflict = async (selectedLogo: GiaoDien) => {
    setIsProcessing(true);
    try {
      // Update the selected logo to active (this triggers backend to deactivate others)
      // Must send full object because GiaoDienEdit requires fields
      await SettingsService.update(selectedLogo.maGiaoDien, { 
        ...selectedLogo,
        trangThai: 1 
      });
      
      Alert.alert('Thành công', 'Đã cập nhật Logo hiển thị!');
      setIsConflictModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật Logo. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter data when tab or search query changes
  useEffect(() => {
    let result = allItems;

    // Filter by Tab
    const type = getTypeFromTab(activeTab);
    if (type !== undefined) {
      result = result.filter(item => item.loaiGiaoDien === type);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.tenGiaoDien.toLowerCase().includes(query) || 
        (item.moTa && item.moTa.toLowerCase().includes(query))
      );
    }

    setFilteredItems(result);
  }, [allItems, activeTab, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = (item: GiaoDien) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${item.tenGiaoDien}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await SettingsService.delete(item.maGiaoDien);
              Alert.alert('Thành công', 'Đã xóa thành công!');
              loadData();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item: GiaoDien) => {
    router.push(`/admin/settings/edit?id=${item.maGiaoDien}`);
  };

  const handleCreate = () => {
    const type = getTypeFromTab(activeTab) || SETTING_TYPES.LOGO;
    router.push(`/admin/settings/create?type=${type}`);
  };

  const handleToggleStatus = async (item: GiaoDien) => {
    try {
      const newStatus = item.trangThai === 1 ? 0 : 1;
      
      // If enabling a logo, check if another one is already active (optimistic check)
      if (item.loaiGiaoDien === SETTING_TYPES.LOGO && newStatus === 1) {
        const otherActiveLogo = allItems.find(
          i => i.loaiGiaoDien === SETTING_TYPES.LOGO && i.trangThai === 1 && i.maGiaoDien !== item.maGiaoDien
        );
        
        if (otherActiveLogo) {
          Alert.alert(
            'Lưu ý', 
            `Logo "${otherActiveLogo.tenGiaoDien}" đang hoạt động. Việc kích hoạt logo này sẽ tự động tắt logo kia.`,
            [
              { text: 'Hủy', style: 'cancel' },
              { 
                text: 'Tiếp tục', 
                onPress: async () => {
                  // Optimistic update
                  setAllItems(prev => prev.map(i => {
                    if (i.maGiaoDien === item.maGiaoDien) return { ...i, trangThai: 1 };
                    if (i.loaiGiaoDien === SETTING_TYPES.LOGO && i.trangThai === 1) return { ...i, trangThai: 0 };
                    return i;
                  }));
                  await SettingsService.update(item.maGiaoDien, { ...item, trangThai: 1 });
                  loadData(); // Reload to confirm state
                }
              }
            ]
          );
          return;
        }
      }

      // Optimistic update on allItems
      setAllItems(prev => prev.map(i => 
        i.maGiaoDien === item.maGiaoDien ? { ...i, trangThai: newStatus } : i
      ));
      
      await SettingsService.update(item.maGiaoDien, { ...item, trangThai: newStatus });
      
      // If it was a logo update, reload to ensure backend side effects are reflected
      if (item.loaiGiaoDien === SETTING_TYPES.LOGO && newStatus === 1) {
        loadData();
      }
    } catch (error) {
      // Revert on error
      setAllItems(prev => prev.map(i => 
        i.maGiaoDien === item.maGiaoDien ? { ...i, trangThai: item.trangThai } : i
      ));
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
    }
  };

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      if (newSelected.size === 0) setIsSelectionMode(false);
    } else {
      newSelected.add(id);
      setIsSelectionMode(true);
    }
    setSelectedIds(newSelected);
  };

  const handleLongPress = (id: number) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds(new Set([id]));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.size === 0) return;

    const actionText = 
      action === 'activate' ? 'kích hoạt' : 
      action === 'deactivate' ? 'ẩn' : 'xóa';

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${actionText} ${selectedIds.size} mục đã chọn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const ids = Array.from(selectedIds);
              
              if (action === 'delete') {
                await Promise.all(ids.map(id => SettingsService.delete(id)));
              } else {
                const status = action === 'activate' ? 1 : 0;
                // For activate logo, we should do it one by one or warn user, but for bulk let's just do it
                // The backend will enforce single active anyway, so the last one processed wins
                await Promise.all(ids.map(id => {
                  const item = allItems.find(i => i.maGiaoDien === id);
                  if (!item) return Promise.resolve();
                  return SettingsService.update(id, { ...item, trangThai: status });
                }));
              }
              
              await loadData();
              Alert.alert('Thành công', `Đã ${actionText} thành công!`);
            } catch (error) {
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý hàng loạt.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } else {
      const allIds = new Set(filteredItems.map(i => i.maGiaoDien));
      setSelectedIds(allIds);
      setIsSelectionMode(true);
    }
  };

  const getImageUrl = (item: GiaoDien): string | null => {
    const media = item.medias?.[0];
    if (!media) return null;
    const path = media.duongDan;
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${API_URL}${path}`;
  };

  const renderItem = ({ item }: { item: GiaoDien }) => {
    const imageUrl = getImageUrl(item);
    const isSelected = selectedIds.has(item.maGiaoDien);

    return (
      <View style={[styles.card, isSelected && styles.cardSelected]}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row' }}
          onLongPress={() => handleLongPress(item.maGiaoDien)}
          onPress={() => {
            if (isSelectionMode) {
              toggleSelection(item.maGiaoDien);
            } else {
              handleEdit(item);
            }
          }}
          activeOpacity={0.7}
        >
          {isSelectionMode && (
            <View style={styles.selectionOverlay}>
              {isSelected ? (
                <CheckSquare size={24} color={colors.primary} />
              ) : (
                <Square size={24} color={colors.textLight} />
              )}
            </View>
          )}
          
          <View style={styles.cardImageContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.cardImage} />
            ) : (
              <View style={styles.noImage}>
                <ImageIcon size={32} color={colors.textLight} />
              </View>
            )}
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.tenGiaoDien}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.moTa || 'Không có mô tả'}
            </Text>
            <View style={styles.cardMeta}>
              {!isSelectionMode && (
                <View style={styles.switchContainer}>
                  <TouchableOpacity onPress={() => handleToggleStatus(item)}>
                    <View 
                      style={Platform.OS === 'web' ? { pointerEvents: 'none' } as any : undefined}
                      pointerEvents={Platform.OS === 'web' ? undefined : 'none'}
                    >
                      <Switch
                        value={item.trangThai === 1}
                        onValueChange={() => {}}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                      />
                    </View>
                  </TouchableOpacity>
                  <Text style={[
                    styles.statusText, 
                    { color: item.trangThai === 1 ? colors.success : colors.textLight }
                  ]}>
                    {item.trangThai === 1 ? 'Hoạt động' : 'Ẩn'}
                  </Text>
                </View>
              )}
              {isSelectionMode && (
                <Text style={[
                  styles.statusText, 
                  { color: item.trangThai === 1 ? colors.success : colors.textLight }
                ]}>
                  {item.trangThai === 1 ? 'Hoạt động' : 'Ẩn'}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {!isSelectionMode && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                console.log('Delete button pressed', item.maGiaoDien);
                handleDelete(item);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'logo', label: 'Logo' },
    { key: 'banner', label: 'Banner' },
    { key: 'slider', label: 'Slider' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={() => {
              setIsSelectionMode(false);
              setSelectedIds(new Set());
            }}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.selectionTitle}>{selectedIds.size} đã chọn</Text>
            <TouchableOpacity onPress={selectAll}>
              <Text style={styles.selectAllText}>
                {selectedIds.size === filteredItems.length ? 'Bỏ chọn' : 'Chọn tất cả'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản lý Giao diện</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ImageIcon size={64} color={colors.textLight} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Không tìm thấy kết quả' : `Chưa có ${activeTab === 'all' ? 'giao diện' : activeTab} nào`}
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Plus size={20} color="#fff" />
            <Text style={styles.createButtonText}>Thêm mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.maGiaoDien)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
      {isSelectionMode && (
        <View style={styles.bulkActions}>
          <TouchableOpacity 
            style={[styles.bulkButton, styles.bulkActivate]}
            onPress={() => handleBulkAction('activate')}
            disabled={isProcessing}
          >
            <Check size={20} color="#fff" />
            <Text style={styles.bulkButtonText}>Hiện</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bulkButton, styles.bulkDeactivate]}
            onPress={() => handleBulkAction('deactivate')}
            disabled={isProcessing}
          >
            <X size={20} color="#fff" />
            <Text style={styles.bulkButtonText}>Ẩn</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bulkButton, styles.bulkDelete]}
            onPress={() => handleBulkAction('delete')}
            disabled={isProcessing}
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.bulkButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Conflict Resolution Modal */}
      {isConflictModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚠️ Phát hiện xung đột</Text>
              <Text style={styles.modalSubtitle}>
                Có nhiều Logo đang hoạt động cùng lúc. Vui lòng chọn một Logo để hiển thị, các logo khác sẽ tự động tắt.
              </Text>
            </View>
            
            <ScrollView style={styles.modalList} contentContainerStyle={{ gap: 12 }}>
              {conflictingLogos.map(item => (
                <TouchableOpacity 
                  key={item.maGiaoDien}
                  style={styles.conflictItem}
                  onPress={() => handleResolveConflict(item)}
                  disabled={isProcessing}
                >
                  <View style={styles.conflictImageContainer}>
                    {getImageUrl(item) ? (
                      <Image source={{ uri: getImageUrl(item)! }} style={styles.conflictImage} />
                    ) : (
                      <ImageIcon size={24} color={colors.textLight} />
                    )}
                  </View>
                  <View style={styles.conflictInfo}>
                    <Text style={styles.conflictName}>{item.tenGiaoDien}</Text>
                    <Text style={styles.conflictDesc} numberOfLines={1}>{item.moTa || 'Không có mô tả'}</Text>
                  </View>
                  <View style={styles.radioButton}>
                    <View style={styles.radioButtonInner} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 60,
  },
  selectionHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  selectAllText: {
    color: colors.primary,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  activeTabText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 80, // Space for bulk actions
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  selectionOverlay: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageContainer: {
    width: 100,
    height: 100,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardActions: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#eff6ff',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  bulkActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bulkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  bulkButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  bulkActivate: {
    backgroundColor: colors.success,
  },
  bulkDeactivate: {
    backgroundColor: colors.textLight,
  },
  bulkDelete: {
    backgroundColor: '#dc2626',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalList: {
    maxHeight: 400,
  },
  conflictItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  conflictImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  conflictImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  conflictInfo: {
    flex: 1,
  },
  conflictName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  conflictDesc: {
    fontSize: 12,
    color: colors.textLight,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent', // Selected state would be filled, but here we just click to select
  },
});
