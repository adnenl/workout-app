import { getAllWorkouts } from "@/actions/workoutActions";
import Search from "@/components/Search";
import seed from "@/lib/seed";
import { Workout } from "@/types/workout"; // Changed import
import { WorkoutExercise } from "@/types/workoutExercise";
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from "react";
import { ActivityIndicator, Button, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  // State now holds the rich, populated workout objects
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWorkouts = async () => {
    try {
      const fetchedWorkouts = await getAllWorkouts();
      setWorkouts(fetchedWorkouts);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
      setError("Could not load workouts. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchWorkouts();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchWorkouts();
  }, []);

  const handleCreatePress = () => {
    router.push('/workouts/create');
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-3 rounded-lg border border-gray-200 shadow-sm"
      onPress={() => router.push(`/workouts/${item.$id}`)}
      key={item.$id}
    >
      <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
      <Text className="text-sm text-gray-500 mt-1">
        {new Date(item.date).toLocaleDateString()}
      </Text>
      
      {item.workoutExercises && item.workoutExercises.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-sm font-semibold text-gray-600 mb-2">Exercises:</Text>
          {item.workoutExercises.map((workoutExercise: WorkoutExercise) => (
            <View key={workoutExercise.$id} className="ml-1 mb-2 flex-row items-center">
              <Text className="text-gray-400 mr-1.5">•</Text>
              <Text className="text-sm text-gray-700 font-medium">
                {workoutExercise.exercise.name}
              </Text>
              <Text className="text-xs text-gray-500 ml-auto">
                {workoutExercise.sets.length} {workoutExercise.sets.length === 1 ? 'set' : 'sets'}
              </Text>
            </View>
          ))}
        </View>
      )}

    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-5 flex-1">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold text-gray-900">My Workouts</Text>
          <Button title="Seed DB" onPress={seed} />
        </View>
        
        <Search />

        <TouchableOpacity
          className="bg-blue-500 py-3 px-4 rounded-lg my-4 items-center shadow"
          onPress={handleCreatePress}
        >
          <Text className="text-white font-bold text-base">New Workout</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
        ) : error ? (
          <Text className="text-red-500 text-center mt-10">{error}</Text>
        ) : (
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.$id}
            ListEmptyComponent={() => (
              <View className="mt-10 items-center">
                <Text className="text-gray-500">No workouts found.</Text>
                <Text className="text-gray-400">Press &quot;New Workout&quot; to get started!</Text>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#3b82f6"]} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
