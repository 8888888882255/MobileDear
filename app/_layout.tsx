import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import colors from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

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

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
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
      <Stack.Screen
        name="category/[id]"
        options={{
          title: "Category",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          title: "Đơn hàng",
          headerBackTitle: "Cart",
        }}
      />
      <Stack.Screen
        name="orders/index"
        options={{
          title: "Danh sách đơn hàng",
          headerBackTitle: "Back",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="orders/[id]"
        options={{
          title: "Chi tiết đơn hàng",
          headerBackTitle: "Orders",
        }}
      />
      <Stack.Screen
        name="order-confirmation"
        options={{
          title: "Xác nhận đơn hàng",
        }}
      />
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
        name="contact"
        options={{
          title: "Liên hệ",
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
        name="addresses/index"
        options={{
          title: "My Addresses",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="addresses/new"
        options={{
          title: "Add New Address",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="addresses/edit/[id]"
        options={{
          title: "Edit Address",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="posts/index"
        options={{
          title: "Community Posts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="posts/create"
        options={{
          title: "Create Post",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="posts/user/[id]"
        options={{
          title: "User Posts",
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
      <Stack.Screen
        name="vouchers/index"
        options={{
          title: "Danh sách voucher",
        }}
      />
      <Stack.Screen
        name="vouchers/spin"
        options={{
          title: "Quay voucher",
        }}
      />
      <Stack.Screen
        name="vouchers/history"
        options={{
          title: "Lịch sử voucher",
          headerShown: false,
        }}
      />
    </Stack>
  );
}