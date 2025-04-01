import api from "@/api/axiosConfig";
import { WorkoutRecordRequest } from "@/api/interfaces/workout";

export const createWorkoutRecordRequest = async (payload: WorkoutRecordRequest) => {
    const promise = api.post(`/workout-record`, payload);

    return await promise
};