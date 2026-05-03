import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { getApiBaseUrl, getProfileMe, updateProfileMe } from "../../../lib/api";
import {
    moderateScale,
    normalizeFont,
    scale,
    verticalScale,
} from "../../../lib/responsive";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

type EditProfileScreenProps = {
  token: string;
};

export function EditProfileScreen({ token }: EditProfileScreenProps) {
  const { t } = useTranslation();
  const tEdit = (key: string) => t(`editProfile.${key}`);
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setStatusMessage(null);

      try {
        const me = await getProfileMe(token);
        if (!isMounted) {
          return;
        }

        setFullName(me.fullName);
        setEmail(me.email);
        setRole(me.role);
        setOrganization(me.organization ?? "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : tEdit("loadError");
        setStatusMessage(`${message} (API: ${getApiBaseUrl()})`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const canSave = useMemo(() => {
    return (
      fullName.trim().length >= 3 &&
      email.includes("@") &&
      role.trim().length >= 2
    );
  }, [email, fullName, role]);

  const handleSave = async () => {
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      await updateProfileMe(
        {
          fullName: fullName.trim(),
          role: role.trim(),
          organization: organization.trim() || undefined,
        },
        token,
      );

      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : tEdit("saveError");
      setStatusMessage(`${message} (API: ${getApiBaseUrl()})`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>{tEdit("loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{tEdit("heroEyebrow")}</Text>
        <Text style={[typography.screenTitle, styles.title]}>
          {tEdit("heroTitle")}
        </Text>
        <Text style={[typography.body, styles.body]}>{tEdit("heroBody")}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>{tEdit("fullName")}</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder={tEdit("fullNamePlaceholder")}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>{tEdit("emailReadonly")}</Text>
        <TextInput
          style={[styles.input, styles.readonlyInput]}
          value={email}
          editable={false}
          placeholder={tEdit("emailPlaceholder")}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>{tEdit("role")}</Text>
        <TextInput
          style={styles.input}
          value={role}
          onChangeText={setRole}
          placeholder={tEdit("rolePlaceholder")}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>{tEdit("organization")}</Text>
        <TextInput
          style={styles.input}
          value={organization}
          onChangeText={setOrganization}
          placeholder={tEdit("organizationPlaceholder")}
          placeholderTextColor={colors.textMuted}
        />

        <Pressable
          style={[
            styles.saveButton,
            (!canSave || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!canSave || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.saveButtonText}>{tEdit("save")}</Text>
          )}
        </Pressable>

        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(36),
    gap: moderateScale(14),
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(10),
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: normalizeFont(13),
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(18),
  },
  title: {
    marginTop: moderateScale(8),
  },
  body: {
    marginTop: moderateScale(10),
  },
  formCard: {
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(14),
    gap: moderateScale(10),
  },
  label: {
    color: colors.text,
    fontSize: normalizeFont(13),
    fontWeight: "700",
    letterSpacing: moderateScale(0.3),
  },
  input: {
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(11),
    fontSize: normalizeFont(15),
  },
  readonlyInput: {
    opacity: 0.65,
  },
  saveButton: {
    marginTop: moderateScale(6),
    borderRadius: scale(12),
    backgroundColor: colors.accent,
    paddingVertical: moderateScale(12),
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: normalizeFont(14),
    fontWeight: "800",
    letterSpacing: moderateScale(0.2),
  },
  statusText: {
    color: "#ffb9b9",
    fontSize: normalizeFont(12),
    lineHeight: verticalScale(18),
  },
});
