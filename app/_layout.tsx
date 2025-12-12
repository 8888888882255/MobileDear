import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import colors from "@/constants/colors";
import { useUserStore } from "@/store/user-store";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.success || '#22c55e',
        marginTop: Platform.OS === 'web' ? 20 : 0,
        marginRight: Platform.OS === 'web' ? 20 : 0,
        alignSelf: Platform.OS === 'web' ? 'flex-end' : 'center',
        width: Platform.OS === 'web' ? 350 : '90%',
        backgroundColor: colors.card || '#fff',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: colors.text || '#000'
      }}
      text2Style={{
        fontSize: 14,
        color: colors.textLight || '#666'
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: colors.error || '#ef4444',
        marginTop: Platform.OS === 'web' ? 20 : 0,
        marginRight: Platform.OS === 'web' ? 20 : 0,
        alignSelf: Platform.OS === 'web' ? 'flex-end' : 'center',
        width: Platform.OS === 'web' ? 350 : '90%',
        backgroundColor: colors.card || '#fff',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: colors.text || '#000'
      }}
      text2Style={{
        fontSize: 14,
        color: colors.textLight || '#666'
      }}
    />
  )
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { checkAuthStatus } = useUserStore();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  
  // Check auth status on app start - only once
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      if (mounted) {
        console.log('RootLayout - Checking auth status on mount');
        await checkAuthStatus();
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
      <Toast config={toastConfig} />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.card,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[id]"
        options={{
          title: "Chi tiết sản phẩm",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="product/review/[id]"
        options={{
          title: "Đánh giá sản phẩm",
        }}
      />
      {/* <Stack.Screen
        name="category/[id]"
        options={{
          title: "Category",
          headerBackTitle: "Back",
        }}
      /> */}
      <Stack.Screen
        name="auth/login"
        options={{
          title: "Đăng nhập",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          title: "Đăng ký",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/forgot-password"
        options={{
          title: "Lây lại mật khẩu",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{
          title: "Edit Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/change-password"
        options={{
          title: "Đổi mật khẩu",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="newsletter"
        options={{
          title: "Newsletter",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{
          title: "Chính sách bảo mật",
          headerShown: false,
        }}
      />
      
      {/* Admin Route Config */}
      <Stack.Screen
          name="admin/users"
          options={{
            headerShown: false,
          }}
      />
      <Stack.Screen
          name="admin/user/create"
          options={{
              headerShown: false,
          }}
      />
      <Stack.Screen
          name="admin/user/[id]"
          options={{
              headerShown: false,
          }}
      />
    </Stack>
  );
}