import React from "react";
import { View } from "react-native";
import { colors } from "../theme";
import { ObservationType } from "../types";

// Small shape grids render locally and stay crisp at integer pixel sizes.
export function PixelArt({
  rows,
  palette,
  size = 3,
}: {
  rows: readonly string[];
  palette: Record<string, string>;
  size?: number;
}) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: Math.max(...rows.map((row) => row.length)) * size,
        height: rows.length * size,
      }}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          palette[cell] ? (
            <View
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                left: x * size,
                top: y * size,
                width: size,
                height: size,
                backgroundColor: palette[cell],
              }}
            />
          ) : null,
        ),
      )}
    </View>
  );
}
const icons: Record<ObservationType | "heart" | "paw", string[]> = {
  heart: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
  paw: [
    ".#...#.",
    "###.###",
    ".#...#.",
    "...#...",
    "..###..",
    ".#####.",
    ".#####.",
  ],
  poop: ["...#...", "..###..", "..###..", ".#####.", ".#####.", "#######"],
  vomit: ["..#.#..", ".#.#...", ".......", "#######", ".#####.", "..###.."],
  food_drink: [
    "#.....#",
    "#######",
    ".#####.",
    "..###..",
    ".......",
    ".#####.",
  ],
  behavior: [".#...#.", "#######", "#######", ".#####.", "..###..", "...#..."],
  medication: [
    "..###..",
    "..###..",
    "#######",
    "#######",
    "..###..",
    "..###..",
  ],
  weight: [".#####.", "##...##", "#..#..#", "#.###.#", "#.....#", "#######"],
  photo_note: [
    ".##....",
    "#######",
    "#.....#",
    "#.###.#",
    "#.#.#.#",
    "#.###.#",
    "#######",
  ],
  other: [".......", ".......", "##.##.##", "##.##.##", "......."],
};
export function PixelIcon({
  name,
  color = colors.primary,
  size = 3,
}: {
  name: keyof typeof icons;
  color?: string;
  size?: number;
}) {
  return <PixelArt rows={icons[name]} palette={{ "#": color }} size={size} />;
}
