import React from 'react';
import { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
  Platform,
} from 'react-native';
import colors from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  leftIcon,
  ...props
}) => {
  const getButtonStyles = (): ViewStyle[] => {
    const styles: ViewStyle[] = [buttonStyles.base];

    switch (variant) {
      case 'primary':
        styles.push(buttonStyles.primary);
        break;
      case 'secondary':
        styles.push(buttonStyles.secondary);
        break;
      case 'outline':
        styles.push(buttonStyles.outline);
        break;
      case 'ghost':
        styles.push(buttonStyles.ghost);
        break;
    }

    switch (size) {
      case 'small':
        styles.push(buttonStyles.small);
        break;
      case 'medium':
        styles.push(buttonStyles.medium);
        break;
      case 'large':
        styles.push(buttonStyles.large);
        break;
    }

    if (fullWidth) {
      styles.push(buttonStyles.fullWidth);
    }

    if (disabled || loading) {
      styles.push(buttonStyles.disabled);
    }
    
    return styles;
  };
  
  const getTextStyles = (): TextStyle[] => {
    const styles: TextStyle[] = [textStyles.base];

    switch (variant) {
      case 'primary':
        styles.push(textStyles.primary);
        break;
      case 'secondary':
        styles.push(textStyles.secondary);
        break;
      case 'outline':
        styles.push(textStyles.outline);
        break;
      case 'ghost':
        styles.push(textStyles.ghost);
        break;
    }

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

    if (disabled) {
      styles.push(textStyles.disabled);
    }
    
    return styles;
  };
  
  return (
    <TouchableOpacity
      style={[...getButtonStyles(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#fff' : colors.primary} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && (
            <View style={styles.iconContainer}>{leftIcon}</View>
          )}
          {icon && iconPosition === 'left' && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
          <Text style={[...getTextStyles(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});

const textStyles = StyleSheet.create({
  base: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primary: {
    color: '#fff',
  },
  secondary: {
    color: colors.text,
  },
  outline: {
    color: colors.primary,
  },
  ghost: {
    color: colors.primary,
  },
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
  disabled: {
    color: '#999',
  },
});

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginHorizontal: 6,
  },
});