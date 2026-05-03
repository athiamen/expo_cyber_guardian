import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { SettingsModal } from "./features/settings/screens/SettingsModal";

export default function ModalScreen() {
  return (
    <>
      <SettingsModal />
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}

const styles = StyleSheet.create({});
