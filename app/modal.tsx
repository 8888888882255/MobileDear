import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông báo</Text>
      <View style={styles.separator} />
      <Text>Đây là một modal ví dụ. Bạn có thể chỉnh sửa nó trong file `app/modal.tsx`.</Text>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  separator: {
    marginVertical: 24,
    height: 1,
    width: "80%",
    backgroundColor: "#ccc",
  },
});
