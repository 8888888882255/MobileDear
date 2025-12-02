import { create } from 'zustand';
import { Post, Comment } from '@/types';

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;

  addPost: (content: string, images?: string[]) => void;
  likePost: (postId: string, userId: string) => void;
  unlikePost: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getUserPosts: (userId: string) => Post[];
  deletePost: (postId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [
    {
      id: '1',
      userId: '1',
      userName: 'Nguyễn Văn An',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'Mình vừa nhận được set đồ CROCUS mới! Chất liệu và kiểu dáng đều rất ưng ý. Quá tuyệt cho mùa hè! 🌸',
      images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'],
      likes: 24,
      likedBy: ['2', '3'],
      comments: [
        {
          id: '1',
          userId: '2',
          userName: 'Trần Thị Bình',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          content: 'Đẹp quá luôn á!',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      userId: '2',
      userName: 'Trần Thị Bình',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Tips phối đồ: Kết hợp các chất liệu khác nhau sẽ giúp outfit trông thú vị hơn. Bạn thích kiểu phối nào nhất?',
      likes: 18,
      likedBy: ['1'],
      comments: [],
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      userId: '3',
      userName: 'Lê Minh Hạo',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'Cuối tuần chill cùng bộ sưu tập CROCUS mới. Sẵn sàng cho những chuyến đi chơi! 🧳☀️',
      images: [
        'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop'
      ],
      likes: 32,
      likedBy: ['1', '2'],
      comments: [
        {
          id: '2',
          userId: '1',
          userName: 'Nguyễn Văn An',
          userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          content: 'Phong cách quá đỉnh!',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    }
  ],
  isLoading: false,
  error: null,

  addPost: (content: string, images?: string[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'Nguyễn Văn An',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content,
      images,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      posts: [newPost, ...state.posts]
    }));
  },

  likePost: (postId: string, userId: string) => {
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes + 1,
              likedBy: [...post.likedBy, userId]
            }
          : post
      )
    }));
  },

  unlikePost: (postId: string, userId: string) => {
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: Math.max(0, post.likes - 1),
              likedBy: post.likedBy.filter(id => id !== userId)
            }
          : post
      )
    }));
  },

  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, newComment]
            }
          : post
      )
    }));
  },

  getUserPosts: (userId: string) => {
    return get().posts.filter(post => post.userId === userId);
  },

  deletePost: (postId: string) => {
    set(state => ({
      posts: state.posts.filter(post => post.id !== postId)
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
