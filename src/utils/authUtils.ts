import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp?: number;
  [key: string]: any;
}

export const getToken = () => {
  return Cookie.get("access_token");
};

export const setToken = (token: string) => {
  Cookie.set("access_token", token);
};

export const isAuthenticated = () => {
  return Cookie.get("access_token");
};

export const removeToken = () => {
  if (isAuthenticated()) {
    Cookie.remove("access_token");
  }
};

// Verifica se o token JWT expirou
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);

    // Se não tem campo exp, consideramos válido
    if (!decoded.exp) return false;

    // Verifica se o token expirou comparando com o tempo atual
    // exp é em segundos, Date.now() é em milissegundos
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    // Se não conseguiu decodificar, consideramos expirado/inválido
    return true;
  }
};

// Verifica se o token é válido e não expirou
export const isTokenValid = (token?: string): boolean => {
  if (!token) return false;

  try {
    // Verifica se é um JWT válido tentando decodificar
    jwtDecode(token);
    // Verifica se não expirou
    return !isTokenExpired(token);
  } catch (error) {
    return false;
  }
};
