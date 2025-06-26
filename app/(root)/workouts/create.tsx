import { createWorkout } from '@/actions/workoutActions';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WorkoutFormProps {
  onSubmit?: (data: { name: string; date: Date }) => void;
}

const CreateWorkout = ({ onSubmit }: WorkoutFormProps) => {
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setDatePickerVisible(Platform.OS === 'ios'); // Keep visible on iOS until 'Done'
    if (selectedDate) {
      setDate(selectedDate);
    }
  }

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for the workout.');
      return;
    }

    setIsSubmitting(true);

    const formData = { name, date };
    
    try {
      const newWorkout = await createWorkout(formData);
      Alert.alert('Success', 'Workout created successfully!');
      
      // Redirect to the new workout's detail page
      router.replace(`/workouts/${newWorkout.$id}`);

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSubmitDisabled = !name.trim() || isSubmitting;


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-5">
        <Text className="text-3xl font-bold text-gray-900 mb-6">
          Create Workout
        </Text>

        {/* Name Input */}
        <View className="mb-5">
          <Text className="text-base font-medium text-gray-700 mb-2">
            Workout Name
          </Text>
          <TextInput
            className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg p-4"
            placeholder="e.g., Morning Run"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Workout name input"
            testID="workout-name-input"
          />
        </View>

        {/* Date Input */}
        <View className="mb-5">
          <Text className="text-base font-medium text-gray-700 mb-2">
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setDatePickerVisible(true)}
            className="bg-white border border-gray-300 rounded-lg p-4 justify-center"
            accessibilityLabel="Date input"
            testID="date-input-touchable"
          >
            <Text className="text-gray-900 text-base">
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        {isDatePickerVisible && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()} // Users can't select a future date
          />
        )}

        {/* On iOS, the picker is a modal, so we add a button to close it */}
        {isDatePickerVisible && Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={() => setDatePickerVisible(false)}
              className="items-center bg-gray-200 p-3 rounded-lg"
            >
              <Text className="font-semibold text-blue-500">Done</Text>
            </TouchableOpacity>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          className={`py-4 px-5 rounded-lg mt-4 ${isSubmitDisabled ? 'bg-blue-300' : 'bg-blue-500'}`}
          accessibilityLabel="Save workout button"
          testID="save-workout-button"
        >
          <Text className="text-white text-center font-bold text-base">
            {isSubmitting ? 'Saving...' : 'Save Workout'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} className='bg-gray-200 py-3 px-4 rounded-lg mt-3 items-center'>
            <Text className="font-semibold text-gray-700">Cancel</Text>
        </TouchableOpacity>
        </View>
    </SafeAreaView>
  )
}

export default CreateWorkout