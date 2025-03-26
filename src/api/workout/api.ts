import { CreateWorkoutRequest, GetWorkoutExercisesResponse, GetWorkoutsResponse } from "@/api/interfaces/workout";
import api from "@/api/axiosConfig";
import { AxiosResponse } from "axios";
import toastService from "@/utils/toast";

export const getWorkoutsRequest = async (): Promise<GetWorkoutsResponse[]> => {
    const { data } = await api.get<GetWorkoutsResponse[]>(`/workouts`);
    return data;
};

export const getExercisesFromWorkoutRequest = async (workoutId: number): Promise<GetWorkoutExercisesResponse> => {
    const { data } = await api.get<GetWorkoutExercisesResponse>(`/workouts/${workoutId}`);
    return data;
};

export const removeExerciseFromWorkoutRequest = async (
    workoutExerciseId: number,
): Promise<AxiosResponse> => {
    const promise = api.delete<void>(`/workout-exercises/${workoutExerciseId}`);

    return await toastService.promise(promise, {
        pending: "Removendo exercício...",
        success: "Exercício removido",
        error: "Erro removendo exercício",
    });
};

export const updateExerciseLoadRequest = async (workoutExerciseId: number, load: number, sets: number, reps: number) => {
    const promise = api.patch(`/workout-exercises/${workoutExerciseId}`, {
        load,
        sets,
        reps
    });

    return await toastService.promise(promise, {
        pending: "Atualizando carga...",
        success: "Carga atualizada",
        error: "Erro atualizando carga",
    });
};

export const updateWorkoutRequest = async (workoutId: number, name: string): Promise<AxiosResponse> => {
    const promise = api.patch<void>(`/workouts/${workoutId}`, { name });

    return await toastService.promise(promise, {
        pending: "Atualizando treino...",
        success: "Treino atualizado",
        error: "Erro atualizando treino",
    });
};

export const deleteWorkoutRequest = async (workoutId: number): Promise<AxiosResponse> => {
    const promise = api.delete<void>(`/workouts/${workoutId}`);

    return await toastService.promise(promise, {
        pending: "Deletando treino...",
        success: "Treino deletado",
        error: "Erro deletando treino",
    });
};

export const createWorkoutRequest = async (payload: CreateWorkoutRequest) => {
    const data = api.post(`/workouts`, payload);

    await toastService.promise(data, {
        pending: "Criando treino...",
        success: "Treino criado",
        error: "Erro criando treino",
    });

    return { data };
};