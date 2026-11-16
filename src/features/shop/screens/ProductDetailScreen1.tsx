import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import CategorySelector from '../components/CategorySelector';
import { useAuth } from '../auth/AuthContext';
import { addCartItem } from '../cart/cartStorage';
import { fetchCategories, type Category } from '../database/database';
import { getProductImageSource } from '../productImages';
import type { HomeStackParamList } from '../navigation/HomeStackScreen';
import { formatCurrency } from '../utils/displayFormatters';

type ProductDetailRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ProductDetail'
>;

export default function ProductDetailScreen1() {
  const { product } = useRoute<ProductDetailRouteProp>().params;
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const loadedCategories = await fetchCategories();
        if (isMounted) {
          setCategories(loadedCategories);
        }
      } catch (error) {
        console.error('Error loading product categories:', error);
        if (isMounted) {
          setCategoryError('Không thể tải danh mục sản phẩm.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategory(false);
        }
      }
    };

    void loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const imageSource = getProductImageSource(product.img, product.categoryId);
  const categoryName = categories.find(
    (category) => category.id === product.categoryId,
  )?.name;

  const handleCategorySelect = (categoryId: number) => {
    const selectedCategory = categories.find(
      (category) => category.id === categoryId,
    );
    if (selectedCategory) {
      navigation.navigate('ProductsByCategory', {
        categoryId,
        categoryName: selectedCategory.name,
      });
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      } else {
        Alert.alert(
          'Yêu cầu đăng nhập',
          'Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng.',
        );
      }
      return;
    }

    try {
      await addCartItem(user.id, product);
      const msg = `🎉 Đã thêm "${product.name}" vào giỏ hàng thành công!`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Thành công', msg);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      if (Platform.OS === 'web') {
        window.alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      } else {
        Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Danh mục ngang */}
      <CategorySelector
        categories={categories}
        selectedId={product.categoryId}
        onSelect={handleCategorySelect}
      />

      {/* Ảnh sản phẩm */}
      {imageSource ? (
        <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
      ) : (
        <View style={[styles.productImage, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>Không có ảnh sản phẩm</Text>
        </View>
      )}

      {/* Chi tiết thông tin sản phẩm */}
      <View style={styles.details}>
        <Text style={styles.productName}>{product.name}</Text>

        <Text style={styles.label}>Giá sản phẩm</Text>
        <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>

        <Text style={styles.label}>Danh mục</Text>
        <Text style={styles.categoryName}>
          {isLoadingCategory ? 'Đang tải...' : (categoryError ?? categoryName ?? 'Không xác định')}
        </Text>

        <Text style={styles.label}>Mô tả sản phẩm</Text>
        <Text style={styles.descriptionText}>
          Sản phẩm {product.name} chất lượng cao, thiết kế trẻ trung, chất liệu bền đẹp, dễ dàng phối đồ và phù hợp cho nhiều nhu cầu sử dụng hàng ngày.
        </Text>

        {/* Nút thêm vào giỏ hàng */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => void handleAddToCart()}
          style={styles.addToCartButton}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartLabel}>🛒 Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
    paddingBottom: 32,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F1F5F9',
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 15,
  },
  details: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productName: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productPrice: {
    marginTop: 4,
    color: '#059669',
    fontSize: 22,
    fontWeight: '800',
  },
  categoryName: {
    marginTop: 4,
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionText: {
    marginTop: 6,
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },
  addToCartButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  addToCartLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
