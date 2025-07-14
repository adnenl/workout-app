import { getExercisesByMuscle } from '@/actions/exerciseActions';
import { addExerciseToWorkout } from '@/actions/workoutActions';
import { Exercise } from '@/types/exercise';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SelectExercise = () => {
  const { muscle, workoutId } = useLocalSearchParams<{ muscle: string, workoutId: string }>();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const handleAddExerciseToWorkout = (exerciseId: string) => {
    if (!workoutId) {
      console.error("Workout ID is missing.");
      return;
    }
    addExerciseToWorkout(workoutId, exerciseId);
  };

  useEffect(() => {
    if (muscle) {
      (async () => {
        try {
          const data = await getExercisesByMuscle(muscle);
          setExercises(data);
        } catch (error) {
          console.error("Failed to fetch exercises:", error);
        }
      })();
    }
  }, [muscle]);

  return (
    <SafeAreaView className="flex-1 p-4">
      <TouchableOpacity
        className="mb-4"
        onPress={() => router.back()}
      >
        <Text className="text-blue-500 font-bold text-base">{'< Back'}</Text>
      </TouchableOpacity>
      <Text className="text-lg font-bold mb-4">Exercises for: {muscle}</Text>
      {/* Clickable exercise list */}
      {exercises.map((exercise) => (
        <TouchableOpacity
          key={exercise.$id}
          className="bg-gray-100 rounded-lg p-4 mb-2"
          onPress={() => {
            handleAddExerciseToWorkout(exercise.$id);
            router.push(`/workouts/${workoutId}`);
          }}
        >
          <Text className="text-base text-gray-800">{exercise.name}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

export default SelectExercise;