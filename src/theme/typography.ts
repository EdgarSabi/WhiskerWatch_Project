import { TextStyle } from "react-native";
import { colors } from "./colors";
export const typography: Record<
  "title" | "heading" | "text" | "muted" | "label",
  TextStyle
> = {
  title: { fontSize: 30, lineHeight: 36, fontWeight: "700", color: colors.ink },
  heading: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "700",
    color: colors.ink,
  },
  text: { fontSize: 16, lineHeight: 24, color: colors.ink },
  muted: { fontSize: 14, lineHeight: 21, color: colors.muted },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: 8,
  },
};
