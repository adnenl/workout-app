import { Models } from "react-native-appwrite";

export interface Exercise extends Models.Document {
    name: string;
    muscleGroup: string;
}