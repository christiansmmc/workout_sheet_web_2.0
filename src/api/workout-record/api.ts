import api from "@/api/axiosConfig";
import { WorkoutRecordRequest, WorkoutRecord } from "@/api/interfaces/workout";

export const createWorkoutRecordRequest = async (payload: WorkoutRecordRequest) => {
    const promise = api.post(`/workout-record`, payload);

    return await promise
};

export const getLastWorkoutRecordByWorkoutId = async (workoutId: number) => {
    const promise = api.get<WorkoutRecord | null>(`/workout-record/last?workoutId=${workoutId}`);

    return await promise;
};