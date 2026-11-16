import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  NavigationIndependentTree,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import HomeStackScreen from './HomeStackScreen';
import LoginSqlite from '../screens/LoginSqlite';
import SignupSqlite from '../screens/SignupSqlite';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import { useAuth } from '../auth/AuthContext';
import type { HomeStackParamList } from './HomeStackScreen';

export type BottomTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  AdminTab: undefined;
  SignupSqlite: undefined;
  LoginSqlite: undefined;
  Profile: undefined;
  Cart: undefined;
  OrderTracking: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = () => {
  const { user, isReady } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Tab.Navigator initialRouteName="HomeTab">
          <Tab.Screen
            name="HomeTab"
            component={HomeStackScreen}
            options={{
              title: 'Trang chủ',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size, color }}>🏠</Text>
              ),
            }}
          />
          {isReady && isAdmin ? (
            <>
              <Tab.Screen
                name="AdminTab"
                component={AdminHomeScreen}
                options={{
                  title: 'Quản trị',
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ fontSize: size, color }}>🛡️</Text>
                  ),
                }}
              />
              <Tab.Screen
                name="SignupSqlite"
                component={SignupSqlite}
                options={{
                  title: 'Đăng ký',
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ fontSize: size, color }}>➕</Text>
                  ),
                }}
              />
              <Tab.Screen
                name="LoginSqlite"
                component={LoginSqlite}
                options={{
                  title: 'Đăng nhập',
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ fontSize: size, color }}>🔒</Text>
                  ),
                }}
              />
            </>
          ) : null}
          {isReady && !user ? (
            <>
              <Tab.Screen
                name="SignupSqlite"
                component={SignupSqlite}
                options={{
                  title: 'Đăng ký',
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ fontSize: size, color }}>➕</Text>
                  ),
                }}
              />
              <Tab.Screen
                name="LoginSqlite"
                component={LoginSqlite}
                options={{
                  title: 'Đăng nhập',
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ fontSize: size, color }}>🔒</Text>
                  ),
                }}
              />
            </>
          ) : null}
          {isReady && user && !isAdmin ? (
            <>
              <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                  title: 'Giỏ hàng',
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ fontSize: size, color }}>🛒</Text>
                  ),
                }}
              />
              <Tab.Screen
                name="OrderTracking"
                component={OrderTrackingScreen}
                options={{
                  title: 'Đơn hàng',
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ fontSize: size, color }}>📦</Text>
                  ),
                }}
              />
              <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  title: 'Tài khoản',
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ fontSize: size, color }}>👤</Text>
                  ),
                }}
              />
            </>
          ) : null}
        </Tab.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

export default AppTabs;
