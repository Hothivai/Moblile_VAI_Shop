# BÁO CÁO BÀI TẬP BUỔI 14
## CHỨC NĂNG GIỎ HÀNG & THANH TOÁN ĐẶT HÀNG (SHOPPING CART & CHECKOUT)

- **Môn học:** Lập trình Di động 2 (React Native / Expo SDK 58)
- **Sinh viên thực hiện:** Hồ Thị Vãi
- **Lớp:** PNV27A
- **File Word hoàn chỉnh đã tạo:** [BAO_CAO_BUOI_14_GIO_HANG.docx](file:///c:/LapTrinhDiDong2/MyExpoApp/BAO_CAO_BUOI_14_GIO_HANG.docx)

---

## I. TỔNG QUAN LUỒNG CHỨC NĂNG GIỎ HÀNG (BUỔI 14)

Chức năng Giỏ hàng được xây dựng khép kín gồm các thành phần:
1. **Lưu trữ & Logic Giỏ hàng (`cartStorage.ts`)**: Sử dụng `AsyncStorage` theo `userId` người dùng để lưu danh sách món, số lượng, cập nhật tăng/giảm (+/-) và xóa.
2. **Chi tiết sản phẩm & Thêm vào giỏ (`ProductDetailScreen1.tsx`)**: Hiển thị nút "Thêm vào giỏ hàng" khi User đã đăng nhập, tự động cộng dồn số lượng.
3. **Giao diện Giỏ hàng (`CartScreen.tsx`)**: Danh sách sản phẩm trong giỏ, nút (+)/(-) số lượng, nút (✕) xóa sản phẩm, tính tổng tiền động và nút "🛍️ Thanh toán & Đặt hàng".
4. **Cơ sở dữ liệu Đơn hàng (`database.ts`)**: Bảng `orders` trong SQLite lưu vết các đơn hàng sau khi thanh toán thành công (`userId`, `items`, `total`, `status`, `createdAt`).
5. **Lịch sử đơn hàng (`ProfileScreen.tsx`)**: Xem lại các đơn đã đặt và trạng thái đơn hàng.
6. **Điều hướng (`AppTabs.tsx`)**: Hiển thị Tab "🛒 Giỏ hàng" trên thanh điều hướng Bottom Tab.

---

## II. CHI TIẾT MÃ NGUỒN VÀ HÌNH ẢNH MINH CHỨNG TỪNG TÍNH NĂNG

### 1. Module Lưu trữ & Logic Giỏ hàng (`src/cart/cartStorage.ts`)

> **Chức năng:** Cung cấp các hàm xử lý dữ liệu: `getCartItems`, `addCartItem`, `updateCartItemQuantity`, `removeCartItem`, `clearCart`.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../database/database';

export type CartItem = {
  product: Product;
  quantity: number;
};

const getCartKey = (userId: number) => `cart:${userId}`;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Partial<CartItem>;
  const product = item.product;
  return (
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof product === 'object' &&
    product !== null &&
    typeof product.id === 'number' &&
    typeof product.name === 'string' &&
    typeof product.price === 'number' &&
    typeof product.img === 'string' &&
    typeof product.categoryId === 'number'
  );
}

export async function getCartItems(userId: number): Promise<CartItem[]> {
  const storedItems = await AsyncStorage.getItem(getCartKey(userId));
  if (!storedItems) {
    return [];
  }

  const parsedItems: unknown = JSON.parse(storedItems);
  if (!Array.isArray(parsedItems) || !parsedItems.every(isCartItem)) {
    throw new Error('Dữ liệu giỏ hàng đã lưu không hợp lệ.');
  }
  return parsedItems;
}

export async function addCartItem(userId: number, product: Product) {
  const items = await getCartItems(userId);
  const existingItem = items.find((item) => item.product.id === product.id);
  const updatedItems = existingItem
    ? items.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    : [...items, { product, quantity: 1 }];

  await AsyncStorage.setItem(getCartKey(userId), JSON.stringify(updatedItems));
}

