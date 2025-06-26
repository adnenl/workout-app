import { Models } from "react-native-appwrite";

export interface WorkoutExercise extends Models.Document {
    workoutId: string;
    exerciseId: string;
}