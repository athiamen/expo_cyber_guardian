import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { moderateScale, normalizeFont } from "./lib/responsive";

import { Text, View } from "@/components/Themed";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
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
    padding: moderateScale(20),
  },
  title: {
    fontSize: normalizeFont(20),
    fontWeight: "bold",
  },
  link: {
    marginTop: moderateScale(15),
    paddingVertical: moderateScale(15),
  },
  linkText: {
    fontSize: normalizeFont(14),
    color: "#2e78b7",
  },
});