export async function removeCartItem(userId: number, productId: number) {
  const items = await getCartItems(userId);
  const updatedItems = items.filter((item) => item.product.id !== productId);
  await AsyncStorage.setItem(getCartKey(userId), JSON.stringify(updatedItems));
}

export async function updateCartItemQuantity(
  userId: number,
  productId: number,
  quantity: number,
) {
  if (quantity <= 0) {
    await removeCartItem(userId, productId);
    return;
  }
  const items = await getCartItems(userId);
  const updatedItems = items.map((item) =>
    item.product.id === productId ? { ...item, quantity } : item,
  );
  await AsyncStorage.setItem(getCartKey(userId), JSON.stringify(updatedItems));
}

export async function clearCart(userId: number) {
  await AsyncStorage.removeItem(getCartKey(userId));
}
```

---

### 2. Màn hình Chi tiết sản phẩm & Thêm vào giỏ (`src/screens/ProductDetailScreen1.tsx`)

> **Chức năng:** Xem thông tin sản phẩm và có nút "Thêm vào giỏ hàng" (`handleAddToCart`).

```typescript
import { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
    if (!user || user.role !== 'user') return;
    try {
      await addCartItem(user.id, product);
      Alert.alert('Đã thêm vào giỏ hàng', `${product.name} đã được thêm vào giỏ hàng.`);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CategorySelector
        categories={categories}
        selectedId={product.categoryId}
        onSelect={handleCategorySelect}
      />
      {imageSource ? (
        <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
      ) : (
        <View style={[styles.productImage, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>Không có ảnh sản phẩm</Text>
        </View>
      )}
      <View style={styles.details}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.label}>Giá</Text>
        <Text style={styles.productPrice}>
          {product.price.toLocaleString('vi-VN')} đ
        </Text>
        <Text style={styles.label}>Danh mục sản phẩm</Text>
        {isLoadingCategory ? (
          <ActivityIndicator
            style={styles.categoryLoader}
            accessibilityLabel="Đang tải danh mục"
          />
        ) : (
          <Text style={styles.categoryName}>
            {categoryError ?? categoryName ?? 'Không xác định'}
          </Text>
        )}
        {user?.role === 'user' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void handleAddToCart()}
            style={({ pressed }) => [
              styles.addToCartButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.addToCartLabel}>Thêm vào giỏ hàng</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: '#e8ecf4',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    color: '#596579',
    fontSize: 15,
  },
  details: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  productName: {
    marginBottom: 20,
    color: '#1d2939',
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    marginTop: 12,
    color: '#667085',
    fontSize: 14,
  },
  productPrice: {
    marginTop: 4,
    color: '#147d56',
    fontSize: 20,
    fontWeight: '700',
  },
  categoryName: {
    marginTop: 4,
    color: '#1d2939',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryLoader: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addToCartButton: {
    marginTop: 24,
    backgroundColor: '#1769aa',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  addToCartLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
```

#### 📸 HÌNH ẢNH MINH CHỨNG 1: Chi tiết sản phẩm & Thêm vào giỏ hàng
> *(Dán ảnh chụp màn hình điện thoại/web tại Chi tiết sản phẩm có nút "Thêm vào giỏ hàng" và Alert thông báo)*
> 
> ```
> +-----------------------------------------------------------------------+
> | [DÁN ẢNH CHỤP MÀN HÌNH CHI TIẾT SẢN PHẨM & THÊM VÀO GIỎ VÀO ĐÂY]      |
> +-----------------------------------------------------------------------+
> ```

---

### 3. Giao diện Màn hình Giỏ hàng (`src/screens/CartScreen.tsx`)

> **Chức năng:** Quản lý món hàng trong giỏ, tăng giảm số lượng (+/-), xóa sản phẩm, tính tổng tiền và Đặt hàng.

```typescript
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { createOrder } from '../database/database';
import { getProductImageSource } from '../productImages';
import {
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from '../cart/cartStorage';

export default function CartScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (!user || user.role !== 'user') {
        setItems([]);
        return;
      }
      const cartItems = await getCartItems(user.id);
      setItems(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      setErrorMessage('Không thể tải giỏ hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadCart();
    }, [loadCart]),
  );

  const handleUpdateQuantity = async (productId: number, currentQuantity: number, change: number) => {
    if (!user) return;
    const newQty = currentQuantity + change;
    try {
      await updateCartItemQuantity(user.id, productId, newQty);
      if (newQty <= 0) {
        setItems((currentItems) =>
          currentItems.filter((item) => item.product.id !== productId),
        );
      } else {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.product.id === productId ? { ...item, quantity: newQty } : item,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng.');
    }
  };

  const handleRemove = async (productId: number) => {
    if (!user) return;
    try {
      await removeCartItem(user.id, productId);
      setItems((currentItems) =>
        currentItems.filter((item) => item.product.id !== productId),
      );
    } catch (error) {
      console.error('Error removing cart item:', error);
      setErrorMessage('Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.');
    }
  };

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;

    Alert.alert(
      'Xác nhận đặt hàng',
      `Bạn có muốn đặt hàng với tổng số tiền ${total.toLocaleString('vi-VN')} đ không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt hàng',
          onPress: async () => {
            try {
              setIsCheckingOut(true);
              const itemsSummary = items
                .map((i) => `${i.product.name} (x${i.quantity})`)
                .join(', ');
              await createOrder(user.id, itemsSummary, total);
              await clearCart(user.id);
              setItems([]);
              Alert.alert(
                'Thành công',
                '🎉 Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận vào hệ thống.',
              );
            } catch (error) {
              console.error('Error checkout:', error);
              Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
            } finally {
              setIsCheckingOut(false);
            }
          },
        },
      ],
    );
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" accessibilityLabel="Đang tải giỏ hàng" />
        </View>
      ) : errorMessage ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.product.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const imageSource = getProductImageSource(
              item.product.img,
              item.product.categoryId,
            );
            return (
              <View style={styles.itemCard}>
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.productImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderText}>Không có ảnh</Text>
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productPrice}>
                    {item.product.price.toLocaleString('vi-VN')} đ
                  </Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() =>
                        void handleUpdateQuantity(item.product.id, item.quantity, -1)
                      }
                    >
                      <Text style={styles.qtyButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() =>
                        void handleUpdateQuantity(item.product.id, item.quantity, 1)
                      }
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa ${item.product.name} khỏi giỏ hàng`}
                  onPress={() => void handleRemove(item.product.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeLabel}>✕</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
          }
          ListFooterComponent={
            items.length ? (
              <View style={styles.footerContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalValue}>
                    {total.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isCheckingOut}
                  style={[
                    styles.checkoutButton,
                    isCheckingOut && styles.buttonDisabled,
                  ]}
                  onPress={handleCheckout}
                >
                  {isCheckingOut ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.checkoutText}>
                      🛍️ Thanh toán &amp; Đặt hàng
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : undefined
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
    flexGrow: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#e8ecf4',
  },
  placeholderText: {
    color: '#596579',
    fontSize: 11,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  productName: {
    color: '#1d2939',
    fontSize: 15,
    fontWeight: '600',
  },
  productPrice: {
    marginTop: 4,
    color: '#147d56',
    fontSize: 14,
    fontWeight: '700',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
    color: '#111827',
  },
  removeButton: {
    padding: 8,
  },
  removeLabel: {
    color: '#b42318',
    fontWeight: '700',
    fontSize: 16,
  },
  footerContainer: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  totalLabel: {
    color: '#1d2939',
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    color: '#147d56',
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutButton: {
    marginTop: 12,
    backgroundColor: '#1769aa',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 36,
    color: '#667085',
    textAlign: 'center',
  },
  errorText: {
    color: '#b42318',
    textAlign: 'center',
  },
});
```

#### 📸 HÌNH ẢNH MINH CHỨNG 2: Màn hình Giỏ hàng & Thao tác Tăng/Giảm số lượng
> *(Dán ảnh chụp màn hình Giỏ hàng với danh sách món, nút tăng/giảm (+/-) và tổng số tiền)*
> 
> ```
> +-----------------------------------------------------------------------+
> | [DÁN ẢNH CHỤP MÀN HÌNH GIỎ HÀNG CÓ CÁC MÓN & NÚT + / - VÀO ĐÂY]       |
> +-----------------------------------------------------------------------+
> ```

#### 📸 HÌNH ẢNH MINH CHỨNG 3: Xác nhận Thanh toán & Đặt hàng thành công
> *(Dán ảnh chụp màn hình hộp thoại Alert xác nhận đặt hàng và thông báo thành công)*
> 
> ```
> +-----------------------------------------------------------------------+
> | [DÁN ẢNH CHỤP MÀN HÌNH ALERT ĐẶT HÀNG THÀNH CÔNG VÀO ĐÂY]            |
> +-----------------------------------------------------------------------+
> ```

---

### 4. Xử lý Đơn hàng trong Cơ sở dữ liệu SQLite (`src/database/database.ts`)

> **Chức năng:** Tạo bảng `orders`, lưu đơn hàng `createOrder`, lấy đơn theo user `fetchOrdersByUserId`.

```typescript
export type Order = {
  id: number;
  userId: number;
  items: string;
  total: number;
  status: string;
  createdAt: string;
};

// Khởi tạo bảng orders trong initDatabase:
await database.execAsync(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    items TEXT,
    total REAL,
    status TEXT DEFAULT 'Đang xử lý',
    createdAt TEXT
  );
`);

// Tạo đơn hàng mới khi thanh toán giỏ hàng:
export const createOrder = async (
  userId: number,
  items: string,
  total: number,
): Promise<void> => {
  const database = await getDb();
  const createdAt = new Date().toLocaleString("vi-VN");
  await database.runAsync(
    "INSERT INTO orders (userId, items, total, status, createdAt) VALUES (?, ?, ?, ?, ?)",
    [userId, items, total, "Đang xử lý", createdAt],
  );
};

// Lấy lịch sử đơn hàng của người dùng:
export const fetchOrdersByUserId = async (userId: number): Promise<Order[]> => {
  const database = await getDb();
  return database.getAllAsync<Order>(
    "SELECT * FROM orders WHERE userId = ? ORDER BY id DESC",
    [userId],
  );
};

// Cập nhật trạng thái đơn hàng (Dành cho Admin duyệt đơn):
export const updateOrderStatus = async (
  orderId: number,
  status: string,
): Promise<void> => {
  const database = await getDb();
  await database.runAsync("UPDATE orders SET status = ? WHERE id = ?", [
    status,
    orderId,
  ]);
};
```

---

### 5. Xem Lịch sử Đơn hàng sau khi đặt (`src/screens/ProfileScreen.tsx`)

> **Chức năng:** Hiển thị danh sách các đơn hàng đã đặt thành công từ giỏ hàng.

#### 📸 HÌNH ẢNH MINH CHỨNG 4: Lịch sử đơn hàng trong Profile
> *(Dán ảnh chụp màn hình Modal lịch sử đơn hàng)*
> 
> ```
> +-----------------------------------------------------------------------+
> | [DÁN ẢNH CHỤP MÀN HÌNH LỊCH SỬ ĐƠN HÀNG VÀO ĐÂY]                      |
> +-----------------------------------------------------------------------+
> ```

---

### 6. Cấu hình Bottom Tab tích hợp Giỏ hàng (`src/navigation/AppTabs.tsx`)

> **Chức năng:** Tích hợp Tab Giỏ hàng `🛒` cho tài khoản User.

#### 📸 HÌNH ẢNH MINH CHỨNG 5: Bottom Tab có Giỏ hàng
> *(Dán ảnh chụp màn hình thanh điều hướng Bottom Tab)*
> 
> ```
> +-----------------------------------------------------------------------+
> | [DÁN ẢNH CHỤP MÀN HÌNH BOTTOM TAB CÓ TAB GIỎ HÀNG 🛒 VÀO ĐÂY]         |
> +-----------------------------------------------------------------------+
> ```

