import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Product } from '../database/database';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen1 from '../screens/ProductDetailScreen1';
import ProductsByCategoryScreen from '../screens/ProductsByCategoryScreen';

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { product: Product };
  ProductsByCategory: { categoryId: number; categoryName: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackScreen() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Sản phẩm' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen1}
        options={{ title: 'Chi tiết sản phẩm' }}
      />
      <Stack.Screen
        name="ProductsByCategory"
        component={ProductsByCategoryScreen}
        options={{ title: 'Sản phẩm theo danh mục' }}
      />
    </Stack.Navigator>
  );
}