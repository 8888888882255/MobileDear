import { Stack } from "expo-router";
import { ErrorScreen } from "@/components/ErrorScreen";
import { SearchX } from "lucide-react-native";
import colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Không tìm thấy!" }} />
      <ErrorScreen
        title="Trang không tồn tại"
        message="Rất tiếc, đường dẫn bạn truy cập không chính xác hoặc trang đã bị xóa."
        icon={<SearchX size={64} color={colors.textLight || '#6b7280'} />}
        showHomeButton={true}
        actionButtonText="Quay về trang chủ"
      />
    </>
  );
}
