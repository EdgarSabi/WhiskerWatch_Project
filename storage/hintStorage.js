// onthoudt welke hint-bannertjes al zijn weggeklikt, zodat ze maar één keer verschijnen

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "hintDismissed:";

export async function isHintDismissed(hintId) {
  const value = await AsyncStorage.getItem(KEY_PREFIX + hintId);
  return value === "true";
}

export async function dismissHint(hintId) {
  await AsyncStorage.setItem(KEY_PREFIX + hintId, "true");
}
