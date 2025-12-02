import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
        <Text style={styles.paragraph}>
          Chúng tôi tại Crocus cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng ứng dụng của chúng tôi.
        </Text>

        <Text style={styles.sectionTitle}>2. Thông tin chúng tôi thu thập</Text>
        <Text style={styles.paragraph}>
          Chúng tôi có thể thu thập các loại thông tin sau:
          - Thông tin cá nhân: như tên, địa chỉ email, số điện thoại.
          - Thông tin sử dụng: như dữ liệu về cách bạn sử dụng ứng dụng.
          - Thông tin thiết bị: như loại thiết bị, hệ điều hành, địa chỉ IP.
        </Text>

        <Text style={styles.sectionTitle}>3. Cách chúng tôi sử dụng thông tin</Text>
        <Text style={styles.paragraph}>
          Chúng tôi sử dụng thông tin của bạn để:
          - Cung cấp và cải thiện dịch vụ của chúng tôi.
          - Gửi thông báo và cập nhật.
          - Phân tích và nghiên cứu để nâng cao trải nghiệm người dùng.
        </Text>

        <Text style={styles.sectionTitle}>4. Chia sẻ thông tin</Text>
        <Text style={styles.paragraph}>
          Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Chúng tôi có thể chia sẻ thông tin với:
          - Nhà cung cấp dịch vụ giúp chúng tôi vận hành ứng dụng.
          - Cơ quan pháp luật khi được yêu cầu theo luật.
        </Text>

        <Text style={styles.sectionTitle}>5. Bảo mật</Text>
        <Text style={styles.paragraph}>
          Chúng tôi áp dụng các biện pháp bảo mật hợp lý để bảo vệ thông tin của bạn. Tuy nhiên, không có phương pháp truyền tải qua Internet hoặc lưu trữ điện tử nào là an toàn 100%.
        </Text>

        <Text style={styles.sectionTitle}>6. Thay đổi chính sách</Text>
        <Text style={styles.paragraph}>
          Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên ứng dụng.
        </Text>

        <Text style={styles.sectionTitle}>7. Liên hệ</Text>
        <Text style={styles.paragraph}>
          Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email: support@crocus.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
});