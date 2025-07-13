import { databases } from "@/lib/appwrite";
import { Workout } from "@/types/workout";
import { ID } from "react-native-appwrite";

interface WorkoutFormData {
  name: string;
  date: Date;
}

/**
 * Creates a new, empty workout document. Exercises are added separately.
 * @param formData - The workout data including name and date.
 * @returns The newly created workout document.
 * @throws Will throw an error if the database operation fails.
 */
export async function createWorkout(formData: WorkoutFormData): Promise<Workout> {
  try {
    // The new Workout document no longer contains an 'exercises' array.
    const documentData: Omit<Workout, "$id" | keyof import('react-native-appwrite').Models.Document> = {
        name: formData.name,
        date: formData.date.toISOString(),
    };

    const newDocument = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!,
      ID.unique(),
      documentData
    );
    return newDocument as unknown as Workout;

  } catch (error) {
    console.error("Failed to create workout:", error);
    throw new Error("Could not create the workout in the database.");
  }
}

/**
 * Fetches a single workout document from the database by its ID.
 * @param id - The ID of the workout to fetch.
 * @returns The workout document, typed as Workout.
 * @throws Will throw an error if the document is not found or the fetch fails.
 */
export async function getWorkoutById(id: string): Promise<Workout> {
    try {
        const workout = await databases.getDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!,
            id
        );
        return workout as unknown as Workout;
    } catch (error) {
        console.error(`Failed to fetch workout with id ${id}:`, error);
        throw new Error("Could not retrieve the workout.");
    }
}

export async function getAllWorkouts(): Promise<Workout[]> {
    try {
        const response = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!
        );
        return response.documents as unknown as Workout[];
    } catch (error) {
        console.error("Failed to fetch all workouts:", error);
        throw new Error("Could not retrieve workouts.");
    }
}

export async function addWorkoutToExercise(workout: string, exercise: string): Promise<void> {
    try {
        await databases.createDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTEXERCISES_COLLECTION_ID!,
            ID.unique(),
            {
                workout,
                exercise,
            }
        );
    } catch (error) {
        console.error(`Failed to add exercise ${exercise} to workout ${workout}:`, error);
        throw new Error("Could not add exercise to the workout.");
    }
}