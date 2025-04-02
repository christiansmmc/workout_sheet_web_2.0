"use client";

import { LoginRequestPayload, LoginResponsePayload, RegisterRequestPayload } from "@/api/interfaces/user";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { setToken } from "@/utils/authUtils";
import { loginRequest, registerRequest } from "@/api/user/api";

export const useLoginMutation = () => {
    const router = useRouter();

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: (data: LoginRequestPayload) => loginRequest(data),
        onSuccess: (data: LoginResponsePayload) => {
            if (data) {
                setToken(data.token);
                router.push("/treinos");
            }
        },
    });

    return {
        mutate,
        isLoading: isPending,
        isError,
        error,
    };
};

export const useRegisterMutation = () => {
    const router = useRouter();

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: (data: RegisterRequestPayload) => registerRequest(data),
        onSuccess: () => {
            router.push("/entrar");
        },
    });

    return {
        mutate,
        isLoading: isPending,
        isError,
        error,
    };
};
