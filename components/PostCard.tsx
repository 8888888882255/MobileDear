import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Share, Send, MoreHorizontal } from 'lucide-react-native';
import { Post } from '@/types';
import { usePostsStore } from '@/store/posts-store';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const { likePost, unlikePost, addComment, deletePost } = usePostsStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isLiked = user ? post.likedBy.includes(user.id) : false;
  const canDelete = user?.id === post.userId || user?.isAdmin;

  const handleLike = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (isLiked) {
      unlikePost(post.id, user.id);
    } else {
      likePost(post.id, user.id);
    }
  };

  const handleComment = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    
    addComment(post.id, {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentText.trim(),
    });

    setCommentText('');
    setIsSubmittingComment(false);
  };

  const handleUserPress = () => {
    router.push(`/posts/user/${post.userId}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deletePost(post.id)
        }
      ]
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return postDate.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
          {post.userAvatar ? (
            <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {post.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        
        {canDelete && (
          <TouchableOpacity onPress={handleDelete} style={styles.moreButton}>
            <MoreHorizontal size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.images && post.images.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
        >
          {post.images.map((image, index) => (
            <Image 
              key={index} 
              source={{ uri: image }} 
              style={styles.postImage} 
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart 
            size={20} 
            color={isLiked ? colors.error : colors.textLight}
            fill={isLiked ? colors.error : 'none'}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} color={colors.textLight} />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {showComments && (
        <View style={styles.commentsSection}>
          {post.comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <TouchableOpacity onPress={() => router.push(`/posts/user/${comment.userId}`)}>
                {comment.userAvatar ? (
                  <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
                ) : (
                  <View style={styles.commentAvatarPlaceholder}>
                    <Text style={styles.commentAvatarText}>
                      {comment.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.commentContent}>
                <Text style={styles.commentUserName}>{comment.userName}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</Text>
              </View>
            </View>
          ))}

          {user && (
            <View style={styles.commentInput}>
              <Image 
                source={{ uri: user.avatar || '' }} 
                style={styles.commentAvatar}
                defaultSource={{ uri: 'https://via.placeholder.com/32' }}
              />
              <TextInput
                style={styles.commentTextInput}
                placeholder="Write a comment..."
                placeholderTextColor={colors.textLight}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity 
                onPress={handleComment}
                disabled={!commentText.trim() || isSubmittingComment}
                style={[
                  styles.sendButton,
                  (!commentText.trim() || isSubmittingComment) && styles.sendButtonDisabled
                ]}
              >
                <Send size={16} color={commentText.trim() ? colors.primary : colors.textLight} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  postImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  likedText: {
    color: colors.error,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});