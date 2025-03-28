export interface GetWorkoutsResponse {
    id: string;
    name: string;
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
