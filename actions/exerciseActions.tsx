import { databases } from "@/lib/appwrite";
import { Exercise } from "@/types/exercise";
import { Query } from "react-native-appwrite";

export async function getExercisesByMuscle(muscleGroup: string): Promise<Exercise[]> {
    try {
        const response = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_EXERCISES_COLLECTION_ID!,
            [Query.equal("muscleGroup", muscleGroup)]
        );
        return response.documents as unknown as Exercise[];
    } catch (error) {
        console.error("Failed to fetch exercises by muscle:", error);
        throw new Error("Could not retrieve exercises.");
    }
}