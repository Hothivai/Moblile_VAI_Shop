import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Product } from '../database/database';
import ProductDetailScreen1 from '../screens/ProductDetailScreen1';
import ProductManagementScreen from '../screens/ProductManagementScreen';

export type RootStackParamList = {
  Sanpham3Sqlite: undefined;
  ProductDetail: { product: Product };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigatorProduct() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Sanpham3Sqlite"
            component={ProductManagementScreen}
            options={{ title: 'Quản lý sản phẩm' }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen1}
            options={{ title: 'Chi tiết sản phẩm' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}