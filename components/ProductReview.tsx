import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, ThumbsUp } from 'lucide-react-native';
import colors from '@/constants/colors';

type ReviewImage = string;

type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  images: ReviewImage[];
  helpful?: number;
};

interface ProductReviewProps {
  review: Review;
}

export const ProductReview: React.FC<ProductReviewProps> = ({ review }) => {
  const [isHelpful, setIsHelpful] = React.useState(false);
  const [helpfulCount, setHelpfulCount] = React.useState(review.helpful || 0);
  
  const formattedDate = new Date(review.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const handleHelpful = () => {
    if (!isHelpful) {
      setHelpfulCount(helpfulCount + 1);
      setIsHelpful(true);
    } else {
      setHelpfulCount(helpfulCount - 1);
      setIsHelpful(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {review.userName.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{review.userName}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              size={14}
              color={star <= review.rating ? colors.primary : colors.border}
              fill={star <= review.rating ? colors.primary : 'none'}
            />
          ))}
        </View>
      </View>
      
      {review.title && (
        <Text style={styles.title}>{review.title}</Text>
      )}
      
      <Text style={styles.comment}>{review.comment}</Text>
      
      {review.images.length > 0 && (
        <View style={styles.imagesContainer}>
          {review.images.map((image, index) => (
            <Image 
              key={index}
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
          onPress={handleHelpful}
        >
          <ThumbsUp 
            size={16} 
            color={isHelpful ? '#fff' : colors.textSecondary}
          />
          <Text 
            style={[
              styles.helpfulText,
              isHelpful && styles.helpfulTextActive
            ]}
          >
            Helpful ({helpfulCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpfulButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  helpfulText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  helpfulTextActive: {
    color: '#fff',
  },
});