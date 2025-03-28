import {LoginRequestPayload, LoginResponsePayload, RegisterRequestPayload} from "@/api/interfaces/user";
import api from "@/api/axiosConfig";
import { handleQueryError } from "@/utils/queryErrorHandler";

export const loginRequest = async (payload: LoginRequestPayload): Promise<LoginResponsePayload> => {
    try {
        const { data } = await api.post<LoginResponsePayload>(`/authenticate`, payload);
        return data;
    } catch (error) {
        // Usar o handler global com contexto de login e desativar redirecionamento automático
        // (pois já estamos na tela de login)
        handleQueryError(error, 'login', false);
        throw error;
    }
};

export const registerRequest = async (payload: RegisterRequestPayload) => {
    try {
        const { data } = await api.post(`/clients`, payload);
        return data;
    } catch (error) {
        // Usar o handler global com contexto de registro
        handleQueryError(error, 'register', false);
        throw error;
    }
};
