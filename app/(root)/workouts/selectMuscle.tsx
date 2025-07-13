import { muscleGroups } from '@/lib/seed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const chunkArray = <T,>(array: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );

const SelectMuscleGroup = () => {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const rows = chunkArray(muscleGroups, 2);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Add New Exercise</Text>
      <Text className="text-gray-700 mb-2">Select Muscle Group:</Text>

      <View className="flex-1 justify-center">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row mb-2">
            {row.map((muscle) => (
              <TouchableOpacity
                key={muscle}
                className="flex-1 bg-blue-500 rounded-lg p-10 m-1 items-center"
                onPress={() => router.push({ pathname: '/workouts/selectExercise', params: { muscle, workoutId: workoutId } })}
              >
                <Text className="text-lg text-white">{muscle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="bg-gray-300 py-3 rounded-lg items-center mt-4"
        onPress={() => router.back()}
      >
        <Text className="text-gray-800 font-semibold text-base">Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SelectMuscleGroup;