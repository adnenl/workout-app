import { ID } from "react-native-appwrite";
import { config, databases } from "./appwrite";

const COLLECTIONS = {
    EXERCISES: config.exercisesCollectionId,
    WORKOUTS: config.workoutsCollectionId,
    WORKOUT_EXERCISES: config.workoutExercisesCollectionId, // Add this!
};

export const muscleGroups = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Biceps",
  "Triceps",
];

const exercises = [
  { name: "Bench Press", muscleGroup: muscleGroups[0] },
  { name: "Squat", muscleGroup: muscleGroups[2] },
  { name: "Deadlift", muscleGroup: muscleGroups[1] },
  { name: "Pull Up", muscleGroup: muscleGroups[1] },
  { name: "Push Up", muscleGroup: muscleGroups[0] },
];

// Helper function to get a random subset of an array
function getRandomSubset<T>(array: T[], minItems: number, maxItems: number): T[] {
  const subsetSize = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
  const arrayCopy = [...array];
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[randomIndex]] = [arrayCopy[randomIndex], arrayCopy[i]];
  }
  return arrayCopy.slice(0, subsetSize);
}

async function seed() {
  try {
    // Clear existing data from all collections, starting with dependent collections
    console.log("Clearing existing data...");
    const collectionsToClear = [
      COLLECTIONS.WORKOUT_EXERCISES,
      COLLECTIONS.WORKOUTS,
      COLLECTIONS.EXERCISES,
    ];
    for (const collectionId of collectionsToClear) {
      if (!collectionId) continue; // Skip if collectionId is not configured
      const documents = await databases.listDocuments(config.databaseId!, collectionId);
      for (const doc of documents.documents) {
        await databases.deleteDocument(config.databaseId!, collectionId, doc.$id);
      }
    }
    console.log("Cleared all existing data.");

    // Seed Exercises
    const createdExercises = [];
    for (const exerciseData of exercises) {
      const exercise = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.EXERCISES!,
        ID.unique(),
        exerciseData
      );
      createdExercises.push(exercise);
    }
    console.log(`Seeded ${createdExercises.length} exercises.`);

    // Seed Workouts and WorkoutExercises
    const workoutNames = ["Workout 1", "Workout 2", "Workout 3", "Workout 4", "Workout 5"];
    let workoutDate = new Date();

    for (const name of workoutNames) {
      // Create the workout
      const workout = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.WORKOUTS!,
        ID.unique(),
        {
          name,
          date: workoutDate.toISOString(), // Store date as ISO string
        }
      );

      // Assign a random subset of 3 to 5 exercises to this workout
      const assignedExercises = getRandomSubset(createdExercises, 3, 5);

      // Create WorkoutExercise documents for each assigned exercise
      for (const exercise of assignedExercises) {
        await databases.createDocument(
          config.databaseId!,
          COLLECTIONS.WORKOUT_EXERCISES!,
          ID.unique(),
          {
            workout: workout.$id,
            exercise: exercise.$id,
            sets: [
              { reps: 10, weight: 50, order: 1 },
              { reps: 8, weight: 60, order: 2 },
              { reps: 6, weight: 70, order: 3 },
            ], // Example sets data
          }
        );
      }
      console.log(`Seeded workout: ${workout.name}`);
    }

    console.log("Data seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

export default seed;