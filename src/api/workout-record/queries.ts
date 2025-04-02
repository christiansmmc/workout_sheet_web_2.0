import { WorkoutRecordRequest, WorkoutRecord } from "@/api/interfaces/workout";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createWorkoutRecordRequest, getLastWorkoutRecordByWorkoutId } from "@/api/workout-record/api";
import { useRouter } from "next/navigation";

export const useCreateWorkoutRecord = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload: WorkoutRecordRequest) => {
            const response = await createWorkoutRecordRequest(payload);
            console.log('API response for create workout record:', response);
            return response;
        }
    });
};

export const useGetLastWorkoutRecord = (workoutId: number) => {
    return useQuery({
        queryKey: ['lastWorkoutRecord', workoutId],
        queryFn: async () => {
            const response = await getLastWorkoutRecordByWorkoutId(workoutId);
            console.log('API response for last workout record:', response);
            return response;
        },
        select: (response) => response.data,
        enabled: !!workoutId // Só executa a query se workoutId estiver definido
    });
};
