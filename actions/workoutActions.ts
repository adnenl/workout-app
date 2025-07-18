import { config, databases } from "@/lib/appwrite";
import { Set } from "@/types/set";
import { Workout } from "@/types/workout";
import { WorkoutExercise } from "@/types/workoutExercise";
import { ID, Query } from "react-native-appwrite";

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
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!,
            [
                Query.orderDesc('date')
            ]
        );
        return response.documents as unknown as Workout[];
    } catch (error) {
        console.error("Failed to fetch all workouts:", error);
        throw new Error("Could not retrieve workouts.");
    }
}

export async function addExerciseToWorkout(workout: string, exercise: string): Promise<void> {
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

export async function updateWorkoutExercise(
    workoutExerciseId: string,
    sets: Set[]
): Promise<void> {
    try {
        await databases.updateDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTEXERCISES_COLLECTION_ID!,
            workoutExerciseId,
            { sets }
        );
    } catch (error) {
        console.error(`Failed to update workout exercise ${workoutExerciseId}:`, error);
        throw new Error("Could not update the workout exercise.");
    }
}

export async function deleteSet(setId: string): Promise<void> {
    try {
        await databases.deleteDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_SETS_COLLECTION_ID!,
            setId
        );
    } catch (error) {
        console.error(`Failed to delete set ${setId}:`, error);
        throw new Error("Could not delete the set.");
    }
}

export async function addSet(
  workoutExercise: string,
  reps: number | undefined = undefined,
  weight: number | undefined = undefined,
  order: number | undefined = undefined
): Promise<Set> {
  try {
    console.log('addSet called', workoutExercise, reps, weight, order);
    const newSet = {
      workoutExercise,
      reps,
      weight,
      order,
    };
    const created = await databases.createDocument(
      config.databaseId!,
      config.setsCollectionId!,
      ID.unique(),
      newSet
    );
    console.log(`Set created with ID: ${created.$id}`);
    return created as Set;
  } catch (error) {
    console.error('addSet error:', error);
    throw new Error("Could not add the set.");
  }
}

export async function deleteWorkout(id: string): Promise<void> {
    try {
        await databases.deleteDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!,
            id
        );
    } catch (error) {
        console.error(`Failed to delete workout with id ${id}:`, error);
        throw new Error("Could not delete the workout.");
    }
}

export async function getSetsForWorkoutExercise(workoutExerciseId: string): Promise<Set[]> {
    try {
        const response = await databases.listDocuments(
            config.databaseId!,
            config.setsCollectionId!,
            [Query.equal('workoutExercise', workoutExerciseId)]
        );
        return response.documents as unknown as Set[];
    } catch (error) {
        console.error(`Failed to fetch sets for workout exercise ${workoutExerciseId}:`, error);
        throw new Error("Could not retrieve sets.");
    }
}

export async function getLastWorkoutExercise(exerciseId: string): Promise<WorkoutExercise | null> {
    try {
        const response = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTEXERCISES_COLLECTION_ID!,
            [
                Query.equal('exercise', exerciseId),
                Query.orderDesc('$createdAt'),
                Query.limit(1)
            ]
        );

        if (response.documents.length > 0) {
            const lastWorkoutExercise = response.documents[0] as unknown as WorkoutExercise;
            
            // Fetch associated sets
            const sets = await getSetsForWorkoutExercise(lastWorkoutExercise.$id);
            lastWorkoutExercise.sets = sets; // Attach sets to the workoutExercise

            return lastWorkoutExercise;
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch last workout exercise for exercise ${exerciseId}:`, error);
        return null;
    }
}
        
export async function getAllWorkoutExercisesWithSets(workoutId: string): Promise<WorkoutExercise[]> {
    try {
        const response = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTEXERCISES_COLLECTION_ID!,
            [Query.equal('workout', workoutId)]
        );
        const workoutExercises = response.documents as unknown as WorkoutExercise[];

        // Fetch sets for each workout exercise
        for (const we of workoutExercises) {
            we.sets = await getSetsForWorkoutExercise(we.$id);
        }

        return workoutExercises;
    } catch (error) {
        console.error(`Failed to fetch all workout exercises for workout ${workoutId}:`, error);
        throw new Error("Could not retrieve workout exercises.");
    }
}