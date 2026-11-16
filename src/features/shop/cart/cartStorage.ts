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
