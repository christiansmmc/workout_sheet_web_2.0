import { CreateWorkoutRequest, GetWorkoutExercisesResponse, GetWorkoutsResponse } from "@/api/interfaces/workout";
import api from "@/api/axiosConfig";
import { AxiosResponse } from "axios";
import toastService from "@/utils/toast";

export const getWorkoutsRequest = async (): Promise<GetWorkoutsResponse[]> => {
    const { data } = await api.get<GetWorkoutsResponse[]>("/workouts");
    return data;
};

export const getExercisesFromWorkoutRequest = async (workoutId: string): Promise<GetWorkoutExercisesResponse> => {
    const { data } = await api.get<GetWorkoutExercisesResponse>(`/workouts/${workoutId}`);
    return data;
};

export const removeExerciseFromWorkoutRequest = async (
    workoutExerciseId: string,
): Promise<AxiosResponse> => {
    const promise = api.delete<void>(`/workout-exercises/${workoutExerciseId}`);

    return await toastService.promise(promise, {
        pending: "Removendo exercício...",
        success: "Exercício removido com sucesso",
        error: "Ocorreu um erro inesperado",
    });
};

export const updateExerciseLoadRequest = async (workoutExerciseId: string, load: number, sets: number, reps: number) => {
    const promise = api.patch(`/workout-exercises/${workoutExerciseId}`, {
        load,
        sets,
        reps
    });

    return await toastService.promise(promise, {
        pending: "Atualizando carga...",
        success: "Carga atualizada com sucesso",
        error: "Ocorreu um erro inesperado",
    });
};

export const updateWorkoutRequest = async (workoutId: string, name: string): Promise<AxiosResponse> => {
    const promise = api.patch<void>(`/workouts/${workoutId}`, { name });

    return await toastService.promise(promise, {
        pending: "Atualizando treino...",
        success: "Treino atualizado com sucesso",
        error: "Ocorreu um erro inesperado",
    });
};

export const deleteWorkoutRequest = async (workoutId: string): Promise<AxiosResponse> => {
    const promise = api.delete<void>(`/workouts/${workoutId}`);

    return await toastService.promise(promise, {
        pending: "Deletando treino...",
        success: "Treino deletado com sucesso",
        error: "Ocorreu um erro inesperado",
    });
};

export const createWorkoutRequest = async (payload: CreateWorkoutRequest) => {
    const promise = api.post(`/workouts`, payload);

    return await toastService.promise(promise, {
        pending: "Criando treino...",
        success: "Treino criado com sucesso",
        error: "Ocorreu um erro inesperado",
    });
};