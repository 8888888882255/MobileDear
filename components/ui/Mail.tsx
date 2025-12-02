import React from 'react';
import { Mail as MailIcon } from 'lucide-react-native';
import colors from '@/constants/colors';

export const Mail = ({ size = 20, color = colors.textLight }) => {
  return <MailIcon size={size} color={color} />;
};