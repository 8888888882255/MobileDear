import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { ProductCard } from '@/components/ProductCard';
import { useWishlistStore } from '@/store/wishlist-store';
import colors from '@/constants/colors';

export default function WishlistScreen() {
  const router = useRouter();
  const { items, clearWishlist } = useWishlistStore();

  const handleClearWishlist = () => {
    if (items.length === 0) return;

    Alert.alert(
      'Xóa danh sách yêu thích',
      'Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi danh sách yêu thích không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa hết', style: 'destructive', onPress: () => clearWishlist() },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Heart size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Danh sách yêu thích trống</Text>
          <Text style={styles.emptySubtitle}>
            Hãy lưu lại những sản phẩm bạn yêu thích để xem sau
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh sách yêu thích</Text>
        <TouchableOpacity onPress={handleClearWishlist}>
          <Text style={styles.clearText}>Xóa hết</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearText: {
    fontSize: 14,
    color: colors.error,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
