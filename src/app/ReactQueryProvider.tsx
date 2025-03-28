"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import React from "react";
import { handleQueryError } from "@/utils/queryErrorHandler";
import { AxiosError } from "axios";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                const axiosError = error as AxiosError;
                // Tentar novamente apenas em falhas de rede, não em erros de API
                if (!axiosError.response && axiosError.request) {
                    // Erros de rede - tentar novamente até 3 vezes
                    return failureCount < 3;
                }
                
                // Para erros com resposta, não fazemos retry mas tratamos o erro
                handleQueryError(error, 'default', true);
                return false;
            },
            refetchOnWindowFocus: false,
            gcTime: 5 * 60 * 1000, // 5 minutos
            staleTime: 30 * 1000,  // 30 segundos
            // Tempo de espera entre as novas tentativas (em ms)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: (failureCount, error) => {
                // Não fazemos retry para mutações, mas tratamos o erro
                handleQueryError(error, 'default', true);
                return false;
            },
        },
    },
});

export const ReactQueryProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};
