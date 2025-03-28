import { CreateWorkoutRequest, GetWorkoutExercisesResponse, GetWorkoutsResponse, } from "@/api/interfaces/workout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createWorkoutRequest,
    deleteWorkoutRequest,
    getExercisesFromWorkoutRequest,
    getWorkoutsRequest,
    removeExerciseFromWorkoutRequest,
    updateExerciseLoadRequest,
    updateWorkoutRequest,
} from "@/api/workout/api";

export const useGetWorkoutsQuery = () => {
    const { isLoading, isSuccess, isError, error, data } = useQuery({
        queryKey: ["GetWorkouts"],
        queryFn: () => getWorkoutsRequest(),
    });

    return {
        isLoading,
        isSuccess,
        isError,
        error,
        data,
    };
};

export const useGetExercisesFromWorkoutQuery = (workoutId: number) => {
    const { isLoading, isSuccess, isError, isFetching, error, data } = useQuery({
        queryKey: ["GetWorkoutExercises", workoutId],
        enabled: workoutId != null,
        queryFn: () => getExercisesFromWorkoutRequest(workoutId),
    });

    return {
        isLoading,
        isSuccess,
        isError,
        isFetching,
        error,
        data,
    };
};

export const useDeleteExerciseFromWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ workoutExerciseId }: { workoutExerciseId: number }) => 
            removeExerciseFromWorkoutRequest(workoutExerciseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetWorkoutExercises"] });
        },
    });

    return {
        mutate,
    };
};

export const usePatchWorkoutExerciseMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ workoutExerciseId, load, sets, reps }: 
            { workoutExerciseId: number; load: number, sets: number, reps: number }) => 
            updateExerciseLoadRequest(workoutExerciseId, load, sets, reps),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetWorkoutExercises"] });
        },
    });

    return {
        mutate,
    };
};

export const usePatchWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ workoutId, name }: { workoutId: number; name: string }) => 
            updateWorkoutRequest(workoutId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetWorkouts"] });
        },
    });

    return {
        mutate,
    };
};

export const useDeleteWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: (workoutId: number) => deleteWorkoutRequest(workoutId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetWorkouts"] });
        },
    });

    return {
        mutate,
    };
};

export const useCreateWorkoutMutation = () => {
    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateWorkoutRequest) => createWorkoutRequest(data),
    });

    return {
        mutate,
        isLoading: isPending,
    };
};
