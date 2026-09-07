import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, radius, cardStyles } from "../theme";
import { CatAvatar } from "./CatAvatar";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { choiceLabel } from "../utils/locale";
export { colors } from "../theme/colors";
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 48,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  ...typography,
  card: cardStyles.cozy,
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: radius.small,
    padding: 14,
    fontSize: 16,
    color: colors.ink,
    minHeight: 50,
  },
});
export function Page({
  children,
  footer,
}: React.PropsWithChildren<{ footer?: React.ReactNode }>) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: footer ? 20 : 32 + insets.bottom },
        ]}
      >
        {children}
      </ScrollView>
      {footer && (
        <View
          style={{
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: 12 + insets.bottom,
          }}
        >
          <View style={{ width: "100%", maxWidth: 716, alignSelf: "center" }}>
            {footer}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: radius.control,
        backgroundColor: secondary ? colors.soft : colors.primary,
        alignItems: "center",
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        minHeight: 50,
      })}
    >
      <Text
        style={{
          color: secondary ? colors.ink : "white",
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  numeric = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  multiline?: boolean;
  numeric?: boolean;
  placeholder?: string;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={numeric ? "decimal-pad" : "default"}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          multiline && { minHeight: 100, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
export function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel = choiceLabel,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  getLabel?: (value: T) => string;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option }}
            onPress={() => onChange(option)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 12,
              minHeight: 48,
              borderRadius: radius.small,
              backgroundColor: value === option ? colors.primary : colors.soft,
            }}
          >
            <Text style={{ color: value === option ? "white" : colors.ink }}>
              {getLabel(option)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export function EmptyState({
  title,
  description,
  neutral = false,
}: {
  title: string;
  description: string;
  neutral?: boolean;
}) {
  return (
    <View
      style={[
        neutral ? cardStyles.neutral : styles.card,
        {
          backgroundColor: neutral ? colors.white : colors.soft,
          paddingVertical: 24,
        },
      ]}
    >
      {!neutral && <CatAvatar name="WhiskerWatch" size={64} />}
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.muted}>{description}</Text>
    </View>
  );
}

export function SectionCard({
  children,
  warm = false,
}: React.PropsWithChildren<{ warm?: boolean }>) {
  return (
    <View
      style={[
        styles.card,
        warm && {
          backgroundColor: colors.accentSoft,
          borderColor: colors.accentSoft,
        },
      ]}
    >
      {children}
    </View>
  );
}
