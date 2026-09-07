import React from "react";
import { Image, View } from "react-native";
import { theme } from "../theme";
import { PixelArt } from "./PixelArt";
const cat = [
  "..##......##..",
  "..#o#....#o#..",
  "..#oo####oo#..",
  "..#oooooooo#..",
  ".#oooooooooo#.",
  ".#oo#oooo#oo#.",
  ".#oo#oooo#oo#.",
  ".#ooooPPoooo#.",
  "..#ooo##ooo#..",
  "...##oooo##...",
  "..#oooooooo#..",
  "..#oooooooo#..",
  "..#oo#oo#oo#..",
  "...##....##...",
];
const coats = ["#C98B56", "#929A89", "#B28C7B", "#D2B47C", "#9F969E"];
export function CatAvatar({
  name,
  photoUri,
  size = 64,
}: {
  name: string;
  photoUri?: string;
  size?: number;
}) {
  const coat =
    coats[
      [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % coats.length
    ];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.avatar,
        backgroundColor: theme.colors.soft,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {photoUri ? (
        <Image
          accessibilityLabel={`Foto van ${name}`}
          source={{ uri: photoUri }}
          style={{ width: size, height: size }}
        />
      ) : (
        <PixelArt
          rows={cat}
          palette={{ "#": theme.colors.ink, o: coat, P: "#C8786A" }}
          size={Math.max(1, Math.floor(size / 18))}
        />
      )}
    </View>
  );
}
