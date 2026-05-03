import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AuthScreen } from "../features/auth/screens/AuthScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { AuthSession } from "../lib/api";
import { moderateScale, normalizeFont, scale } from "../lib/responsive";
import { clearSession, loadSession, saveSession } from "../lib/sessionStorage";
import { colors } from "../theme/colors";

export default function TabProfileScreen() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loadSession()
      .then((storedSession) => {
        if (!isMounted) {
          return;
        }

        setSession(storedSession);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthenticated = async (nextSession: AuthSession) => {
    setSession(nextSession);
    await saveSession(nextSession);
  };

  const handleLogout = async () => {
    await clearSession();
    setSession(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <View style={styles.container}>
      <ProfileScreen
        token={session.token}
        userId={session.user.id}
        onLogout={handleLogout}
      />
      <View style={styles.footer}>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Se deconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  footer: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(16),
    backgroundColor: colors.background,
  },
  logoutButton: {
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: "#7a2a2a",
    backgroundColor: "#3f1d1d",
    paddingVertical: moderateScale(12),
    alignItems: "center",
  },
  logoutText: {
    color: "#ffb9b9",
    fontSize: normalizeFont(14),
    fontWeight: "800",
  },
});
