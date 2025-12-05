import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
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
  RefreshCw
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/PostCard';
import { useUserStore } from '@/store/user-store';
import { usePostsStore } from '@/store/posts-store';
import colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshUserProfile } = useUserStore();
  const { getUserPosts } = usePostsStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      // Refresh user profile when component mounts
      handleRefreshProfile();
    }
  }, []);
  
  const userPosts = user ? getUserPosts(user.id) : [];
  
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
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đăng xuất", 
          style: "destructive", 
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } finally {
              setIsLoggingOut(false);
            }
          } 
        }
      ]
    );
  };
  
  const navigateToAdminDashboard = () => {
    router.push('/admin/dashboard');
  };
  
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <User size={64} color={colors.textLight} />
          <Text style={styles.notLoggedInTitle}>Not logged in</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Login to view your profile, orders, and more
          </Text>
          <Button
            title="Login"
            onPress={handleLogin}
            style={styles.loginButton}
          />
          <TouchableOpacity 
            onPress={() => router.push('/auth/register')}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>
              Don't have an account? Register
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
                source={{ uri: user.avatar }} 
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
          <Text style={styles.menuSectionTitle}>My Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('Orders navigation - to be implemented')}
          >
            <View style={styles.menuItemLeft}>
              <Package size={20} color={colors.text} />
              <Text style={styles.menuItemText}>My Orders</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/wishlist')}
          >
            <View style={styles.menuItemLeft}>
              <Heart size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Wishlist</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('Addresses navigation - to be implemented')}
          >
            <View style={styles.menuItemLeft}>
              <MapPin size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Addresses</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('Vouchers navigation - to be implemented')}
          >
            <View style={styles.menuItemLeft}>
              <Ticket size={20} color={colors.text} />
              <Text style={styles.menuItemText}>My Vouchers</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/change-password')}
          >
            <View style={styles.menuItemLeft}>
              <Lock size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Settings & Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('Settings navigation - to be implemented')}
          >
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={colors.text} />
              <Text style={styles.menuItemText}>App Settings</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('Contact navigation - to be implemented')}
          >
            <View style={styles.menuItemLeft}>
              <MessageSquare size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Contact Us</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {userPosts.length > 0 && (
          <View style={styles.menuSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.menuSectionTitle}>My Posts</Text>
              <TouchableOpacity 
                onPress={() => console.log('User posts navigation - to be implemented')}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {userPosts.slice(0, 2).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}
        
        <Button
          title="Logout"
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