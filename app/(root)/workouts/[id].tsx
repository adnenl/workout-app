import { getWorkoutById } from '@/actions/workoutActions';
import { Workout } from '@/types/workout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

const WorkoutDetails = () => {
  const router = useRouter(); // Hook for navigation
  const { id } = useLocalSearchParams<{ id: string }>();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Workout ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchWorkoutDetails = async () => {
      try {
        const fetchedWorkout = await getWorkoutById(id);
        setWorkout(fetchedWorkout);
      } catch (err) {
        console.error(err);
        setError("Failed to load workout. It may not exist.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [id]);

  // Render a loading indicator while fetching data
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  // Render an error message if fetching failed
  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 p-5">
        <Text className="text-red-500 text-lg text-center">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-500 py-2 px-4 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render the workout details once data is available
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-5">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 self-start"
        >
          <Text className="text-blue-500 text-lg font-semibold">
            &larr; Back to Workouts
          </Text>
        </TouchableOpacity>

        {workout ? (
          <>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {workout.name}
            </Text>
            <Text className="text-lg text-gray-600">
              {new Date(workout.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {/* You can add more details here, like the list of exercises */}
          </>
        ) : (
          <Text className="text-gray-500 text-lg">No workout details found.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

export default WorkoutDetails;