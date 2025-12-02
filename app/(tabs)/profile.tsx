import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
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
  FileText,
  Pencil,
  Newspaper,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/PostCard';
import { useUserStore } from '@/store/user-store';
import { usePostsStore } from '@/store/posts-store';
import colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useUserStore();
  const { getUserPosts } = usePostsStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userPosts = user ? getUserPosts(user.id) : [];

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          setIsLoggingOut(true);
          setTimeout(() => {
            logout();
            setIsLoggingOut(false);
          }, 1000);
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <User size={64} color={colors.textLight} />
          <Text style={styles.notLoggedInTitle}>Chưa đăng nhập</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Vui lòng đăng nhập để xem hồ sơ, đơn hàng và nhiều hơn nữa
          </Text>
          <Button title="Đăng nhập" onPress={handleLogin} style={styles.loginButton} />
          <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.profileHeader} onPress={() => router.push('/profile/edit')}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{user?.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          <Pencil size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Tài khoản của tôi</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
            <View style={styles.menuItemLeft}>
              <Package size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Đơn hàng</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/posts')}>
            <View style={styles.menuItemLeft}>
              <Package size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Đơn hàng</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/wishlist')}>
            <View style={styles.menuItemLeft}>
              <Heart size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Yêu thích</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/addresses')}>
            <View style={styles.menuItemLeft}>
              <MapPin size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Địa chỉ</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/vouchers')}>
            <View style={styles.menuItemLeft}>
              <Ticket size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Voucher</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/change-password')}>
            <View style={styles.menuItemLeft}>
              <Lock size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Đổi mật khẩu</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Cài đặt & Hỗ trợ</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy-policy')}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Chính sách</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/contact')}>
            <View style={styles.menuItemLeft}>
              <MessageSquare size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Liên hệ</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/newsletter')}>
            <View style={styles.menuItemLeft}>
              <Newspaper size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Bản tin</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {userPosts.length > 0 && (
          <View style={styles.menuSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.menuSectionTitle}>Bài viết của tôi</Text>
              <TouchableOpacity onPress={() => router.push(`/posts/user/${user?.id}`)} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {userPosts.slice(0, 2).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}

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
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
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
