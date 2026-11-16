import { useState } from 'react';
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
import { addUser, initDatabase } from '../database/database';
import type { BottomTabParamList } from '../navigation/AppTabs';

type SignupNavigationProp = BottomTabNavigationProp<BottomTabParamList>;

export default function SignupSqlite() {
  const navigation = useNavigation<SignupNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await initDatabase();
      const created = await addUser(username.trim(), password, 'user');
      if (!created) {
        Alert.alert('Không thể đăng ký', 'Tên đăng nhập đã tồn tại.');
        return;
      }

      Alert.alert('Thành công', 'Tạo tài khoản thành công. Vui lòng đăng nhập.');
      navigation.navigate('LoginSqlite');
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Lỗi', 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Đăng ký tài khoản người dùng mới</Text>
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
          autoComplete="new-password"
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
          onPress={handleSignup}
          style={({ pressed }) => [
            styles.button,
            (pressed || isSubmitting) && styles.buttonMuted,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonLabel}>Đăng ký</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('LoginSqlite')}
          style={styles.linkButton}
        >
          <Text style={styles.linkLabel}>Đã có tài khoản? Đăng nhập</Text>
        </Pressable>
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
});
