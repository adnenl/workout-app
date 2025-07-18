import { WorkoutExercise } from '@/types/workoutExercise';
import React, { createContext, useContext } from 'react';

interface AddExerciseContextType {
  onAddExercise: (exercise: WorkoutExercise) => void;
}

const AddExerciseContext = createContext<AddExerciseContextType | null>(null);

export const useAddExercise = () => {
  const context = useContext(AddExerciseContext);
  if (!context) {
    throw new Error('useAddExercise must be used within an AddExerciseProvider');
  }
  return context;
};

export const AddExerciseProvider: React.FC<{ onAddExercise: (exercise: WorkoutExercise) => void; children: React.ReactNode }> = ({
  onAddExercise,
  children,
}) => {
  return (
    <AddExerciseContext.Provider value={{ onAddExercise }}>
      {children}
    </AddExerciseContext.Provider>
  );
};