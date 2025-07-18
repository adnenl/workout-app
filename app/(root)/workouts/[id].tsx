import { addSet, deleteSet, deleteWorkout, getAllWorkoutExercisesWithSets, getLastWorkoutExercise, getWorkoutById, updateWorkoutExercise } from '@/actions/workoutActions';
import ExerciseCard from '@/components/ExerciseCard';
import { Workout } from '@/types/workout';
import { WorkoutExercise } from '@/types/workoutExercise';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const WorkoutDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastEntries, setLastEntries] = useState<{[key: string]: WorkoutExercise}>({});
  
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
    getAllWorkoutExercisesWithSets(id);
  }, [id]);

  // Fetch last entries for all exercises
  useEffect(() => {
    if (!workout || !workout.workoutExercises) return;
    
    const fetchLastEntries = async () => {
      const entries: {[key: string]: WorkoutExercise} = {};
      
      for (const we of workout.workoutExercises) {
        if (we.exercise?.$id) {
          try {
            const lastEntry = await getLastWorkoutExercise(we.exercise.$id);
            console.log(`Last entry for exercise ${we.exercise.$id}:`, lastEntry?.sets);
            if (lastEntry && lastEntry.$id !== we.$id) { // Don't use current exercise as "last"
              entries[we.exercise.$id] = lastEntry;
            }
          } catch (error) {
            console.error(`Failed to fetch last entry for ${we.exercise.$id}:`, error);
          }
        }
      }

      // Safely log the first entry if it exists
  const firstKey = Object.keys(entries)[0];
  if (firstKey && entries[firstKey]?.sets?.length > 0) {
    console.log("First set in first entry:", entries[firstKey].sets[0]);
  } else {
    console.log("No last entries found with sets");
  }
      
      setLastEntries(entries);
      
    };
    
    fetchLastEntries();
  }, [workout]);

  const handleDeleteSet = (setId: string) => {
    if (!workout) return;
    const updatedExercises = workout.workoutExercises.map((exercise: WorkoutExercise) => {
      if (exercise.sets.some(set => set.$id === setId)) {
        return {
          ...exercise,
          sets: exercise.sets.filter(set => set.$id !== setId),
        };
      }
      return exercise;
    });
    setWorkout(prev => prev ? { ...prev, workoutExercises: updatedExercises } : null);
    deleteSet(setId);
  }

  const handleAddSet = async (workoutExerciseId: string) => {
    console.log('handleAddSet called for', workoutExerciseId);
    if (!workout) return;

    const exercise = workout.workoutExercises.find(e => e.$id === workoutExerciseId);
    const order = exercise ? exercise.sets.length : 0;

    // Create set in backend and get the real set object
    const createdSet = await addSet(workoutExerciseId, undefined, undefined, order);

    // Update local state with the new set (with correct $id)
    setWorkout(prev => {
      if (!prev) return null;
      const updatedExercises = prev.workoutExercises.map(exercise => {
        if (exercise.$id === workoutExerciseId) {
          return { ...exercise, sets: [...exercise.sets, createdSet] };
        }
        return exercise;
      });
      return { ...prev, workoutExercises: updatedExercises };
    });
  }

  const handleDeleteWorkout = async () => {
    if (!id) return;
    try {
      await deleteWorkout(id);
      router.push('/');
    } catch (error) {
      console.error("Failed to delete workout:", error);
      setError("Could not delete workout. Please try again later.");
    }
  };

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
      <ScrollView className="p-5">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push('/')}
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
            <View className="mt-4">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                Exercises:
              </Text>
              {workout.workoutExercises && workout.workoutExercises.length > 0 ? (
                workout.workoutExercises.map((we: WorkoutExercise) => (
                  <ExerciseCard
                    key={we.$id}
                    workoutExerciseId={we.$id}
                    name={we.exercise?.name ?? ''}
                    sets={we.sets}
                    lastEntry={we.exercise?.$id ? lastEntries[we.exercise.$id] : null}
                    onSetChange={(index, field, value) => {

                      const updatedSets = [...we.sets];
                                 

                      if (field === 'reps') {
                        updatedSets[index].reps = value === '' ? undefined : parseInt(value, 10);
                      } else if (field === 'weight') {
                        updatedSets[index].weight = value === '' ? undefined : parseInt(value, 10);
                      }
                      
                      setWorkout(prev => {
                        if (!prev) return null;
                        const updatedExercises = prev.workoutExercises.map(exercise => {
                          if (exercise.$id === we.$id) {
                            return { ...exercise, sets: updatedSets };
                          }
                          return exercise;
                        });
                        return { ...prev, workoutExercises: updatedExercises };
                      });
                      updateWorkoutExercise(we.$id, updatedSets);
                    }}
                    onSetDelete={(setId) => handleDeleteSet(setId)}
                    onSetAdd={() => handleAddSet(we.$id)}
                  />
                ))
              ) : (
                <Text className="text-gray-500">No exercises found.</Text>
              )}

              <TouchableOpacity
                className="mt-4 bg-blue-500 py-3 px-4 rounded-lg items-center"
                onPress={() =>
                  router.push({
                    pathname: `/workouts/selectMuscle`,
                    params: { workoutId: workout.$id },
                  })
                }
              >
                <Text className="text-white font-semibold">Add Exercise</Text>
              </TouchableOpacity>

              {/* Delete Workout Button */}
            <TouchableOpacity
              className="mt-4 bg-red-500 py-3 px-4 rounded-lg items-center"
              onPress={handleDeleteWorkout}
            >
              <Text className="text-white font-semibold">Delete Workout</Text>
            </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text className="text-gray-500 text-lg">No workout details found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutDetails;