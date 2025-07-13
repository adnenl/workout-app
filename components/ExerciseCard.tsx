import { Set } from '@/types/set';
import React from 'react';
import { Text, View } from 'react-native';

interface ExerciseCardProps {
  name: string;
  sets: Set[];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ name, sets }) => (
  <View className="bg-white rounded-lg shadow p-4 mb-3">
    <Text className="text-lg font-semibold text-gray-900">{name}</Text>
    <View className="mt-1">
      {sets.length > 0 ? (
        sets.map((set, index) => (
          <Text key={index} className="text-gray-600">
            Set {index + 1}: {set.reps} reps{set.weight ? ` ${set.weight}kg` : ''}
          </Text>
        ))
      ) : (
        <Text className="text-gray-500">No sets available</Text>
      )}
    </View>
  </View>
);

export default ExerciseCard;