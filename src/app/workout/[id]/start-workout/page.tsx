"use client";

import React, { useState } from 'react';
import { ArrowLeft, User, CheckCircle, ChevronDown, ChevronUp, RotateCcw, AlertCircle, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BeatLoader } from 'react-spinners';
import { capitalizeAllWords } from '@/utils/stringUtils';
import { useGetExercisesFromWorkoutQuery } from '@/api/workout/queries';
import ActionButton from '@/components/button/actionButton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from '@/components/ui/dialog';

// Map of body part names to background colors
const bodyPartColors: Record<string, string> = {
    PEITO: 'bg-teal-500',
    TRICEPS: 'bg-blue-500',
    OMBRO: 'bg-emerald-500',
    PERNA: 'bg-amber-500',
    COSTAS: 'bg-pink-500',
    BICEPS: 'bg-violet-500',
};

// Define exercise status types
type ExerciseStatus = 'pending' | 'completed' | 'skipped';

// Interface for tracking exercise completion status
interface ExerciseTrackingState {
    [exerciseId: string]: {
        status: ExerciseStatus;
        repsPerSet: (number | null)[];
        showRepsInput: boolean;
    };
}

export default function StartWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);
    const workoutId = unwrappedParams.id;

    // Fetch workout exercises data
    const { isSuccess, data } = useGetExercisesFromWorkoutQuery(workoutId);

    // State to track exercise completion status and reps per set
    const [exerciseTracking, setExerciseTracking] = useState<ExerciseTrackingState>({});
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [pendingExercises, setPendingExercises] = useState<string[]>([]);

    // Initialize tracking state when data is loaded
    React.useEffect(() => {
        if (isSuccess && data?.workoutExercises) {
            const initialState: ExerciseTrackingState = {};
            data.workoutExercises.forEach(workoutExercise => {
                initialState[workoutExercise.id] = {
                    status: 'pending',
                    repsPerSet: Array(workoutExercise.sets).fill(null),
                    showRepsInput: false
                };
            });
            setExerciseTracking(initialState);
        }
    }, [isSuccess, data]);

    // Check if all exercises are completed or skipped
    const areAllExercisesDecided = React.useMemo(() => {
        if (!isSuccess || !data?.workoutExercises || Object.keys(exerciseTracking).length === 0) {
            return false;
        }

        const pending: string[] = [];

        const allDecided = data.workoutExercises.every(workoutExercise => {
            const status = exerciseTracking[workoutExercise.id]?.status;
            const isDecided = status === 'completed' || status === 'skipped';

            if (!isDecided) {
                pending.push(capitalizeAllWords(workoutExercise.exercise.name));
            }

            return isDecided;
        });

        setPendingExercises(pending);
        return allDecided;
    }, [isSuccess, data, exerciseTracking]);

    const handleGoBack = () => {
        router.push(`/workout/${workoutId}`);
    };

    const handleExerciseStatus = (exerciseId: string, status: ExerciseStatus) => {
        setExerciseTracking(prev => {
            // If the exercise already has this status, do nothing
            if (prev[exerciseId].status === status) return prev;

            // Close reps input if setting to completed or skipped
            return {
                ...prev,
                [exerciseId]: {
                    ...prev[exerciseId],
                    status: status,
                    showRepsInput: status === 'pending' ? prev[exerciseId].showRepsInput : false
                }
            };
        });
    };

    const toggleRepsInput = (exerciseId: string) => {
        setExerciseTracking(prev => ({
            ...prev,
            [exerciseId]: {
                ...prev[exerciseId],
                showRepsInput: !prev[exerciseId].showRepsInput
            }
        }));
    };

    const updateRepsForSet = (exerciseId: string, setIndex: number, reps: number | null) => {
        setExerciseTracking(prev => {
            const updatedRepsPerSet = [...prev[exerciseId].repsPerSet];
            updatedRepsPerSet[setIndex] = reps;

            return {
                ...prev,
                [exerciseId]: {
                    ...prev[exerciseId],
                    repsPerSet: updatedRepsPerSet
                }
            };
        });
    };

    const resetExerciseStatus = (exerciseId: string) => {
        setExerciseTracking(prev => ({
            ...prev,
            [exerciseId]: {
                ...prev[exerciseId],
                status: 'pending'
            }
        }));
    };

    const finishWorkout = () => {
        if (areAllExercisesDecided) {
            // Prepare API payload
            const payload = {
                workoutId: workoutId,
                exercises: data?.workoutExercises.map(workoutExercise => {
                    const exerciseTracked = exerciseTracking[workoutExercise.id];

                    // Determine if any reps data was entered
                    const hasAnyRepsData = exerciseTracked.repsPerSet.some(reps => reps !== null);

                    // Format sets data
                    const sets = workoutExercise.sets ? Array.from({ length: workoutExercise.sets }).map((_, index) => {
                        // If no reps data at all was entered, set all to null
                        // If some reps data was entered but this set is null, set to 0
                        // Otherwise use the entered value
                        const repsValue = !hasAnyRepsData ? null :
                            (exerciseTracked.repsPerSet[index] === null ? 0 : exerciseTracked.repsPerSet[index]);

                        return {
                            set: index + 1,
                            reps: repsValue
                        };
                    }) : [];

                    return {
                        id: workoutExercise.exercise.id,
                        status: exerciseTracked.status.toUpperCase(),
                        sets: sets
                    };
                }) || []
            };

            // Here you would send the data to the API
            console.log("Workout completed, payload:", payload);

            // Navigate back to workouts page
            router.push("/workout");
        } else {
            setAlertModalOpen(true);
        }
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
                className='flex flex-col items-center mt-4 max-h-[calc(100%-10rem)] overflow-y-auto lg:gap-4'>
                {isSuccess && data ? (
                    <>
                        {data?.workoutExercises
                            .sort((a, b) => {
                                const bodyPartComparison = a.exercise.bodyPart.localeCompare(b.exercise.bodyPart);
                                return bodyPartComparison === 0
                                    ? a.exercise.name.localeCompare(b.exercise.name)
                                    : bodyPartComparison;
                            })
                            .map((workoutExercise) => {
                                const exerciseId = workoutExercise.id;
                                const tracking = exerciseTracking[exerciseId];
                                const bodyPartColor = bodyPartColors[workoutExercise.exercise.bodyPart] || 'bg-zinc-600';

                                if (!tracking) return null;

                                const isDecided = tracking.status === 'completed' || tracking.status === 'skipped';

                                return (
                                    <div
                                        key={exerciseId}
                                        className={`flex flex-col flex-shrink-0 ${isDecided ? 'bg-zinc-800/70' : 'bg-zinc-800'} rounded-lg w-[95%] max-w-2xl mx-auto mb-4 shadow-lg transition-all duration-300 ${tracking.status === 'completed' ? 'border-l-4 border-green-500' :
                                            tracking.status === 'skipped' ? 'border-l-4 border-orange-500' : ''
                                            }`}
                                    >
                                        {/* Exercise Header */}
                                        <div className="flex justify-between items-center h-12 mt-2 pb-2 border-b border-zinc-600">
                                            <div className="ml-3 lg:ml-5 font-medium text-sm md:text-base lg:text-lg">
                                                <p>{capitalizeAllWords(workoutExercise.exercise.name)}</p>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-5 mr-2 md:mr-5">
                                                <div
                                                    className={`${bodyPartColor} flex justify-center items-center h-7 w-16 md:h-8 md:w-20 lg:w-24 rounded-lg text-xs md:text-sm font-medium`}
                                                >
                                                    {workoutExercise.exercise.bodyPart}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Exercise Details */}
                                        <div className="flex justify-between items-center py-3 px-4 border-b border-zinc-700">
                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-zinc-400 mr-2">Séries x Repetições:</span>
                                                        <span className="font-medium">{workoutExercise.sets || 0}x{workoutExercise.reps || 0}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-zinc-400 mr-2">Carga:</span>
                                                        <span className="font-medium">{workoutExercise.exerciseLoad || 0} kg</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Exercise Status Indicator */}
                                        {isDecided && (
                                            <div className={`flex items-center justify-between px-4 py-2 ${tracking.status === 'completed' ? 'bg-green-500/10' : 'bg-orange-500/10'
                                                }`}>
                                                <span className={`text-sm font-medium ${tracking.status === 'completed' ? 'text-green-500' : 'text-orange-500'
                                                    }`}>
                                                    {tracking.status === 'completed' ? 'Exercício concluído' : 'Exercício pulado'}
                                                </span>
                                                <button
                                                    onClick={() => resetExerciseStatus(exerciseId)}
                                                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors duration-200"
                                                    title="Desfazer decisão"
                                                >
                                                    <RotateCcw size={16} />
                                                    <span className="text-sm">Desfazer</span>
                                                </button>
                                            </div>
                                        )}

                                        {/* Exercise Controls */}
                                        <div className="flex justify-between items-center px-4 py-3">
                                            <div className="flex items-center">
                                                {!isDecided && (
                                                    <button
                                                        onClick={() => toggleRepsInput(exerciseId)}
                                                        className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors duration-200"
                                                    >
                                                        {tracking.showRepsInput ? (
                                                            <>
                                                                <ChevronUp size={18} />
                                                                <span>Ocultar reps</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown size={18} />
                                                                <span>Registrar reps</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {!isDecided && (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleExerciseStatus(exerciseId, 'skipped')}
                                                        className="p-1.5 rounded-full text-orange-500 hover:bg-orange-500/10 transition-colors duration-200"
                                                        title="Pular exercício"
                                                    >
                                                        <Ban size={24} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleExerciseStatus(exerciseId, 'completed')}
                                                        className="p-1.5 rounded-full text-green-500 hover:bg-green-500/10 transition-colors duration-200"
                                                        title="Completar exercício"
                                                    >
                                                        <CheckCircle size={24} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Repetitions Input - Only show if not decided and showRepsInput is true */}
                                        {!isDecided && tracking.showRepsInput && (
                                            <div className="px-4 pb-4 pt-2 border-t border-zinc-700">
                                                <p className="text-sm text-zinc-400 mb-3">Repetições realizadas por série:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {tracking.repsPerSet.map((reps, index) => (
                                                        <div key={index} className="flex items-center">
                                                            <span className="text-sm text-zinc-400 mr-2">Série {index + 1}:</span>
                                                            <input
                                                                type="number"
                                                                placeholder={`${workoutExercise.reps || 0}`}
                                                                value={reps === null ? '' : reps}
                                                                onChange={(e) => {
                                                                    const value = e.target.value ? Number(e.target.value) : null;
                                                                    updateRepsForSet(exerciseId, index, value);
                                                                }}
                                                                className="w-16 h-9 text-center bg-zinc-900 rounded-lg placeholder:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BeatLoader size={26} color="#dc2626" />
                    </div>
                )}
            </div>

            {/* Finish Workout Button - Styled to match Iniciar Treino button */}
            {isSuccess && data && data.workoutExercises.length > 0 && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center">
                    <ActionButton
                        onClick={finishWorkout}
                        width="w-52"
                        height="h-10"
                        className={`flex items-center justify-center gap-2 ${!areAllExercisesDecided ? 'opacity-70' : ''}`}
                    >
                        Finalizar Treino
                    </ActionButton>
                </div>
            )}

            {/* Alert Modal */}
            <Dialog open={alertModalOpen} onOpenChange={setAlertModalOpen}>
                <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                <DialogContent
                    className="w-[95%] rounded-lg sm:max-w-[425px] bg-zinc-900 border-0 shadow-lg"
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader className="flex flex-col items-center">
                        <div className="flex justify-center items-center rounded-full bg-amber-500/10 w-16 h-16 mb-4">
                            <AlertCircle size={32} className="text-amber-500" />
                        </div>
                        <DialogTitle className="text-xl font-bold mb-4">Exercícios pendentes</DialogTitle>
                        <div className="text-center text-zinc-300 mb-2">
                            Você precisa marcar todos os exercícios como feitos ou pulados antes de finalizar o treino.
                        </div>
                    </DialogHeader>

                    <div className="mt-2 mb-6 max-h-48 overflow-y-auto">
                        <p className="text-amber-500 text-sm mb-2 pl-4">Exercícios pendentes:</p>
                        <ul className="list-disc pl-8 pr-4 text-zinc-300">
                            {pendingExercises.map((exercise, index) => (
                                <li key={index} className="mb-1">{exercise}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-center pb-2">
                        <button
                            onClick={() => setAlertModalOpen(false)}
                            className="bg-red-600 py-2.5 px-8 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
                        >
                            Entendi
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
} 