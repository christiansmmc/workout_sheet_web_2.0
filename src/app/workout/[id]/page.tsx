"use client";

import React, { useEffect } from 'react';
import { Home, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BeatLoader } from 'react-spinners';
import ExerciseCard from '@/components/card/exerciseCard';
import { useGetExercisesFromWorkoutQuery } from '@/api/workout/queries';
import ActionButton from '@/components/button/actionButton';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);

    const { isSuccess, data, isError } = useGetExercisesFromWorkoutQuery(unwrappedParams.id);

    useEffect(() => {
        if (isError) {
            router.push('/workout');
        }
    }, [isError, router]);

    const handleGoHome = () => {
        router.push("/workout");
    };

    const handleStartWorkout = () => {
        router.push(`/workout/${unwrappedParams.id}/start-workout`);
    };

    return (
        <main className='app-container'>
            <header className="sticky top-0 z-10 flex items-center justify-center px-4 bg-zinc-800 h-12 shadow-lg border-b border-zinc-700">
                {isSuccess && data && (
                    <h1 className="text-lg font-semibold text-white truncate text-center">{data.name}</h1>
                )}
            </header>

            <div
                className='flex flex-col items-center mt-4 pb-20 max-h-[calc(100vh-8rem)] overflow-y-auto lg:gap-6'>
                {isSuccess && data ? (
                    data?.workoutExercises
                        .sort((a, b) => {
                            const bodyPartComparison = a.exercise.bodyPart.localeCompare(b.exercise.bodyPart);

                            return bodyPartComparison === 0
                                ? a.exercise.name.localeCompare(b.exercise.name)
                                : bodyPartComparison;
                        })
                        .map((workoutExercise) => (
                            <ExerciseCard
                                key={workoutExercise.exercise.id}
                                workoutExercise={workoutExercise}
                                workoutId={unwrappedParams.id}
                            />
                        ))
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BeatLoader size={26} color="#dc2626" />
                    </div>
                )}
            </div>

            {isSuccess && data && data.workoutExercises.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] z-10">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={handleGoHome}
                            className='flex items-center justify-center p-1.5 rounded-full hover:bg-zinc-700 active:bg-zinc-600 transition-colors bg-transparent border-0'
                            aria-label="Voltar para a página inicial"
                        >
                            <Home size={20} />
                        </button>

                        <ActionButton
                            onClick={handleStartWorkout}
                            width="w-48"
                            height="h-10"
                            className="flex items-center justify-center gap-2"
                        >
                            <Play size={16} />
                            Iniciar Treino
                        </ActionButton>

                        <div className="w-[28px]"></div>
                    </div>
                </div>
            )}
        </main>
    );
}
