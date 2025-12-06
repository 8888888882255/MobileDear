import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import colors from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  elevation = 2 
}) => {
  return (
    <View 
      style={[
        styles.card, 
        { 
          shadowOpacity: 0.1 + (elevation * 0.05),
          shadowRadius: elevation,
          elevation: elevation,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
});
