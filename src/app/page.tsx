'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Dumbbell, ClipboardList, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="auth-container flex flex-col lg:flex-row">
      {/* Content Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center 
                      px-6 py-8 lg:px-16 xl:px-24 
                      order-2 lg:order-1">
        <div className="w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center lg:text-left">MeuTreino</h1>

          <div className="text-base sm:text-lg mb-6 sm:mb-8 text-center lg:text-left">
            <p className="mb-1 sm:mb-2">Transforme seus treinos em resultados concretos.</p>
            <p>Planeje, execute e evolua sua performance com precisão.</p>
          </div>

          {/* Features Section */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Dumbbell className="text-red-600 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <span className="text-sm sm:text-base">Crie treinos personalizados com exercícios detalhados</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <ClipboardList className="text-red-600 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <span className="text-sm sm:text-base">Registre repetições, séries e cargas em tempo real</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <TrendingUp className="text-red-600 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <span className="text-sm sm:text-base">Acompanhe sua evolução e progresso de forma simples</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <CheckCircle className="text-red-600 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <span className="text-sm sm:text-base">Controle quais exercícios realizou ou pulou</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Link href="/login" className="block">
              <button
                className="w-full bg-red-600 text-white 
                           py-2.5 sm:py-3 rounded-lg hover:bg-red-700 
                           transition-colors duration-300
                           active:scale-95 transform"
              >
                Entrar
              </button>
            </Link>

            <Link href="/register" className="block">
              <button
                className="w-full bg-zinc-800 text-white 
                           py-2.5 sm:py-3 rounded-lg hover:bg-zinc-700 
                           transition-colors duration-300
                           active:scale-95 transform"
              >
                Criar conta
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full lg:w-1/2 relative 
                      min-h-[40vh] lg:min-h-screen
                      order-1 lg:order-2">
        <Image
          src="/images/landing-page-banner.webp"
          alt="MeuTreino Fitness App"
          fill
          className="absolute inset-0 object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
    </div>
  );
}