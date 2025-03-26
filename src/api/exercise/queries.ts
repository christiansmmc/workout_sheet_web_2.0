import { AxiosError } from "axios";
import { RequestError } from "@/api/interfaces/request";
import { useQuery } from "react-query";
import { useRouter } from "next/navigation";
import { GetExercisesResponse } from "@/api/interfaces/exercise";
import toastService from "@/utils/toast";
import { getExercisesRequest } from "@/api/exercise/api";


export const useGetExercisesQuery = (
    fetchExercises: boolean,
    bodyPart: string[]
) => {
    const router = useRouter();

    const { isLoading, data } = useQuery<GetExercisesResponse[], AxiosError<RequestError>>({
        queryKey: ["GetExercises"],
        queryFn: () => getExercisesRequest(bodyPart),
        enabled: fetchExercises,
        onError: (err) => {
            if (err?.response?.status === 401) {
                router.push("/login");
            }

            toastService.error("Erro ao buscar exercícios");
            router.push("/workout");
        },
    });

    return {
        isLoading,
        data,
    };
};
