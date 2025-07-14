import * as Linking from 'expo-linking';
import { openAuthSessionAsync } from "expo-web-browser";
import { Account, Avatars, Client, Databases, OAuthProvider } from 'react-native-appwrite';

export const config = {
    platform: 'com.adnenl.workoutapp',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    exercisesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_EXERCISES_COLLECTION_ID,
    workoutsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID,
    workoutExercisesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WORKOUTEXERCISES_COLLECTION_ID,
    setsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SETS_COLLECTION_ID, // Add this!
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

export async function login(){
    try {
        const redirectUri = Linking.createURL('/');

        const response = await account.createOAuth2Token(OAuthProvider.Google, redirectUri);

        if (!response) throw new Error('Login failed');

        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri
        )

        if (browserResult.type !== 'success') throw new Error('Authentication failed');
        
        const url = new URL(browserResult.url);

        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if (!secret || !userId) throw new Error('Failed to login');

        const session = await account.createSession(userId, secret);

        if (!session) throw new Error('Session creation failed');

        return true;

    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
}

export async function logout() {
    try {
        await account.deleteSession('current');
        return true;
    } catch (error) {
        console.error('Logout failed:', error);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const response = await account.get();

        if (response.$id) {
            const userAvatar = avatar.getInitials(response.name);

            return { ...response, 
                avatar: userAvatar.toString(),
            };
        }
        
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}

