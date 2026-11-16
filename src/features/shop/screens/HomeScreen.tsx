import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategorySelector from '../components/CategorySelector';
import Header from '../components/Header';
import { useAuth } from '../auth/AuthContext';
import {
  fetchCategories,
  fetchProducts,
  initDatabase,
  type Category,
  type Product,
} from '../database/database';
import { getProductImageSource } from '../productImages';
import type { HomeStackParamList } from '../navigation/HomeStackScreen';
import { formatCurrency } from '../utils/displayFormatters';

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

type PriceFilter = 'all' | 'under300' | '300to800' | 'over800';

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tìm kiếm theo tên / danh mục
  const [searchKeyword, setSearchKeyword] = useState('');

  // Lọc theo khoảng giá
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadCatalog = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
          await initDatabase();
          const [loadedCategories, loadedProducts] = await Promise.all([
            fetchCategories(),
            fetchProducts(),
          ]);
          if (isActive) {
            setCategories(loadedCategories);
            setProducts(loadedProducts);
          }
        } catch (error) {
          console.error('Error loading home catalog:', error);
          if (isActive) {
            setErrorMessage('Không thể tải sản phẩm. Vui lòng thử lại.');
          }
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      void loadCatalog();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleCategorySelect = (categoryId: number) => {
    const category = categories.find((item) => item.id === categoryId);
    if (category) {
      navigation.navigate('ProductsByCategory', {
        categoryId,
        categoryName: category.name,
      });
    }
  };

  // Áp dụng bộ lọc kết hợp: Tìm kiếm + Khoảng giá
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // 1. Lọc theo từ khóa tìm kiếm (tên sản phẩm hoặc tên danh mục)
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase().trim();
        const categoryName =
          categories.find((c) => c.id === prod.categoryId)?.name.toLowerCase() ??
          '';
        const matchName = prod.name.toLowerCase().includes(keyword);
        const matchCategory = categoryName.includes(keyword);
        if (!matchName && !matchCategory) return false;
      }

      // 2. Lọc theo khoảng giá
      if (priceFilter === 'under300') {
        if (prod.price >= 300000) return false;
      } else if (priceFilter === '300to800') {
        if (prod.price < 300000 || prod.price > 800000) return false;
      } else if (priceFilter === 'over800') {
        if (prod.price <= 800000) return false;
      }

      return true;
    });
  }, [products, categories, searchKeyword, priceFilter]);

  const renderProduct = ({ item }: { item: Product }) => {
    const imageSource = getProductImageSource(item.img, item.categoryId);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem chi tiết ${item.name}`}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={[styles.productImage, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>Không có ảnh</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" accessibilityLabel="Đang tải sản phẩm" />
        </View>
      ) : errorMessage ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {/* 1. Banner chào mừng và Menu điều hướng */}
              <View style={styles.banner}>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerBadge}>🔥 XU HƯỚNG MỚI</Text>
                  <Text style={styles.bannerTitle}>
                    {user ? `Chào bạn, ${user.username}!` : 'Thời Trang & Phụ Kiện'}
                  </Text>
                  <Text style={styles.bannerSubtitle}>
                    {user
                      ? 'Khám phá ngay các mẫu quần áo, giày & phụ kiện mới nhất'
                      : 'Ưu đãi giảm tới 40% cho các mẫu quần áo, giày & phụ kiện hot tuần này'}
                  </Text>
                </View>
              </View>

              {/* Menu điều hướng Home / Danh mục */}
              <View style={styles.navMenu}>
                <TouchableOpacity
                  style={[styles.navMenuItem, styles.navMenuActive]}
                  onPress={() => {
                    setSearchKeyword('');
                    setPriceFilter('all');
                  }}
                >
                  <Text style={styles.navMenuIcon}>🏠</Text>
                  <Text style={styles.navMenuTextActive}>Trang chủ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navMenuItem}
                  onPress={() => {
                    if (categories.length > 0) {
                      handleCategorySelect(categories[0].id);
                    }
                  }}
                >
                  <Text style={styles.navMenuIcon}>📁</Text>
                  <Text style={styles.navMenuText}>Danh mục sản phẩm</Text>
                </TouchableOpacity>
              </View>

              {/* 2. Thanh Tìm kiếm theo tên / danh mục */}
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm theo tên sản phẩm hoặc danh mục..."
                  placeholderTextColor="#888"
                  value={searchKeyword}
                  onChangeText={setSearchKeyword}
                />
                {searchKeyword ? (
                  <TouchableOpacity
                    onPress={() => setSearchKeyword('')}
                    style={styles.clearSearchButton}
                  >
                    <Text style={styles.clearSearchText}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* 3. Lọc theo khoảng giá */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Lọc theo giá:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.priceChip,
                      priceFilter === 'all' && styles.priceChipActive,
                    ]}
                    onPress={() => setPriceFilter('all')}
                  >
                    <Text
                      style={[
                        styles.priceChipText,
                        priceFilter === 'all' && styles.priceChipTextActive,
                      ]}
                    >
                      Tất cả
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.priceChip,
                      priceFilter === 'under300' && styles.priceChipActive,
                    ]}
                    onPress={() => setPriceFilter('under300')}
                  >
                    <Text
                      style={[
                        styles.priceChipText,
                        priceFilter === 'under300' && styles.priceChipTextActive,
                      ]}
                    >
                      &lt; 300.000 đ
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.priceChip,
                      priceFilter === '300to800' && styles.priceChipActive,
                    ]}
                    onPress={() => setPriceFilter('300to800')}
                  >
                    <Text
                      style={[
                        styles.priceChipText,
                        priceFilter === '300to800' && styles.priceChipTextActive,
                      ]}
                    >
                      300.000đ - 800.000đ
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.priceChip,
                      priceFilter === 'over800' && styles.priceChipActive,
                    ]}
                    onPress={() => setPriceFilter('over800')}
                  >
                    <Text
                      style={[
                        styles.priceChipText,
                        priceFilter === 'over800' && styles.priceChipTextActive,
                      ]}
                    >
                      &gt; 800.000 đ
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* 4. Danh mục sản phẩm ngang */}
              <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
              <CategorySelector
                categories={categories}
                selectedId={-1}
                onSelect={handleCategorySelect}
              />

              <View style={styles.productHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Tất cả sản phẩm ({filteredProducts.length})
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  banner: {
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#1E3A8A',
    overflow: 'hidden',
    padding: 18,
    elevation: 3,
  },
  bannerContent: {
    justifyContent: 'center',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#BFDBFE',
    fontSize: 12,
    lineHeight: 18,
  },
  navMenu: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  navMenuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navMenuActive: {
    borderColor: '#1769aa',
    backgroundColor: '#EEF3FF',
  },
  navMenuIcon: {
    fontSize: 16,
  },
  navMenuText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  navMenuTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1769aa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 14,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  priceChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  priceChipActive: {
    backgroundColor: '#1769aa',
    borderColor: '#1769aa',
  },
  priceChipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  priceChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 6,
    color: '#1d2939',
    fontSize: 16,
    fontWeight: '700',
  },
  productHeaderRow: {
    marginTop: 10,
    marginBottom: 2,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  pressed: {
    opacity: 0.75,
  },
  productImage: {
    width: 84,
    height: 84,
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#e8ecf4',
  },
  placeholderText: {
    color: '#596579',
    fontSize: 12,
    textAlign: 'center',
  },
  productInfo: {
    flex: 1,
    paddingHorizontal: 14,
  },
  productName: {
    color: '#1d2939',
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    marginTop: 8,
    color: '#147d56',
    fontSize: 15,
    fontWeight: '700',
  },
  chevron: {
    color: '#98a2b3',
    fontSize: 26,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#b42318',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 24,
    color: '#667085',
    textAlign: 'center',
  },
});
