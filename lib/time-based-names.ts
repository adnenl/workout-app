export const getWorkoutName = (time: Date): string => {
    if (time.getHours() < 12) {
        return 'Morning Workout'
    }
    if (time.getHours() < 18) {
        return 'Afternoon Workout'
    }
    return 'Evening Workout'
};