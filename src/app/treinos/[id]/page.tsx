"use client";

import React, { useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
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
            router.push('/treinos');
        }
    }, [isError, router]);

    const handleGoBack = () => {
        router.push("/treinos");
    };

    const handleStartWorkout = () => {
        router.push(`/treinos/${unwrappedParams.id}/iniciar`);
    };

    return (
        <main className='h-full bg-[#161619] flex flex-col overflow-hidden ios-scroll-fix'>
            {/* Header com gradiente e efeito de blur */}
            <header className="z-20 backdrop-blur-lg bg-gradient-to-b from-[#18181b] to-[#18181b]/95 border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                            onClick={handleGoBack}
                            className="p-1 rounded hover:bg-zinc-700/40 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors mr-2"
                            aria-label="Voltar"
                        >
                            <ArrowLeft size={18} className="text-zinc-400 hover:text-red-500" />
                        </button>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-zinc-400">Detalhes do treino</span>
                            {isSuccess && data && (
                                <h1 className="text-sm font-medium text-white truncate max-w-[200px]">
                                    {data.name}
                                </h1>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50">
                        <span className="text-sm text-zinc-300">
                            {isSuccess && data ? `${data.workoutExercises.length} exercícios` : '...'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Container principal com scroll */}
            <div className="flex-1 overflow-y-auto pb-24 ios-scroll-fix">
                {/* Lista de exercícios */}
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 bg-[#161619]">
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
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <BeatLoader size={26} color="#ef4444" />
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Bar */}
            {isSuccess && data && data.workoutExercises.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#18181b]/95 backdrop-blur-lg border-t border-zinc-800 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGoBack}
                                className="w-32 py-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                            >
                                <span className="font-medium">Voltar</span>
                            </button>
                            <button
                                onClick={handleStartWorkout}
                                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Play size={18} />
                                <span className="font-medium">Iniciar treino</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
