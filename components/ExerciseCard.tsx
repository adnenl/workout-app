import { Set } from '@/types/set';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ExerciseCardProps {
  workoutExerciseId: string;
  name: string;
  sets: Set[];
  onSetChange?: (index: number, field: 'reps' | 'weight', value: string) => void;
  onSetDelete?: (setId: string) => void;
  onSetAdd?: (workoutExerciseId: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  workoutExerciseId, 
  name, 
  sets, 
  onSetChange, 
  onSetDelete, 
  onSetAdd 
}) => (
  <View className="bg-white rounded-lg shadow p-4 mb-3">
    <Text className="text-lg font-semibold text-gray-900 mb-3">{name}</Text>
    <View className="mt-1">
      {sets.map((set, index) => (
        <View key={index} className="flex-row items-center mb-4">
          <Text className="text-gray-600 mr-3 w-16 text-base">Set {index + 1}:</Text>
          {/* Weight Input */}
          <View className="flex-row items-center mr-4">
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-base text-gray-800"
              keyboardType="numeric"
              value={set.weight?.toString() ?? ''}
              placeholder="Weight"
              placeholderTextColor="#9CA3AF"
              style={{ textAlignVertical: 'center' }}
              onChangeText={value => onSetChange && onSetChange(index, 'weight', value)}
            />
            <Text className="text-gray-600 ml-2 text-base">kg</Text>
          </View>

          {/* Reps Input */}
          <View className="flex-row items-center mr-4">
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-base text-gray-800"
              keyboardType="numeric"
              value={set.reps?.toString() ?? ''}
              placeholder="Reps"
              placeholderTextColor="#9CA3AF" 
              style={{ textAlignVertical: 'center' }}
              onChangeText={value => onSetChange && onSetChange(index, 'reps', value)}
            />
            <Text className="text-gray-600 ml-2 text-base">reps</Text>
          </View>
          
          
          {/* Delete Button */}
          <TouchableOpacity 
            onPress={() => onSetDelete && onSetDelete(set.$id)}
            className="bg-red-100 px-3 py-2 rounded-lg"
          >
            <Text className="text-red-600 font-medium">Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {/* Add Set Button */}
      <TouchableOpacity
        className="mt-3 bg-blue-500 rounded-lg px-4 py-3 self-start"
        onPress={() => {
          onSetAdd && onSetAdd(workoutExerciseId);
        }}
      >
        <Text className="text-white font-semibold text-base">+ Add Set</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ExerciseCard;