import { CreateWorkoutRequest, UpdateWorkoutsListOrderRequest } from "@/api/interfaces/workout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createWorkoutRequest,
    deleteWorkoutRequest,
    getExercisesFromWorkoutRequest,
    getWorkoutsRequest,
    removeExerciseFromWorkoutRequest,
    updateExerciseLoadRequest,
    updateWorkoutRequest,
    updateWorkoutsListOrderRequest,
} from "@/api/workout/api";

// Tipos reutilizáveis
type WorkoutId = string;
type WorkoutExerciseId = string;

type PatchWorkoutExercisePayload = {
    workoutExerciseId: WorkoutExerciseId;
    workoutId: WorkoutId;
    load: number;
    sets: number;
    reps: number;
};

type DeleteWorkoutExercisePayload = {
    workoutExerciseId: WorkoutExerciseId;
    workoutId: WorkoutId; // Usado apenas para invalidar cache
};

export const useGetWorkoutsQuery = () => {
    return useQuery({
        queryKey: ["GetWorkouts"],
        queryFn: () => getWorkoutsRequest(),
    });
};

export const useGetExercisesFromWorkoutQuery = (workoutId: WorkoutId) => {
    return useQuery({
        queryKey: ["workout", workoutId, "exercises"],
        enabled: typeof workoutId === "string" && workoutId.length > 0,
        queryFn: () => getExercisesFromWorkoutRequest(workoutId),
    });
};

export const useDeleteExerciseFromWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ workoutExerciseId }: DeleteWorkoutExercisePayload) =>
            removeExerciseFromWorkoutRequest(workoutExerciseId),
        onSuccess: (_, { workoutId }) => {
            queryClient.invalidateQueries({ queryKey: ["workout", workoutId, "exercises"] });
        },
    });

    return { mutate };
};

export const usePatchWorkoutExerciseMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ workoutExerciseId, load, sets, reps }: PatchWorkoutExercisePayload) =>
            updateExerciseLoadRequest(workoutExerciseId, load, sets, reps),
        onSuccess: (_, { workoutId }) => {
            queryClient.invalidateQueries({ queryKey: ["workout", workoutId, "exercises"] });
        },
    });

    return { mutate };
};

export const usePatchWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ workoutId, name }: { workoutId: WorkoutId; name: string }) =>
            updateWorkoutRequest(workoutId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetWorkouts"] });
        },
    });

    return { mutate };
};

export const useDeleteWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: (workoutId: WorkoutId) => deleteWorkoutRequest(workoutId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetWorkouts"] });
        },
    });

    return { mutate };
};

export const useCreateWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateWorkoutRequest) => createWorkoutRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetWorkouts"] });
        },
    });

    return {
        mutate,
        isLoading: isPending,
    };
};

export const usePatchWorkoutsListOrderMutation = () => {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: UpdateWorkoutsListOrderRequest[]) => updateWorkoutsListOrderRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetWorkouts"] });
        },
    });

    return { mutate, isPending };
};
