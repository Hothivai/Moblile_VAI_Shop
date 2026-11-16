import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategorySelector from '../components/CategorySelector';
import Header from '../components/Header';
import {
  fetchCategories,
  fetchProductsByCategory,
  initDatabase,
  type Category,
  type Product,
} from '../database/database';
import { getProductImageSource } from '../productImages';
import type { HomeStackParamList } from '../navigation/HomeStackScreen';
import { formatCurrency } from '../utils/displayFormatters';

type CategoryRouteProp = RouteProp<HomeStackParamList, 'ProductsByCategory'>;
type CategoryNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ProductsByCategory'
>;

export default function ProductsByCategoryScreen() {
  const route = useRoute<CategoryRouteProp>();
  const navigation = useNavigation<CategoryNavigationProp>();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    route.params.categoryId,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );

  useEffect(() => {
    let isActive = true;
    const loadCategoryProducts = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setProducts([]);
      try {
        await initDatabase();
        const [loadedCategories, loadedProducts] = await Promise.all([
          fetchCategories(),
          fetchProductsByCategory(selectedCategoryId),
        ]);
        if (isActive) {
          setCategories(loadedCategories);
          setProducts(loadedProducts);
        }
      } catch (error) {
        console.error('Error loading products by category:', error);
        if (isActive) {
          setErrorMessage('Không thể tải sản phẩm của danh mục này.');
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadCategoryProducts();
    return () => {
      isActive = false;
    };
  }, [selectedCategoryId]);

  const handleCategorySelect = (categoryId: number) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) return;
    setSelectedCategoryId(categoryId);
    navigation.setParams({
      categoryId,
      categoryName: category.name,
    });
  };

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
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>
              {selectedCategory?.name ?? route.params.categoryName}
            </Text>
            <CategorySelector
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={handleCategorySelect}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              style={styles.status}
              size="large"
              accessibilityLabel="Đang tải sản phẩm"
            />
          ) : errorMessage ? (
            <Text style={[styles.status, styles.errorText]}>{errorMessage}</Text>
          ) : (
            <Text style={styles.status}>Danh mục này chưa có sản phẩm.</Text>
          )
        }
      />
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
  title: {
    marginTop: 16,
    color: '#1d2939',
    fontSize: 20,
    fontWeight: '700',
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
  status: {
    marginTop: 28,
    color: '#667085',
    textAlign: 'center',
  },
  errorText: {
    color: '#b42318',
  },
});
