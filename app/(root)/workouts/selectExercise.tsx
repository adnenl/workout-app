import { getExercisesByMuscle } from '@/actions/exerciseActions';
import { addExerciseToWorkout, getWorkoutById } from '@/actions/workoutActions';
import { Exercise } from '@/types/exercise';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SelectExercise = () => {
  const { muscle, workoutId } = useLocalSearchParams<{ muscle: string, workoutId: string }>();
  const router = useRouter();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleAddExerciseToWorkout = async (exerciseId: string) => {
    if (!workoutId) {
      console.error("Workout ID is missing.");
      return;
    }
    
    // Fetch the current workout details
  const currentWorkout = await getWorkoutById(workoutId);

  // Check if the exercise already exists in the workout
  const exerciseExists = currentWorkout.workoutExercises.some(
    (we) => we.exercise?.$id === exerciseId
  );

  if (exerciseExists) {
    alert("This exercise is already in the workout.");
    return;
  }
    await addExerciseToWorkout(workoutId, exerciseId);
    router.push(`/workouts/${workoutId}`);
  };

  useEffect(() => {
    if (muscle) {
      (async () => {
        setLoading(true);
        try {
          const data = await getExercisesByMuscle(muscle);
          setExercises(data);
        } catch (error) {
          console.error("Failed to fetch exercises:", error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [muscle]);

  return (
    <SafeAreaView className="flex-1 p-4 bg-gray-50">
      {/* Improved Back Button */}
      <TouchableOpacity
        className="mb-6 bg-white rounded-full py-2 px-4 shadow-md flex-row items-center"
        onPress={() => router.back()}
      >
        <Text className="text-blue-600 font-bold text-base">←</Text>
        <Text className="text-blue-600 font-bold text-base ml-1">Back</Text>
      </TouchableOpacity>
      
      <Text className="text-xl font-bold mb-6 text-gray-800">
        Exercises for <Text className="text-blue-600">{muscle}</Text>
      </Text>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : exercises.length > 0 ? (
        <View className="flex-1">
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.$id}
              className="bg-white rounded-xl p-5 mb-3 shadow-md border border-gray-100 active:bg-blue-50 flex-row justify-between items-center"
              onPress={() => {
                handleAddExerciseToWorkout(exercise.$id);
              }}
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">{exercise.name}</Text>
              </View>
              <View className="bg-blue-500 rounded-full h-7 w-7 justify-center items-center">
                <Text className="text-white font-bold text-lg">+</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No exercises found for this muscle group</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SelectExercise;