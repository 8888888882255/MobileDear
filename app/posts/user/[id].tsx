import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { PostCard } from '@/components/PostCard';
import { usePostsStore } from '@/store/posts-store';
import colors from '@/constants/colors';

// Dữ liệu người dùng mẫu
const mockUsers = {
  '1': {
    id: '1',
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Yêu thời trang, thích chia sẻ phong cách cá nhân!',
    postsCount: 12,
    followersCount: 245,
    followingCount: 189,
  },
  '2': {
    id: '2',
    name: 'Trần Thị Bình',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Blogger thời trang, chia sẻ outfit mỗi ngày.',
    postsCount: 8,
    followersCount: 156,
    followingCount: 98,
  },
  '3': {
    id: '3',
    name: 'Lê Minh Hạo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Đam mê khám phá & mặc đẹp mỗi ngày.',
    postsCount: 15,
    followersCount: 89,
    followingCount: 134,
  },
};

export default function UserPostsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getUserPosts } = usePostsStore();
  
  const user = mockUsers[id as keyof typeof mockUsers];
  const userPosts = getUserPosts(id as string);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Không tìm thấy người dùng</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: user.name,
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          
          <Text style={styles.userName}>{user.name}</Text>
          {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.postsCount}</Text>
              <Text style={styles.statLabel}>Bài viết</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.followersCount}</Text>
              <Text style={styles.statLabel}>Người theo dõi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.followingCount}</Text>
              <Text style={styles.statLabel}>Đang theo dõi</Text>
            </View>
          </View>
        </View>

        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Bài viết</Text>
          
          {userPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Chưa có bài viết</Text>
              <Text style={styles.emptyStateSubtext}>
                {user.name} chưa chia sẻ bài viết nào.
              </Text>
            </View>
          ) : (
            <View style={styles.postsContainer}>
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  postsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postsContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
});
