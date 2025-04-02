export interface GetWorkoutsResponse {
    id: string;
    name: string;
    listOrder: number;
}

export interface GetWorkoutExercisesResponse {
    id: string;
    name: string;
    workoutExercises: {
        id: string;
        sets: number;
        reps: number;
        exerciseLoad: number;
        exercise: {
            id: string;
            name: string;
            bodyPart: string;
        };
    }[];
}

export interface CreateWorkoutRequest {
    workoutName: string;
    exercises: {
        exerciseId: string;
        reps?: number;
        sets?: number;
        load?: number;
    }[];
}

export interface UpdateWorkoutsListOrderRequest {
    id: string;
    listOrder: number;
}

export interface WorkoutRecordRequest {
    workoutId: string;
    exercises: {
        exerciseId: string;
        status: string;
        exerciseSets: {
            set: number;
            reps: number | null;
            exerciseLoad: number;
        }[] | null;
    }[];
}

export interface WorkoutRecord {
    id: number;
    date: string;
    workout: {
        id: number;
        name: string;
    };
    workoutRecordExercises: {
        id: number;
        note: string;
        status: string;
        exercise: {
            id: number;
            name: string;
            bodyPart: string;
        };
        workoutRecordExerciseSets: {
            id: number;
            set: number;
            reps: number;
            exerciseLoad: number;
            note: string;
        }[];
    }[];
}
