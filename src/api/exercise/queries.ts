import { useQuery } from "@tanstack/react-query";
import { GetExercisesResponse } from "@/api/interfaces/exercise";
import { getExercisesRequest } from "@/api/exercise/api";

export const useGetExercisesQuery = (
    fetchExercises: boolean,
    bodyPart: string[]
) => {
    const { isLoading, data } = useQuery({
        queryKey: ["GetExercises"],
        queryFn: () => getExercisesRequest(bodyPart),
        enabled: fetchExercises,
    });

    return {
        isLoading,
        data,
    };
};
