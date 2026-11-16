import React, { useCallback, useEffect, useState } from 'react';
import { useCanGoBack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import {
  addUser,
  deleteUser,
  fetchUsers,
  initDatabase,
  updateUser,
  type User,
} from '../database/database';
import { formatUserRole } from '../utils/displayFormatters';

const UserScreen = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { user: currentAuthUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form thêm user mới
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  // Modal sửa user
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');

  // Modal xác nhận xóa
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const loadData = useCallback(async () => {
    try {
      await initDatabase();
      const list = await fetchUsers();
      setUsers(list);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    const init = async () => {
      try {
        await initDatabase();
        const list = await fetchUsers();
        if (isActive) {
          setUsers(list);
        }
      } catch (error) {
        console.error('Error initializing users:', error);
        if (isActive) {
          Alert.alert('Lỗi', 'Không thể tải danh sách người dùng.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void init();
    return () => {
      isActive = false;
    };
  }, []);

  const handleAddUser = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await addUser(trimmedUsername, password.trim(), role);
      if (!created) {
        Alert.alert('Không thể tạo', `Tên đăng nhập "${trimmedUsername}" đã tồn tại!`);
        return;
      }
      setUsername('');
      setPassword('');
      setRole('user');
      Alert.alert(
        'Thành công',
        `Đã tạo tài khoản "${trimmedUsername}" (${formatUserRole(role)})`,
      );
      await loadData();
    } catch (error) {
      console.error('Error adding user:', error);
      Alert.alert('Lỗi', 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPassword(user.password);
    setEditRole((user.role === 'admin' ? 'admin' : 'user'));
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    const trimmedUsername = editUsername.trim();
    if (!trimmedUsername || !editPassword.trim()) {
      Alert.alert('Thông báo', 'Tên đăng nhập và mật khẩu không được để trống!');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUser({
        id: editingUser.id,
        username: trimmedUsername,
        password: editPassword.trim(),
        role: editRole,
      });
      setEditModalVisible(false);
      setEditingUser(null);
      Alert.alert('Thành công', 'Đã cập nhật thông tin người dùng!');
      await loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật người dùng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (user: User) => {
    if (currentAuthUser && currentAuthUser.id === user.id) {
      Alert.alert(
        'Không được phép',
        'Bạn không thể xóa tài khoản quản trị viên đang đăng nhập.',
      );
      return;
    }
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsSubmitting(true);
      await deleteUser(userToDelete.id);
      setDeleteModalVisible(false);
      setUserToDelete(null);
      Alert.alert('Thành công', 'Đã xóa người dùng!');
      await loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Lỗi', 'Không thể xóa người dùng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại màn hình trước"
        hitSlop={8}
        onPress={() => {
          if (canGoBack) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <Text style={styles.backIcon}>‹</Text>
        <Text style={styles.backText}>Quay lại</Text>
      </Pressable>

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Quản Lý Người Dùng</Text>
          <Text style={styles.subtitle}>Quản lý tài khoản và phân quyền</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{users.length} tài khoản</Text>
        </View>
      </View>

      <View style={styles.addCard}>
        <Text style={styles.formTitle}>Thêm người dùng mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          editable={!isSubmitting}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          editable={!isSubmitting}
        />
        <View style={styles.roleSelector}>
          <Text style={styles.roleLabel}>Vai trò:</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'user' && styles.roleOptionActiveUser,
              ]}
              onPress={() => setRole('user')}
            >
              <Text
                style={[
                  styles.roleOptionText,
                  role === 'user' && styles.roleOptionTextActive,
                ]}
              >
                👤 Người dùng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'admin' && styles.roleOptionActiveAdmin,
              ]}
              onPress={() => setRole('admin')}
            >
              <Text
                style={[
                  styles.roleOptionText,
                  role === 'admin' && styles.roleOptionTextActive,
                ]}
              >
                👑 Quản trị viên
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleAddUser}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>+ Thêm Người Dùng</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E85D75" />
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isAdmin = item.role === 'admin';
            const isCurrent = currentAuthUser?.id === item.id;
            return (
              <View style={styles.card}>
                <View style={styles.userInfo}>
                  <View
                    style={[
                      styles.avatarBadge,
                      isAdmin ? styles.avatarAdmin : styles.avatarUser,
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {isAdmin ? '👑' : '👤'}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <View style={styles.usernameRow}>
                      <Text style={styles.userName}>{item.username}</Text>
                      {isCurrent ? (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Đang dùng</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.metaRow}>
                      <View
                        style={[
                          styles.roleTag,
                          isAdmin ? styles.roleTagAdmin : styles.roleTagUser,
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleTagText,
                            isAdmin ? styles.roleTagTextAdmin : styles.roleTagTextUser,
                          ]}
                        >
                          {isAdmin ? 'Quản trị viên' : 'Người dùng'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Sửa ${item.username}`}
                    style={styles.actionButton}
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Text style={styles.actionIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Xóa ${item.username}`}
                    disabled={isCurrent}
                    style={[
                      styles.actionButton,
                      styles.deleteAction,
                      isCurrent && styles.actionDisabled,
                    ]}
                    onPress={() => handleOpenDelete(item)}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có người dùng nào.</Text>
          }
        />
      )}

      {/* Modal chỉnh sửa người dùng */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sửa Thông Tin Người Dùng</Text>
              <Text style={styles.inputLabel}>Tên đăng nhập</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập"
                placeholderTextColor="#888"
                autoCapitalize="none"
                value={editUsername}
                onChangeText={setEditUsername}
              />
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#888"
                autoCapitalize="none"
                value={editPassword}
                onChangeText={setEditPassword}
              />
              <Text style={styles.inputLabel}>Vai trò</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    editRole === 'user' && styles.roleOptionActiveUser,
                  ]}
                  onPress={() => setEditRole('user')}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      editRole === 'user' && styles.roleOptionTextActive,
                    ]}
                  >
                    👤 Người dùng
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    editRole === 'admin' && styles.roleOptionActiveAdmin,
                  ]}
                  onPress={() => setEditRole('admin')}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      editRole === 'admin' && styles.roleOptionTextActive,
                    ]}
                  >
                    👑 Quản trị
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditingUser(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Xác Nhận Xóa */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác Nhận Xóa</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa tài khoản{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {`"${userToDelete?.username ?? ''}"`}
              </Text>{' '}
              không?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setUserToDelete(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 24 : 48,
    backgroundColor: '#F4F6FA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  backButtonPressed: { opacity: 0.6 },
  backIcon: { fontSize: 28, lineHeight: 30, color: '#17243B', marginRight: 6 },
  backText: { fontSize: 16, color: '#17243B', fontWeight: '600' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#17243B' },
  subtitle: { fontSize: 12, color: '#818A99', marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF0F2',
  },
  badgeText: { color: '#E85D75', fontSize: 12, fontWeight: '700' },
  addCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
    color: '#101828',
    backgroundColor: '#fff',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475467',
    marginBottom: 4,
  },
  roleSelector: {
    marginBottom: 12,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475467',
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  roleOptionActiveUser: {
    backgroundColor: '#EEF3FF',
    borderColor: '#4D7CFE',
  },
  roleOptionActiveAdmin: {
    backgroundColor: '#FFF0F2',
    borderColor: '#E85D75',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667085',
  },
  roleOptionTextActive: {
    color: '#101828',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#E85D75',
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  listContent: { paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarUser: { backgroundColor: '#EEF3FF' },
  avatarAdmin: { backgroundColor: '#FFF0F2' },
  avatarText: { fontSize: 20 },
  userDetails: { flex: 1 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontWeight: '700', fontSize: 15, color: '#101828' },
  currentBadge: {
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: { fontSize: 10, color: '#027A48', fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleTagUser: { backgroundColor: '#F0F4FF' },
  roleTagAdmin: { backgroundColor: '#FFF0F2' },
  roleTagText: { fontSize: 11, fontWeight: '700' },
  roleTagTextUser: { color: '#4D7CFE' },
  roleTagTextAdmin: { color: '#E85D75' },
  userIdText: { fontSize: 11, color: '#818A99' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
  },
  deleteAction: {
    backgroundColor: '#FFF0F0',
  },
  actionDisabled: {
    opacity: 0.3,
  },
  actionIcon: { fontSize: 16 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 8, color: '#667085', fontSize: 13 },
  emptyText: {
    textAlign: 'center',
    color: '#818A99',
    marginTop: 24,
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#475467',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: { backgroundColor: '#F0F2F5' },
  cancelButtonText: { color: '#344054', fontWeight: '600' },
  saveButton: { backgroundColor: '#E85D75' },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  deleteButton: { backgroundColor: '#D92D20' },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
});
