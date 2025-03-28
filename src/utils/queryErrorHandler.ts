import { AxiosError } from "axios";
import { RequestError } from "@/api/interfaces/request";
import toastService from "@/utils/toast";

export const handleQueryError = (error: unknown) => {
    const axiosError = error as AxiosError<RequestError>;
    
    if (axiosError?.response?.status === 401) {
        window.location.href = "/login";
        return;
    }

    toastService.error("Ocorreu um erro inesperado");
}; 