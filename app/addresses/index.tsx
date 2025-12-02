import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Check,
  ChevronLeft,
  Home,
  Building
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import { Address } from '@/types';
import colors from '@/constants/colors';

export default function AddressesScreen() {
  const router = useRouter();
  const { user, removeAddress, setDefaultAddress } = useUserStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const addresses = user?.addresses || [];
  
  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      'Xóa địa chỉ',
      `Bạn có chắc chắn muốn xóa địa chỉ "${address.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            setDeletingId(address.id);
            setTimeout(() => {
              removeAddress(address.id);
              setDeletingId(null);
            }, 500);
          }
        }
      ]
    );
  };
  
  const handleSetDefault = (addressId: string) => {
    setDefaultAddress(addressId);
  };
  
  const getAddressIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nhà') || lowerName.includes('home')) {
      return <Home size={20} color={colors.primary} />;
    }
    if (lowerName.includes('cơ quan') || lowerName.includes('work')) {
      return <Building size={20} color={colors.primary} />;
    }
    return <MapPin size={20} color={colors.primary} />;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/addresses/new')}
        >
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Chưa có địa chỉ</Text>
            <Text style={styles.emptySubtitle}>
              Hãy thêm địa chỉ để việc giao hàng nhanh chóng hơn
            </Text>
            <Button
              title="Thêm địa chỉ"
              onPress={() => router.push('/addresses/new')}
              style={styles.emptyButton}
              icon={<Plus size={20} color="#fff" />}
            />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {addresses.length} địa chỉ đã lưu
            </Text>
            
            {addresses.map((address) => (
              <Card key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressTitleContainer}>
                    {getAddressIcon(address.name)}
                    <Text style={styles.addressName}>{address.name}</Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Check size={12} color="#fff" />
                        <Text style={styles.defaultText}>Mặc định</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.addressActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => router.push(`/addresses/edit/${address.id}`)}
                    >
                      <Edit3 size={18} color={colors.textLight} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteAddress(address)}
                      disabled={deletingId === address.id}
                    >
                      <Trash2 
                        size={18} 
                        color={deletingId === address.id ? colors.textLight : colors.error} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.addressDetails}>
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
                
                {!address.isDefault && (
                  <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={styles.setDefaultText}>Đặt làm mặc định</Text>
                  </TouchableOpacity>
                )}
              </Card>
            ))}
            
            <Button
              title="Thêm địa chỉ mới"
              onPress={() => router.push('/addresses/new')}
              variant="outline"
              style={styles.addNewButton}
              icon={<Plus size={20} color={colors.primary} />}
            />
          </>
        )}
      </ScrollView>
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  addressCard: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    marginRight: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 2,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    opacity: 1,
  },
  addressDetails: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  setDefaultText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  addNewButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
});
