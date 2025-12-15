import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle, Home, RotateCcw } from 'lucide-react-native';
import colors from '@/constants/colors';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionButtonText?: string;
  onAction?: () => void;
  showHomeButton?: boolean;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Đã xảy ra lỗi',
  message = 'Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.',
  icon,
  actionButtonText = 'Thử lại',
  onAction,
  showHomeButton = true,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {icon || <AlertCircle size={64} color={colors.error || '#ef4444'} />}
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.actions}>
          {onAction && (
            <TouchableOpacity style={styles.primaryButton} onPress={onAction}>
              <RotateCcw size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>{actionButtonText}</Text>
            </TouchableOpacity>
          )}

          {showHomeButton && (
            <TouchableOpacity 
              style={[styles.secondaryButton, !onAction && styles.primaryButton]} 
              onPress={() => router.replace('/')}
            >
              <Home size={20} color={!onAction ? "#fff" : colors.text} style={styles.buttonIcon} />
              <Text style={!onAction ? styles.primaryButtonText : styles.secondaryButtonText}>
                Về trang chủ
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 100,
    backgroundColor: '#fee2e2', // Light red bg
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text || '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textLight || '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    minWidth: 200,
  },
  primaryButton: {
    backgroundColor: colors.primary || '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border || '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.text || '#1f2937',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
