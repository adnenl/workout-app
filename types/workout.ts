import { Models } from "react-native-appwrite";
import { WorkoutExercise } from "./workoutExercise";

// This represents the simple document stored in the 'Workouts' collection.
// Notice it has NO 'exercises' property.
export interface Workout extends Models.Document {
    name: string;
    date: string;
    workoutExercises: WorkoutExercise[];
}

