import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getUserByCredentials, initDatabase } from '../database/database';
import type { BottomTabParamList } from '../navigation/AppTabs';
import { useAuth } from '../auth/AuthContext';

type LoginNavigationProp = BottomTabNavigationProp<BottomTabParamList>;

export default function LoginSqlite() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await initDatabase();
      const user = await getUserByCredentials(username.trim(), password);
      if (!user) {
        Alert.alert('Đăng nhập thất bại', 'Tên đăng nhập hoặc mật khẩu không đúng.');
        return;
      }

      await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));
      setUser(user);
      if (user.role === 'admin') {
        navigation.navigate('AdminTab');
      } else {
        navigation.navigate('HomeTab', {
          screen: 'Home',
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Lỗi', 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="username"
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          editable={!isSubmitting}
          accessibilityLabel="Tên đăng nhập"
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          secureTextEntry
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          editable={!isSubmitting}
          accessibilityLabel="Mật khẩu"
        />
        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.button,
            (pressed || isSubmitting) && styles.buttonMuted,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonLabel}>Đăng nhập</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('SignupSqlite')}
          style={styles.linkButton}
        >
          <Text style={styles.linkLabel}>Chưa có tài khoản? Đăng ký</Text>
        </Pressable>
        <Text style={styles.adminHint}>
          Tài khoản quản trị mặc định: admin / 123456
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  card: {
    padding: 22,
    borderRadius: 18,
    backgroundColor: '#fff',
    elevation: 3,
  },
  title: {
    color: '#1d2939',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    color: '#667085',
  },
  input: {
    minHeight: 50,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    color: '#101828',
  },
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#1769aa',
  },
  buttonMuted: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  linkLabel: {
    color: '#1769aa',
    fontWeight: '600',
  },
  adminHint: {
    color: '#98a2b3',
    fontSize: 12,
    textAlign: 'center',
  },
});
