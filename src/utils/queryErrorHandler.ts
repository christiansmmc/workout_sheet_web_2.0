import { AxiosError } from "axios";
import { RequestError } from "@/api/interfaces/request";
import toastService from "@/utils/toast";
import { removeToken } from "@/utils/authUtils";

// Define tipos de contexto para personalizar mensagens de erro
export type ErrorContext =
  | 'default'
  | 'login'
  | 'register';

// Conjunto de mensagens para cada contexto
const errorMessages = {
  login: {
    400: "Dados de login inválidos. Verifique os campos preenchidos.",
    401: "Credenciais inválidas. Verifique seu email e senha.",
    403: "Seu acesso foi negado.",
    429: "Muitas tentativas de login. Tente novamente mais tarde.",
    500: "Erro no servidor. Tente novamente mais tarde.",
    network: "Erro de conexão. Verifique sua internet e tente novamente.",
    default: "Falha ao fazer login. Tente novamente."
  },
  register: {
    400: "Dados inválidos. Verifique os campos preenchidos.",
    409: "Este email já está em uso. Tente outro email.",
    422: "Não foi possível validar os dados. Verifique os campos preenchidos.",
    500: "Erro no servidor. Tente novamente mais tarde.",
    network: "Erro de conexão. Verifique sua internet e tente novamente.",
    default: "Falha ao criar conta. Tente novamente."
  },
  default: {
    400: "Dados inválidos. Verifique as informações enviadas.",
    401: "Autenticação necessária. Faça login novamente.",
    403: "Você não tem permissão para realizar esta operação.",
    404: "Recurso não encontrado.",
    409: "Conflito ao processar a solicitação.",
    422: "Dados inválidos. Verifique as informações enviadas.",
    429: "Muitas requisições. Tente novamente mais tarde.",
    500: "Servidor temporariamente indisponível. Tente novamente mais tarde.",
    502: "Servidor temporariamente indisponível. Tente novamente mais tarde.",
    503: "Servidor temporariamente indisponível. Tente novamente mais tarde.",
    504: "Servidor temporariamente indisponível. Tente novamente mais tarde.",
    network: "Erro de conexão. Verifique sua internet e tente novamente.",
    default: "Ocorreu um erro inesperado"
  }
};

// Função utilitária para navegação client-side 
// Criada para não importar useRouter (que é um hook) diretamente aqui
const redirectToLogin = () => {
  // Em client components, podemos substituir por useRouter().push('/login')
  // Mas aqui usamos location pois funciona em contextos sem o hook do Next.js
  window.location.href = "/login";
};

export const handleQueryError = (error: unknown, context: ErrorContext = 'default', redirectOnAuth = true) => {
  const axiosError = error as AxiosError<RequestError>;
  const messages = errorMessages[context];

  if (axiosError?.response) {
    const statusCode = axiosError.response.status;
    const errorMessage = axiosError.response.data?.message;

    // Caso especial para 401 com redirecionamento
    if ((statusCode === 401 || statusCode === 403) && redirectOnAuth) {
      // Limpar o token antes de redirecionar para evitar loop de redirecionamento
      removeToken();
      redirectToLogin();
      return;
    }

    // Buscar mensagem específica para este código de status e contexto
    const message = messages[statusCode as keyof typeof messages] || messages.default;
    toastService.error(errorMessage || message);
  } else if (axiosError?.request) {
    // Erro de rede - sem resposta do servidor
    toastService.error(messages.network);
  } else {
    // Erro desconhecido
    toastService.error(messages.default);
  }
};