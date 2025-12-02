import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { PostCard } from '@/components/PostCard';
import { usePostsStore } from '@/store/posts-store';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function PostsScreen() {
  const router = useRouter();
  const { posts } = usePostsStore();
  const { isAuthenticated } = useUserStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Giả lập fetch dữ liệu mới từ server
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/posts/create');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cộng đồng</Text>
        {isAuthenticated && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Chưa có bài viết nào</Text>
            <Text style={styles.emptyStateSubtext}>
              Hãy là người đầu tiên chia sẻ điều gì đó với cộng đồng!
            </Text>
          </View>
        ) : (
          <View style={styles.postsContainer}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  createButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  postsContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
});
