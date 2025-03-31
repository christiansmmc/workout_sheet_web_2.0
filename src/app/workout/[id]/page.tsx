"use client";

import React from 'react';
import { ArrowLeft, User, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BeatLoader } from 'react-spinners';
import ExerciseCard from '@/components/card/exerciseCard';
import { useGetExercisesFromWorkoutQuery } from '@/api/workout/queries';
import ActionButton from '@/components/button/actionButton';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);

    const { isSuccess, data } = useGetExercisesFromWorkoutQuery(unwrappedParams.id);

    const handleGoBack = () => {
        router.push("/workout");
    };

    const handleStartWorkout = () => {
        router.push(`/workout/${unwrappedParams.id}/start-workout`);
    };

    return (
        <main className='app-container'>
            <header className={"flex items-center justify-between px-10 bg-zinc-800 h-16 shadow-lg"}>
                <div
                    onClick={handleGoBack}
                    className='cursor-pointer p-1 active:bg-neutral-600 active:rounded lg:active:bg-neutral-600 lg:hover:bg-neutral-700 lg:hover:rounded'>
                    <ArrowLeft size={24} />
                </div>
                {isSuccess && data && (
                    <h1 className="text-xl font-semibold text-white">{data.name}</h1>
                )}
                <div
                    className='cursor-pointer p-1 active:bg-neutral-600 active:rounded lg:active:bg-neutral-600 lg:hover:bg-neutral-700 lg:hover:rounded'>
                    <User size={24} />
                </div>
            </header>

            <div
                className='flex flex-col items-center mt-4 max-h-[calc(100%-10rem)] overflow-y-auto lg:gap-6'>
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

            {/* Start Workout Button - Moved to bottom */}
            {isSuccess && data && data.workoutExercises.length > 0 && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center">
                    <ActionButton
                        onClick={handleStartWorkout}
                        width="w-52"
                        height="h-10"
                        className="flex items-center justify-center gap-2"
                    >
                        <Play size={16} />
                        Iniciar Treino
                    </ActionButton>
                </div>
            )}
        </main>
    );
}
