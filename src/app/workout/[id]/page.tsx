"use client";

import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BeatLoader } from 'react-spinners';
import ExerciseCard from '@/components/card/exerciseCard';
import { useGetExercisesFromWorkoutQuery } from '@/api/workout/queries';

export default function Page({ params }: { params: Promise<{ id: number }> }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);

    const { isSuccess, data, remove } = useGetExercisesFromWorkoutQuery(unwrappedParams.id);

    const handleGoBack = () => {
        router.push("/workout");
        remove();
    };

    return (
        <main className='h-full'>
            <header className={"flex items-center justify-between px-10 bg-zinc-800 h-16 shadow-lg"}>
                <div
                    onClick={handleGoBack}
                    className='cursor-pointer p-1 active:bg-neutral-600 active:rounded lg:active:bg-neutral-600 lg:hover:bg-neutral-700 lg:hover:rounded'>
                    <ArrowLeft size={32} />
                </div>
                <div
                    className='cursor-pointer p-1 active:bg-neutral-600 active:rounded lg:active:bg-neutral-600 lg:hover:bg-neutral-700 lg:hover:rounded'>
                    <User size={32} />
                </div>
            </header>
            <div
                className='flex flex-col gap-5 items-center mt-4 max-h-[calc(100%-6rem)] overflow-y-auto lg:gap-6'>
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
        </main>
    );
}
