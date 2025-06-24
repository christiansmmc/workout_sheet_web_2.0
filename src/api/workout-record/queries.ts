import { WorkoutRecordRequest } from "@/api/interfaces/workout";
import { createWorkoutRecordRequest, getLastWorkoutRecordByWorkoutId } from "@/api/workout-record/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCreateWorkoutRecord = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload: WorkoutRecordRequest) => {
            const response = await createWorkoutRecordRequest(payload);
            return response;
        }
    });
};

export const useGetLastWorkoutRecord = (workoutId: number) => {
    return useQuery({
        queryKey: ['lastWorkoutRecord', workoutId],
        queryFn: async () => {
            const response = await getLastWorkoutRecordByWorkoutId(workoutId);
            return response;
        },
        select: (response) => response.data,
        enabled: !!workoutId
    });
};
