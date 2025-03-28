'use client';

import { DoorOpen, User, PlusCircle } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import Cookie from 'js-cookie';
import { useRouter } from 'next/navigation';
import WorkoutCard from '@/components/card/workoutCard';
import { useGetWorkoutsQuery } from '@/api/workout/queries';
import { useQueryClient } from '@tanstack/react-query';

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isSuccess, data } = useGetWorkoutsQuery();

  const handleLogout = () => {
    // Remover o token
    Cookie.remove('access_token');

    // Limpar o cache do React Query
    queryClient.clear();

    // Redirecionar para a página inicial
    router.push('/');
  };

  const handleEnterWorkout = (id: string) => {
    router.push(`/workout/${id}`);
  };

  const handleEnterCreateWorkout = () => {
    router.push(`/create-workout`);
  };

  return (
    <main className="app-container">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 bg-zinc-800 h-16 shadow-lg">
        <div
          onClick={handleLogout}
          className="cursor-pointer p-2 rounded-full active:bg-neutral-600 lg:hover:bg-neutral-700 transition-colors duration-200">
          <DoorOpen size={24} />
        </div>
        <h1 className="text-xl font-semibold">Meus Treinos</h1>
        <div
          className="cursor-pointer p-2 rounded-full active:bg-neutral-600 lg:hover:bg-neutral-700 transition-colors duration-200">
          <User size={24} />
        </div>
      </header>

      {/* Workout List */}
      <section className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 md:px-8 lg:px-10 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto pb-20">
          {isSuccess && data ? (
            data.length > 0 ? (
              data
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .map((workout) => (
                  <div key={workout.id} className="mb-5">
                    <WorkoutCard
                      workout={workout}
                      onClick={handleEnterWorkout}
                    />
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center p-6 bg-zinc-800 rounded-xl shadow-lg">
                <p className="text-xl text-zinc-400 mb-4">Nenhum treino encontrado</p>
                <p className="text-zinc-500 mb-6">Crie seu primeiro treino para começar</p>
                <button
                  onClick={handleEnterCreateWorkout}
                  className="flex items-center gap-2 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 
                            transition-colors duration-300 active:scale-95 transform">
                  <PlusCircle size={20} />
                  Criar treino
                </button>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BeatLoader size={24} color="#dc2626" />
            </div>
          )}
        </div>
      </section>

      {/* Create Workout Button - Only show if there are workouts */}
      {isSuccess && data && data.length > 0 && (
        <section className="fixed bottom-6 right-6 md:bottom-8 md:right-8">
          <button
            onClick={handleEnterCreateWorkout}
            className="flex items-center justify-center bg-red-600 text-white p-4 rounded-full shadow-lg 
                     hover:bg-red-700 transition-colors duration-300 
                     active:scale-95 transform">
            <PlusCircle size={24} />
          </button>
        </section>
      )}
    </main>
  );
}
