'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Dumbbell, ClipboardList, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Pequeno atraso para garantir que a animação ocorra após o carregamento
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="auth-container flex flex-col lg:flex-row">
      {/* Content Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center 
                      px-6 py-8 lg:px-16 xl:px-24 
                      order-2 lg:order-1">
        <div className={`w-full max-w-md transition-opacity duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center lg:text-left 
                        bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">
            MeuTreino
          </h1>

          <div className="text-base sm:text-lg mb-6 sm:mb-8 text-center lg:text-left">
            <p className="mb-1 sm:mb-2">Transforme seus treinos em resultados concretos.</p>
            <p>Planeje, execute e evolua sua performance com precisão.</p>
          </div>

          {/* Features Section */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className={`flex items-center gap-3 sm:gap-4 transition-all duration-500 ease-out 
                          ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '150ms' }}>
              <div className="bg-zinc-800 p-2 rounded-lg shadow-inner">
                <Dumbbell className="text-red-600 w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
              </div>
              <span className="text-sm sm:text-base">Crie treinos personalizados com exercícios detalhados</span>
            </div>
            <div className={`flex items-center gap-3 sm:gap-4 transition-all duration-500 ease-out 
                          ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '250ms' }}>
              <div className="bg-zinc-800 p-2 rounded-lg shadow-inner">
                <ClipboardList className="text-red-600 w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
              </div>
              <span className="text-sm sm:text-base">Registre repetições, séries e cargas em tempo real</span>
            </div>
            <div className={`flex items-center gap-3 sm:gap-4 transition-all duration-500 ease-out 
                          ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '350ms' }}>
              <div className="bg-zinc-800 p-2 rounded-lg shadow-inner">
                <TrendingUp className="text-red-600 w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
              </div>
              <span className="text-sm sm:text-base">Acompanhe sua evolução e progresso de forma simples</span>
            </div>
            <div className={`flex items-center gap-3 sm:gap-4 transition-all duration-500 ease-out 
                          ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '450ms' }}>
              <div className="bg-zinc-800 p-2 rounded-lg shadow-inner">
                <CheckCircle className="text-red-600 w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
              </div>
              <span className="text-sm sm:text-base">Controle quais exercícios realizou ou pulou</span>
            </div>
          </div>

          <div className={`space-y-3 sm:space-y-4 transition-all duration-500 ease-out 
                        ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '550ms' }}>
            <Link href="/entrar" className="block">
              <button
                className="w-full bg-red-600 text-white 
                           py-2.5 sm:py-3 rounded-lg hover:bg-red-700 
                           transition-all duration-300
                           active:scale-95 transform hover:shadow-lg"
              >
                Entrar
              </button>
            </Link>

            <Link href="/cadastro" className="block">
              <button
                className="w-full bg-zinc-800 text-white 
                           py-2.5 sm:py-3 rounded-lg hover:bg-zinc-700 
                           transition-all duration-300 border border-zinc-700
                           active:scale-95 transform hover:shadow-lg"
              >
                Criar conta
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Image Section with Gradient Overlay */}
      <div className="w-full lg:w-1/2 relative 
                      min-h-[40vh] lg:min-h-screen
                      order-1 lg:order-2">
        <Image
          src="/images/landing-page-banner.webp"
          alt="MeuTreino Fitness App"
          fill
          className={`absolute inset-0 object-cover transition-opacity duration-1000 ease-out 
                    ${isLoaded ? 'opacity-100' : 'opacity-70'}`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {/* Improved Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20"></div>

        {/* Added Brand Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center px-6 transition-all duration-700 ease-out transform
                         ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Evolua seus <span className="text-red-500">treinos</span>
            </h2>
            <p className="text-xl text-zinc-200 max-w-md mx-auto drop-shadow-md">
              Acompanhe seu progresso de forma simples e eficiente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}