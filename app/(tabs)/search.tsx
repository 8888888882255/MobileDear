import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Search as SearchIcon, Grid, List, Filter } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/mocks/products';
import colors from '@/constants/colors';

type LayoutMode = 'grid' | 'list';

const { width } = Dimensions.get('window');
const GAP = 16;

export default function SearchScreen() {
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (params.category) {
      const filtered = products.filter(p => p.category === params.category);
      setFilteredProducts(filtered);
    }
  }, [params.category]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProducts(products);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(text.toLowerCase()) ||
        product.description.toLowerCase().includes(text.toLowerCase()) ||
        product.category.toLowerCase().includes(text.toLowerCase()) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(text.toLowerCase())) ||
        product.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 500);
  };

  const toggleLayoutMode = () => {
    setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid');
  };

  const renderProductItem = ({ item, index }: { item: typeof products[0]; index: number }) => {
    const itemStyle = layoutMode === 'grid' && index % 2 === 0 ? { marginRight: GAP } : {};
    const itemWidth = layoutMode === 'grid' ? (width - 3 * GAP) / 2 : width - 2 * GAP;

    return (
      <View style={[{ marginBottom: GAP }, itemStyle]}>
        <ProductCard product={item} width={itemWidth} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon={<SearchIcon size={20} color={colors.textLight} />}
          containerStyle={styles.searchInputContainer}
        />

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Sản phẩm</Text>
            <Filter size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.layoutButton} onPress={toggleLayoutMode}>
            {layoutMode === 'grid' ? (
              <Grid size={20} color={colors.primary} />
            ) : (
              <List size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultsText}>
            Đã tìm thấy {filteredProducts.length} sản phẩm
          </Text>

          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            numColumns={layoutMode === 'grid' ? 2 : 1}
            key={layoutMode}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
                <Text style={styles.emptySubtext}>Hãy thử từ khóa khác</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card, padding: 16 },
  searchContainer: { marginBottom: 16 },
  searchInputContainer: { marginBottom: 12 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: { marginRight: 8, color: colors.primary, fontWeight: '500' },
  layoutButton: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultsText: { marginBottom: 16, fontSize: 14, color: colors.textLight },
  listContent: { paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textLight, fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: colors.textLight },
});