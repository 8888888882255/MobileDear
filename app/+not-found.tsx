import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Lỗi!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Trang này không tồn tại.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Quay về trang chủ</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: "#007aff",
    fontWeight: "500",
  },
});
