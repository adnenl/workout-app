import { Models } from "react-native-appwrite";
import { Exercise } from "./exercise";
import { WorkoutExercise } from "./workoutExercise";

// This represents the simple document stored in the 'Workouts' collection.
// Notice it has NO 'exercises' property.
export interface Workout extends Models.Document {
    name: string;
    date: string;
}

// This represents a WorkoutExercise document after its 'exercise' has been fetched.
export interface PopulatedWorkoutExercise extends WorkoutExercise {
    exercise: Exercise;
}

// This is the final, rich object your UI will use.
export interface PopulatedWorkout extends Workout {
    exercises: PopulatedWorkoutExercise[];
}