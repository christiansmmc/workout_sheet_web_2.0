import { WorkoutRecordRequest } from "@/api/interfaces/workout";
import { useMutation } from "@tanstack/react-query";
import { createWorkoutRecordRequest } from "@/api/workout-record/api";
import { useRouter } from "next/navigation";

export const useCreateWorkoutRecord = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: WorkoutRecordRequest) => createWorkoutRecordRequest(payload),
        onSuccess: () => {
            router.push("/workout");
        }
    });
};
