"use client";

import React, { useState } from 'react';
import { ArrowLeft, User, CheckCircle, ChevronDown, ChevronUp, RotateCcw, AlertCircle, Ban, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BeatLoader } from 'react-spinners';
import { capitalizeAllWords } from '@/utils/stringUtils';
import { useGetExercisesFromWorkoutQuery } from '@/api/workout/queries';
import { useCreateWorkoutRecord, useGetLastWorkoutRecord } from '@/api/workout-record/queries';
import { WorkoutRecord } from '@/api/interfaces/workout';
import ActionButton from '@/components/button/actionButton';
import WorkoutComparisonSummary from '@/components/card/workoutComparisonSummary';
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

    // Query to get the last workout record for comparison
    const { data: lastWorkoutRecord } = useGetLastWorkoutRecord(Number(workoutId));

    // Mutation for creating workout record
    const createWorkoutRecord = useCreateWorkoutRecord();

    // State to track exercise completion status and reps per set
    const [exerciseTracking, setExerciseTracking] = useState<ExerciseTrackingState>({});
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [pendingExercises, setPendingExercises] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New states for workout completion modals
    const [workoutCompleteModalOpen, setWorkoutCompleteModalOpen] = useState(false);
    const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
    const [newWorkoutRecord, setNewWorkoutRecord] = useState<any>(null);

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

    // Calculate progress percentage
    const progressPercentage = React.useMemo(() => {
        if (!isSuccess || !data?.workoutExercises || Object.keys(exerciseTracking).length === 0) {
            return 0;
        }

        const totalExercises = data.workoutExercises.length;
        const decidedExercises = data.workoutExercises.filter(workoutExercise => {
            const status = exerciseTracking[workoutExercise.id]?.status;
            return status === 'completed' || status === 'skipped';
        }).length;

        return Math.round((decidedExercises / totalExercises) * 100);
    }, [isSuccess, data, exerciseTracking]);

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

    const handleCancel = () => {
        setCancelModalOpen(true);
    };

    const confirmCancel = () => {
        router.push(`/treinos/${workoutId}`);
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
            setIsSubmitting(true);
            const payload = {
                workoutId: workoutId,
                exercises: data?.workoutExercises.map(workoutExercise => {
                    const exerciseTracked = exerciseTracking[workoutExercise.id];
                    const repsPerSet = exerciseTracked?.repsPerSet || [];

                    const hasAnyRepsData = repsPerSet.some(reps => reps !== null);

                    const sets = hasAnyRepsData
                        ? repsPerSet.map((reps, index) => ({
                            set: index + 1,
                            reps: reps === null ? 0 : reps,
                            exerciseLoad: workoutExercise.exerciseLoad
                        }))
                        : null;

                    return {
                        exerciseId: workoutExercise.exercise.id,
                        status: exerciseTracked.status.toUpperCase(),
                        exerciseSets: sets
                    };
                }) || []
            };

            // Mostrar logs de debug
            console.log('Payload do treino:', payload);
            console.log('Last workout record before mutation:', lastWorkoutRecord);

            createWorkoutRecord.mutate(payload, {
                onSuccess: (response) => {
                    // Mostrar detalhes do novo treino
                    console.log('Treino salvo com sucesso:', response);

                    // Agora a API já retorna o objeto completo, então podemos usar diretamente
                    const workoutRecordData = response.data;
                    console.log('Dados do novo treino:', workoutRecordData);

                    setNewWorkoutRecord(workoutRecordData);
                    setWorkoutCompleteModalOpen(true);
                    setIsSubmitting(false);
                },
                onError: (error) => {
                    console.error('Erro ao salvar treino:', error);
                    router.push("/treinos");
                    setIsSubmitting(false);
                }
            });
        } else {
            setAlertModalOpen(true);
        }
    };

    // Handle workout summary view
    const handleViewSummary = () => {
        setWorkoutCompleteModalOpen(false);
        setShowWorkoutSummary(true);
    };

    // Return to workouts list
    const returnToWorkouts = () => {
        router.push("/treinos");
    };

    return (
        <main className='h-full bg-[#161619] flex flex-col overflow-hidden ios-scroll-fix'>
            {/* Header com gradiente e efeito de blur */}
            <header className="z-20 backdrop-blur-lg bg-gradient-to-b from-[#18181b] to-[#18181b]/95 border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                            onClick={handleCancel}
                            className="p-1 rounded hover:bg-zinc-700/40 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors mr-2"
                            aria-label="Voltar"
                        >
                            <ArrowLeft size={18} className="text-zinc-400 hover:text-red-500" />
                        </button>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-zinc-400">Treino atual</span>
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
            <div className="flex-1 overflow-y-auto pb-32 ios-scroll-fix bg-[#161619]">
                {/* Lista de exercícios */}
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 bg-[#161619]">
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
                                            className={`relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 ${tracking.status === 'completed' ? 'ring-1 ring-green-500/50' :
                                                tracking.status === 'skipped' ? 'ring-1 ring-orange-500/50' : ''
                                                }`}
                                        >
                                            {/* Exercise Header */}
                                            <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-medium text-white truncate">
                                                        {capitalizeAllWords(workoutExercise.exercise.name)}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className={`${bodyPartColor} px-2 py-0.5 rounded-full text-xs font-medium`}>
                                                            {workoutExercise.exercise.bodyPart}
                                                        </div>
                                                        <div className="text-xs text-zinc-400">
                                                            {workoutExercise.sets}x{workoutExercise.reps} • {workoutExercise.exerciseLoad}kg
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Exercise Content */}
                                            <div className="p-4">
                                                {!isDecided ? (
                                                    <div className="space-y-4">
                                                        {/* Header com informações e botões de ação */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => toggleRepsInput(exerciseId)}
                                                                    className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                                >
                                                                    {tracking.showRepsInput ? (
                                                                        <>
                                                                            <ChevronUp size={16} />
                                                                            <span>Ocultar reps</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ChevronDown size={16} />
                                                                            <span>Registrar reps</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleExerciseStatus(exerciseId, 'skipped')}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-orange-400 hover:bg-orange-500/10 transition-colors"
                                                                >
                                                                    <Ban size={16} />
                                                                    <span className="text-sm">Pular</span>
                                                                </button>

                                                                <button
                                                                    onClick={() => handleExerciseStatus(exerciseId, 'completed')}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    <span className="text-sm">Concluir</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Reps Input Grid */}
                                                        {tracking.showRepsInput && (
                                                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-700/50">
                                                                {tracking.repsPerSet.map((reps, index) => (
                                                                    <div key={index} className="space-y-1">
                                                                        <label className="text-xs text-zinc-400">
                                                                            Série {index + 1}
                                                                        </label>
                                                                        <div className="flex items-center">
                                                                            <button
                                                                                className="flex items-center justify-center h-9 w-9 bg-zinc-700 border border-zinc-600 rounded-l-lg hover:bg-zinc-600 transition-colors"
                                                                                onClick={() => {
                                                                                    const currentValue = reps || 0;
                                                                                    if (currentValue > 0) {
                                                                                        updateRepsForSet(exerciseId, index, currentValue - 1);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                                                                                    <path d="M5 12h14"></path>
                                                                                </svg>
                                                                            </button>

                                                                            <input
                                                                                type="number"
                                                                                inputMode="numeric"
                                                                                placeholder={`${workoutExercise.reps || 0}`}
                                                                                value={reps === null ? '' : reps}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value ? Number(e.target.value) : null;
                                                                                    updateRepsForSet(exerciseId, index, value);
                                                                                }}
                                                                                className="w-full h-9 text-center border-y border-zinc-600 bg-zinc-700 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                                                            />

                                                                            <button
                                                                                className="flex items-center justify-center h-9 w-9 bg-zinc-700 border border-zinc-600 rounded-r-lg hover:bg-zinc-600 transition-colors"
                                                                                onClick={() => {
                                                                                    const currentValue = reps || 0;
                                                                                    updateRepsForSet(exerciseId, index, currentValue + 1);
                                                                                }}
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                                                                                    <path d="M12 5v14M5 12h14"></path>
                                                                                </svg>
                                                                            </button>
                                                                        </div>

                                                                        {/* Progress bar */}
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full transition-all duration-300 ${reps === null ? 'bg-zinc-600' :
                                                                                        reps >= (workoutExercise.reps || 0) ? 'bg-green-500' :
                                                                                            reps >= (workoutExercise.reps || 0) * 0.7 ? 'bg-blue-500' :
                                                                                                'bg-amber-500'
                                                                                        }`}
                                                                                    style={{ width: `${reps ? Math.min(100, (reps / (workoutExercise.reps || 1)) * 100) : 0}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs text-zinc-400">
                                                                                {reps || 0}/{workoutExercise.reps || 0}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className={`p-4 rounded-lg ${tracking.status === 'completed' ? 'bg-green-500/10' : 'bg-orange-500/10'
                                                        }`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                {tracking.status === 'completed' ? (
                                                                    <CheckCircle size={18} className="text-green-500" />
                                                                ) : (
                                                                    <Ban size={18} className="text-orange-500" />
                                                                )}
                                                                <span className={`text-sm font-medium ${tracking.status === 'completed' ? 'text-green-500' : 'text-orange-500'
                                                                    }`}>
                                                                    {tracking.status === 'completed' ? 'Exercício concluído' : 'Exercício pulado'}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => resetExerciseStatus(exerciseId)}
                                                                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors"
                                                            >
                                                                <RotateCcw size={16} />
                                                                <span className="text-sm">Desfazer</span>
                                                            </button>
                                                        </div>

                                                        {/* Reps Summary */}
                                                        {tracking.status === 'completed' && tracking.repsPerSet.some(reps => reps && reps > 0) && (
                                                            <div className="mt-4 space-y-3">
                                                                <div className="flex items-center justify-between text-xs text-zinc-400">
                                                                    <span>Repetições por série</span>
                                                                    <span>Meta: {workoutExercise.reps} reps</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {tracking.repsPerSet.map((reps, index) => {
                                                                        const targetReps = workoutExercise.reps || 1;
                                                                        const percent = reps ? Math.min(100, (reps / targetReps) * 100) : 0;
                                                                        const barColor = percent >= 100 ? 'bg-green-500' : percent >= 75 ? 'bg-blue-500' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500';

                                                                        return (
                                                                            <div key={index} className="space-y-1">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-zinc-300">Série {index + 1}</span>
                                                                                    <span className="text-xs font-medium">{reps || 0} reps</span>
                                                                                </div>
                                                                                <div className="h-1.5 w-full bg-zinc-700 rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className={`h-full ${barColor} transition-all duration-500`}
                                                                                        style={{ width: `${percent}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <BeatLoader size={26} color="#ef4444" />
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#18181b]/95 backdrop-blur-lg border-t border-zinc-800 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-zinc-400">Progresso do treino</span>
                        <span className="text-sm font-medium text-zinc-300">{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                        <div
                            className="bg-red-500 h-full transition-all duration-300 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    {/* Finish Button - Only shows at 100% */}
                    {progressPercentage === 100 && (
                        <button
                            onClick={finishWorkout}
                            disabled={isSubmitting}
                            className={`w-full mt-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isSubmitting ? 'opacity-70' : ''}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <BeatLoader size={8} color="#ffffff" />
                                    <span className="font-medium">Salvando...</span>
                                </span>
                            ) : (
                                <span className="font-medium">Concluir treino</span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Alert Modal for incomplete exercises */}
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

            {/* Cancel Confirmation Modal */}
            <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                <DialogContent
                    className="w-[95%] rounded-lg sm:max-w-[425px] bg-zinc-900 border-0 shadow-lg"
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader className="flex flex-col items-center">
                        <div className="flex justify-center items-center rounded-full bg-red-500/10 w-16 h-16 mb-4">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <DialogTitle className="text-xl font-bold mb-4">Cancelar treino?</DialogTitle>
                        <div className="text-center text-zinc-300 mb-2">
                            Se cancelar o treino, todo o progresso será perdido e nenhum histórico será registrado.
                        </div>
                    </DialogHeader>

                    <div className="flex justify-between gap-4 pb-2 px-4 mt-6">
                        <button
                            onClick={() => setCancelModalOpen(false)}
                            className="flex-1 bg-zinc-700 py-2.5 rounded-lg font-medium hover:bg-zinc-600 transition-colors duration-300"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={confirmCancel}
                            className="flex-1 bg-red-600 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
                        >
                            Cancelar treino
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Workout Complete Modal */}
            <Dialog open={workoutCompleteModalOpen} onOpenChange={setWorkoutCompleteModalOpen}>
                <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                <DialogContent
                    className="w-[95%] rounded-lg sm:max-w-[425px] bg-zinc-900 border-0 shadow-lg"
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader className="flex flex-col items-center">
                        <div className="flex justify-center items-center rounded-full bg-green-500/10 w-16 h-16 mb-4">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <DialogTitle className="text-xl font-bold mb-4">Treino salvo com sucesso!</DialogTitle>

                        {lastWorkoutRecord ? (
                            <div className="text-center text-zinc-300 mb-2">
                                <p>Seu treino foi registrado. Você pode ver um resumo comparativo com seu último treino ou voltar à lista de treinos.</p>
                            </div>
                        ) : (
                            <div className="text-center text-zinc-300 mb-2">
                                <p>Parabéns pelo seu primeiro treino! Continue acompanhando seu progresso.</p>
                            </div>
                        )}
                    </DialogHeader>

                    <div className="flex flex-col gap-3 pb-2 px-4 mt-6">
                        <button
                            onClick={returnToWorkouts}
                            className="w-full bg-zinc-700 py-2.5 rounded-lg font-medium hover:bg-zinc-600 transition-colors duration-300"
                        >
                            Voltar aos treinos
                        </button>

                        {lastWorkoutRecord && (
                            <button
                                onClick={handleViewSummary}
                                className="w-full bg-red-600 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                <span>Ver resumo pós-treino</span>
                                <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Workout Summary Modal/Screen */}
            <Dialog open={showWorkoutSummary}
                onOpenChange={(open) => {
                    if (!open) router.push("/treinos");
                    setShowWorkoutSummary(open);
                }}>
                <DialogOverlay className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
                <DialogContent
                    className="w-[95%] max-h-[90vh] overflow-y-auto rounded-lg sm:max-w-[600px] bg-zinc-900 border-0 shadow-lg"
                >
                    <DialogHeader className="px-4 pt-6 pb-2">
                        <DialogTitle className="text-xl font-bold mb-2">Resumo Comparativo</DialogTitle>
                        <p className="text-zinc-400 text-sm">
                            Comparação entre o treino atual e o anterior realizado em {' '}
                            {new Date(lastWorkoutRecord?.date || '').toLocaleDateString('pt-BR')}
                        </p>
                    </DialogHeader>

                    <div className="px-4 py-4 overflow-y-auto">
                        {renderWorkoutSummary(lastWorkoutRecord, newWorkoutRecord)}
                    </div>

                    <div className="px-4 py-4 border-t border-zinc-800">
                        <button
                            onClick={returnToWorkouts}
                            className="w-full bg-red-600 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
                        >
                            Fechar e voltar aos treinos
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}

// Função para renderizar o resumo do treino com manipulação de diferentes cenários
const renderWorkoutSummary = (lastWorkout: WorkoutRecord | null | undefined, currentWorkout: any) => {
    // Caso não exista um treino anterior registrado
    if (!lastWorkout) {
        return (
            <div className="bg-zinc-800/50 rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="mb-4 p-4 rounded-full bg-green-500/10">
                    <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Primeiro treino registrado!</h3>
                <p className="text-zinc-400 text-sm text-center">
                    Este é seu primeiro registro deste treino. Nas próximas vezes,
                    você verá uma comparação com os treinos anteriores.
                </p>
            </div>
        );
    }

    // Caso o treino atual não tenha sido gerado corretamente
    if (!currentWorkout || typeof currentWorkout === 'string' || currentWorkout === '') {
        return (
            <div className="bg-zinc-800/50 rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="mb-4 p-4 rounded-full bg-zinc-700/50">
                    <AlertCircle size={32} className="text-amber-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Dados insuficientes</h3>
                <p className="text-zinc-400 text-sm text-center">
                    Não foi possível carregar os dados completos do treino atual para comparação.
                </p>
            </div>
        );
    }

    // Usar o componente separado para comparação
    return <WorkoutComparisonSummary lastWorkout={lastWorkout} currentWorkout={currentWorkout} />;
}; 