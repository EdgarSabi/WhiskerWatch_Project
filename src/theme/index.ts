import { ViewStyle } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";
export const radius = { small: 12, control: 16, card: 22, avatar: 18 };
export const cardStyles: Record<"cozy" | "neutral", ViewStyle> = {
  cozy: {
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
    gap: 12,
  },
  neutral: {
    padding: 20,
    borderRadius: radius.small,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
};
export const theme = { colors, spacing, typography, radius, cards: cardStyles };
export { colors, spacing, typography };
