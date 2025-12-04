import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function EditUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useUserStore();

  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+1 234 567 8900');
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=1');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser?.isAdmin) {
    router.replace('/');
    return null;
  }

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    const updatedUser = {
      id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      avatar: avatar.trim() || undefined,
      isAdmin,
      updatedAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Success',
        'User updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }, 500);
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Avatar',
      'Enter a new avatar URL',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Random Avatar',
          onPress: () => {
            const randomNum = Math.floor(Math.random() * 70) + 1;
            setAvatar(`https://i.pravatar.cc/150?img=${randomNum}`);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>

            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.avatarButton}
                  onPress={handleChangeAvatar}
                >
                  <Camera size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <Input
                label="Avatar URL"
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChangeText={setAvatar}
                containerStyle={styles.avatarUrlInput}
              />
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Email"
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone (Optional)"
              placeholder="+1 234 567 8900"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Permissions</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsAdmin(!isAdmin)}
            >
              <View style={styles.checkbox}>
                {isAdmin && <View style={styles.checkboxFill} />}
              </View>
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>Administrator</Text>
                <Text style={styles.checkboxDescription}>
                  Grant this user full administrative access
                </Text>
              </View>
            </TouchableOpacity>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title={isSaving ? 'Saving...' : 'Update User'}
              onPress={handleSave}
              disabled={isSaving}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  avatarUrlInput: {
    width: '100%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxFill: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
