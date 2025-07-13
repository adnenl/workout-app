import { Models } from "react-native-appwrite";
import { Set } from "./set";

export interface WorkoutExercise extends Models.Document {
    workoutId: string;
    exerciseId: string;
    sets: Set[];
}