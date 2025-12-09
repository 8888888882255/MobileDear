import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Ticket,
  MessageSquare,
  Lock,
  RefreshCw
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import Constants from 'expo-constants';
import { showDestructiveConfirm } from '@/src/utils/alert';

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://localhost:5083';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshUserProfile } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      handleRefreshProfile();
    }
  }, []);

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    console.log('Profile - handleLogout called');

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (!confirmed) return;

      setIsLoggingOut(true);
      logout()
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Đã đăng xuất thành công!',
          });
        })
        .catch((error) => {
          console.error('Profile - Logout error:', error);
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không thể đăng xuất. Vui lòng thử lại.',
          });
        })
        .finally(() => {
          setIsLoggingOut(false);
        });
    } else {
      showDestructiveConfirm(
        "Đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất?",
        "Đăng xuất",
        async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            Toast.show({
              type: 'success',
              text1: 'Thành công',
              text2: 'Đã đăng xuất thành công!',
            });
          } catch (error) {
            console.error('Profile - Logout error:', error);
            Toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: 'Không thể đăng xuất. Vui lòng thử lại.',
            });
          } finally {
            setIsLoggingOut(false);
          }
        }
      );
    }
  };

  const navigateToAdminDashboard = () => {
    router.push('/admin/dashboard');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <User size={64} color={colors.textLight} />
          <Text style={styles.notLoggedInTitle}>Chưa đăng nhập</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Đăng nhập để xem hồ sơ, đơn hàng và nhiều hơn nữa
          </Text>
          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            style={styles.loginButton}
          />
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>
              Chưa có tài khoản? Đăng ký ngay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}` }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshProfile}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={16}
                color={isRefreshing ? colors.textLight : colors.primary}
                style={isRefreshing ? { transform: [{ rotate: '360deg' }] } : undefined}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.replace('/profile/edit')}
            >
              <Text style={styles.editProfileText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {user?.isAdmin && (
          <TouchableOpacity
            style={[styles.menuItem, styles.adminMenuItem]}
            onPress={navigateToAdminDashboard}
          >
            <View style={styles.menuItemLeft}>
              <ShieldCheck size={20} color="#fff" />
              <Text style={styles.adminMenuItemText}>Admin Dashboard</Text>
            </View>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Tài khoản của tôi</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/change-password')}
          >
            <View style={styles.menuItemLeft}>
              <Lock size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Đổi mật khẩu</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/wishlist')}
          >
            <View style={styles.menuItemLeft}>
              <Heart size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Danh sách yêu thích</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}
          onPress={() => router.push('/search')}>
            <View style={styles.menuItemLeft}>
              <Ticket size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Cửa hàng của tôi</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}
            onPress={() => router.push('/')}
          >
            <View style={styles.menuItemLeft}>
              <Package size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Trang Chủ</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>




        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Cài đặt & Hỗ trợ</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Cài đặt ứng dụng</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MessageSquare size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Liên hệ hỗ trợ</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <Button
          title="Đăng xuất"
          variant="outline"
          onPress={handleLogout}
          loading={isLoggingOut}
          style={styles.logoutButton}
        />
      </ScrollView>
    </View>
  );
}

// Styles giữ nguyên (không thay đổi)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editProfileText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  adminMenuItem: {
    backgroundColor: colors.primary,
    marginBottom: 24,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  adminMenuItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    width: 200,
    marginBottom: 16,
  },
  registerButton: {
    padding: 8,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
});