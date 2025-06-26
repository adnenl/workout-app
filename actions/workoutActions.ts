import { databases } from "@/lib/appwrite";
import { Exercise } from "@/types/exercise";
import { PopulatedWorkout, Workout } from "@/types/workout";
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

/**
 * Fetches all workouts and populates them with their respective exercises
 * and performance data using the WorkoutExercises collection.
 * @returns An array of fully populated workout objects.
 */
export async function getAllWorkouts(): Promise<PopulatedWorkout[]> {
    try {
        // 1. Fetch all base workout documents
        const allWorkouts: Workout[] = [];
        let offset = 0;
        const limit = 100;

        while (true) {
            const response = await databases.listDocuments(
                process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.EXPO_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!,
                [Query.limit(limit), Query.offset(offset), Query.orderDesc('date')]
            );
            if (response.documents.length === 0) break;
            allWorkouts.push(...(response.documents as unknown as Workout[]));
            offset += limit;
        }

        if (allWorkouts.length === 0) return [];

        // 2. Fetch all related WorkoutExercise documents
        const workoutIds = allWorkouts.map(w => w.$id);
        const weResponse = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WORKOUTEXERCISES_COLLECTION_ID!,
            [Query.equal('workoutId', workoutIds), Query.limit(5000)]
        );
        const allWorkoutExercises = weResponse.documents as unknown as WorkoutExercise[];

        if (allWorkoutExercises.length === 0) {
            return allWorkouts.map(w => ({ ...w, exercises: [] }));
        }

        // 3. Fetch all unique Exercise documents
        const uniqueExerciseIds = [...new Set(allWorkoutExercises.map(we => we.exerciseId))];
        const exResponse = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_EXERCISES_COLLECTION_ID!,
            [Query.equal('$id', uniqueExerciseIds), Query.limit(5000)]
        );
        const allExercises = exResponse.documents as unknown as Exercise[];

        // 4. Stitch everything together efficiently using Maps
        const exercisesMap = new Map<string, Exercise>(allExercises.map(ex => [ex.$id, ex]));
        
        const workoutExercisesByWorkoutId = new Map<string, WorkoutExercise[]>();
        allWorkoutExercises.forEach(we => {
            if (!workoutExercisesByWorkoutId.has(we.workoutId)) {
                workoutExercisesByWorkoutId.set(we.workoutId, []);
            }
            workoutExercisesByWorkoutId.get(we.workoutId)!.push(we);
        });

        // 5. Build the final PopulatedWorkout array
        const populatedWorkouts: PopulatedWorkout[] = allWorkouts.map(workout => {
            const relatedWorkoutExercises = workoutExercisesByWorkoutId.get(workout.$id) || [];
            relatedWorkoutExercises.sort((a, b) => a.order - b.order);

            const populatedExercises = relatedWorkoutExercises.map(we => ({
                ...we,
                exercise: exercisesMap.get(we.exerciseId)!
            })).filter(pe => pe.exercise);

            return {
                ...workout,
                exercises: populatedExercises
            };
        });

        return populatedWorkouts;

    } catch (error) {
        console.error("Failed to fetch all populated workouts:", error);
        throw new Error("Could not retrieve workouts and their exercises.");
    }
}