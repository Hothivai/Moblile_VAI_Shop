import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import type { BottomTabParamList } from '../navigation/AppTabs';
import { formatUserRole } from '../utils/displayFormatters';

export default function Header() {
  const navigation = useNavigation<NavigationProp<BottomTabParamList>>();
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('loggedInUser');
      setUser(null);
      navigation.navigate('HomeTab');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.title}>VAI shop TT</Text>
        {user ? (
          <Text style={styles.greeting}>
            Xin chào, {user.username} · {formatUserRole(user.role)}
          </Text>
        ) : (
          <Text style={styles.greeting}>Vui lòng đăng nhập để mua sắm</Text>
        )}
      </View>
      {user ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.logoutLabel}>Đăng Xuất</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  greetingContainer: {
    flex: 1,
  },
  title: {
    color: '#1d2939',
    fontSize: 20,
    fontWeight: '700',
  },
  greeting: {
    marginTop: 4,
    color: '#667085',
    fontSize: 13,
  },
  logoutButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#fff0f0',
  },
  logoutLabel: {
    color: '#b42318',
    fontSize: 13,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
