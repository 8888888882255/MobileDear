import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '@/constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const getBadgeStyles = (): ViewStyle[] => {
    const styles: ViewStyle[] = [badgeStyles.base];

    switch (variant) {
      case 'primary':
        styles.push(badgeStyles.primary);
        break;
      case 'secondary':
        styles.push(badgeStyles.secondary);
        break;
      case 'success':
        styles.push(badgeStyles.success);
        break;
      case 'error':
        styles.push(badgeStyles.error);
        break;
      case 'warning':
        styles.push(badgeStyles.warning);
        break;
      case 'info':
        styles.push(badgeStyles.info);
        break;
    }

    switch (size) {
      case 'small':
        styles.push(badgeStyles.small);
        break;
      case 'medium':
        styles.push(badgeStyles.medium);
        break;
      case 'large':
        styles.push(badgeStyles.large);
        break;
    }
    
    return styles;
  };
  
  const getTextStyles = (): TextStyle[] => {
    const styles: TextStyle[] = [textStyles.base];

    switch (size) {
      case 'small':
        styles.push(textStyles.small);
        break;
      case 'medium':
        styles.push(textStyles.medium);
        break;
      case 'large':
        styles.push(textStyles.large);
        break;
    }
    
    return styles;
  };
  
  return (
    <View style={[...getBadgeStyles(), style]}>
      <Text style={[...getTextStyles(), textStyle]}>{label}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  base: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  success: {
    backgroundColor: colors.success,
  },
  error: {
    backgroundColor: colors.error,
  },
  warning: {
    backgroundColor: colors.pending,
  },
  info: {
    backgroundColor: colors.processing,
  },
  small: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  medium: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  large: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});

const textStyles = StyleSheet.create({
  base: {
    color: '#fff',
    fontWeight: '600',
  },
  small: {
    fontSize: 10,
  },
  medium: {
    fontSize: 12,
  },
  large: {
    fontSize: 14,
  },
});