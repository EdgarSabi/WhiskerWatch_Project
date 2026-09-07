import { NativeStackScreenProps } from "@react-navigation/native-stack";
export type RootStackParamList = {
  Home: undefined;
  AddCat: { catId?: string } | undefined;
  CatDetail: { catId: string };
  AddObservation: { catId?: string } | undefined;
  Timeline: undefined;
  VetSummary: { catId?: string } | undefined;
};
export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
