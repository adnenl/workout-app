import { Models } from "react-native-appwrite";

export interface Set extends Models.Document {
  reps?: number;
  weight?: number;
  order?: number; // 1, 2, 3, ...
}