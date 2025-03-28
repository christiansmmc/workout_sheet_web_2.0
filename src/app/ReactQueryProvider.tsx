"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import React from "react";
import { handleQueryError } from "@/utils/queryErrorHandler";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            gcTime: 0,
            staleTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
});

// Configuração global de tratamento de erros
queryClient.setQueryDefaults(["*"], {
    retry: (failureCount, error) => {
        handleQueryError(error);
        return false;
    },
});

queryClient.setMutationDefaults(["*"], {
    retry: (failureCount, error) => {
        handleQueryError(error);
        return false;
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
