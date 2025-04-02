import { NextRequest, NextResponse } from "next/server";
import { isTokenValid } from "@/utils/authUtils";

export default function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get("access_token");
  const token = tokenCookie?.value;
  const noAuthPaths = ["/", "/entrar", "/cadastro"];

  // Verifica se o token é válido (existe e não está expirado)
  const isValidToken = isTokenValid(token);

  // Se não tem token válido
  if (!isValidToken) {
    // Se está tentando acessar uma rota que não precisa de autenticação, permite
    if (noAuthPaths.includes(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    // Caso contrário, redireciona para home
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Se tem token válido e está tentando acessar uma rota pública
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/entrar" ||
    request.nextUrl.pathname === "/cadastro"
  ) {
    // Redireciona para a página principal de treinos
    const workoutUrl = new URL("/treinos", request.url);
    return NextResponse.redirect(workoutUrl);
  }

  // Permite acesso às rotas protegidas para usuários com token válido
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/entrar", "/cadastro", "/treinos"],
};
