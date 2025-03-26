import { CreateWorkoutRequest, GetWorkoutExercisesResponse, GetWorkoutsResponse, } from "@/api/interfaces/workout";
import { AxiosError, AxiosResponse } from "axios";
import { RequestError } from "@/api/interfaces/request";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/navigation";
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
    const router = useRouter();

    const { isLoading, isSuccess, isError, error, data, remove } = useQuery<
        GetWorkoutsResponse[],
        AxiosError<RequestError>
    >({
        queryKey: ["GetWorkouts"],
        queryFn: () => getWorkoutsRequest(),
        onError: (err) => {
            if (err?.response?.status === 401) {
                router.push("/login");
            }
        },
    });

    return {
        isLoading,
        isSuccess,
        isError,
        error,
        data,
        remove,
    };
};

export const useGetExercisesFromWorkoutQuery = (workoutId: number) => {
    const router = useRouter();

    const { isLoading, isSuccess, isError, isFetching, error, remove, data } = useQuery<
        GetWorkoutExercisesResponse,
        AxiosError<RequestError>
    >({
        queryKey: ["GetWorkoutExercises"],
        enabled: workoutId != null,
        queryFn: () => getExercisesFromWorkoutRequest(workoutId),
        onError: (err) => {
            if (err?.response?.status === 401) {
                router.push("/login");
            }
        },
    });

    return {
        isLoading,
        isSuccess,
        isError,
        isFetching,
        error,
        remove,
        data,
    };
};

export const useDeleteExerciseFromWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation<
        AxiosResponse,
        AxiosError<RequestError>,
        { workoutExerciseId: number },
        unknown
    >({
        mutationFn: ({ workoutExerciseId }) => removeExerciseFromWorkoutRequest(workoutExerciseId),
        onSuccess: () => {
            queryClient.invalidateQueries("GetWorkoutExercises");
        },
    });

    return {
        mutate,
    };
};

export const usePatchWorkoutExerciseMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation<
        AxiosResponse,
        AxiosError<RequestError>,
        { workoutExerciseId: number; load: number, sets: number, reps: number },
        unknown
    >({
        mutationFn: ({ workoutExerciseId, load, sets, reps }) => updateExerciseLoadRequest(workoutExerciseId, load, sets, reps),
        onSuccess: () => {
            queryClient.invalidateQueries("GetWorkoutExercises");
        },
    });

    return {
        mutate,
    };
};

export const usePatchWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation<
        AxiosResponse,
        AxiosError<RequestError>,
        { workoutId: number; name: string },
        unknown
    >({
        mutationFn: ({ workoutId, name }) => updateWorkoutRequest(workoutId, name),
        onSuccess: () => {
            queryClient.invalidateQueries("GetWorkouts");
        },
    });

    return {
        mutate,
    };
};

export const useDeleteWorkoutMutation = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation<AxiosResponse, AxiosError<RequestError>, number, unknown>({
        mutationFn: (workoutId: number) => deleteWorkoutRequest(workoutId),
        onSuccess: () => {
            queryClient.invalidateQueries("GetWorkouts");
        },
    });

    return {
        mutate,
    };
};

export const useCreateWorkoutMutation = () => {
    const { mutate, isLoading } = useMutation<unknown, AxiosError<RequestError>, CreateWorkoutRequest, unknown>(
        {
            mutationFn: (data: CreateWorkoutRequest) => createWorkoutRequest(data),
        }
    );

    return {
        mutate,
        isLoading,
    };
};
