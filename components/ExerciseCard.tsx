import { Set } from '@/types/set';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ExerciseCardProps {
  workoutExerciseId: string;
  name: string;
  sets: Set[];
  onSetChange?: (index: number, field: 'reps' | 'weight', value: string) => void;
  onSetDelete?: (setId: string) => void;
  onSetAdd?: (workoutExerciseId: string) => void; // Optional prop for adding a new set
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({workoutExerciseId, name, sets, onSetChange, onSetDelete, onSetAdd }) => (
  <View className="bg-white rounded-lg shadow p-4 mb-3">
    <Text className="text-lg font-semibold text-gray-900">{name}</Text>
    <View className="mt-1">
      {sets.length > 0 ? (
        sets.map((set, index) => (
          <View key={index} className="flex-row items-center mb-2">
            <Text className="text-gray-600 mr-2">Set {index + 1}:</Text>
            <TextInput
              className="border border-gray-300 rounded px-2 py-1 w-16 mr-2 text-gray-800"
              keyboardType="numeric"
              value={set.reps?.toString() ?? ''}
              placeholder="Reps"
              onChangeText={value => onSetChange && onSetChange(index, 'reps', value)}
            />
            <Text className="text-gray-600 mr-1">reps</Text>
            <TextInput
              className="border border-gray-300 rounded px-2 py-1 w-20 mr-2 text-gray-800"
              keyboardType="numeric"
              value={set.weight?.toString() ?? ''}
              placeholder="Weight"
              onChangeText={value => onSetChange && onSetChange(index, 'weight', value)}
            />
            <Text className="text-gray-600">kg</Text>
            <TouchableOpacity onPress={() => onSetDelete && onSetDelete(set.$id)}>
              <Text className="text-red-500 ml-2">Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text className="text-gray-500">No sets available</Text>
      )}
      {/* Add Set Button */}
      <TouchableOpacity
        className="mt-2 bg-blue-500 rounded px-4 py-2 self-start"
        onPress={() => {
          onSetAdd && onSetAdd(workoutExerciseId);
          console.log('Add Set pressed');
        }}
      >
        <Text className="text-white font-semibold">+ Add Set</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ExerciseCard;