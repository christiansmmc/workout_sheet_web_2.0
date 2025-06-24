"use client";

import { useGetLastWorkoutRecord } from '@/api/workout-record/queries';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from '@/components/ui/dialog';
import { capitalizeAllWords } from '@/utils/stringUtils';
import { Ban, CheckCircle, History } from 'lucide-react';
import { BeatLoader } from 'react-spinners';

// Map of body part names to background colors
const bodyPartColors: Record<string, string> = {
    PEITO: 'bg-teal-500',
    TRICEPS: 'bg-blue-500',
    OMBRO: 'bg-emerald-500',
    PERNA: 'bg-amber-500',
    COSTAS: 'bg-pink-500',
    BICEPS: 'bg-violet-500',
};

interface WorkoutHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    workoutId: string | null;
}

export default function WorkoutHistoryModal({ 
    isOpen, 
    onClose, 
    workoutId
}: WorkoutHistoryModalProps) {
    // Fazer o request apenas quando o modal estiver aberto e tiver ID
    const { data: lastWorkoutRecord, isLoading } = useGetLastWorkoutRecord(
        isOpen && workoutId ? Number(workoutId) : 0
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
            <DialogContent
                className="w-[95%] max-h-[90vh] rounded-lg sm:max-w-[600px] bg-zinc-900 border-0 shadow-lg flex flex-col p-2"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="px-4 pt-6 pb-2 flex-shrink-0">
                    <DialogTitle className="text-xl font-bold mb-2">Histórico do Último Treino</DialogTitle>
                    {(isLoading || lastWorkoutRecord) && (
                        <p className="text-zinc-400 text-sm">
                            {isLoading ? (
                                'Carregando informações...'
                            ) : lastWorkoutRecord ? (
                                `Realizado em ${new Date(lastWorkoutRecord.date).toLocaleDateString('pt-BR')}`
                            ) : null}
                        </p>
                    )}
                </DialogHeader>

                <div className="px-3 py-4 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <div className="flex flex-col items-center gap-4">
                                <BeatLoader size={26} color="#ef4444" />
                                <p className="text-zinc-400 text-sm">Carregando histórico...</p>
                            </div>
                        </div>
                    ) : lastWorkoutRecord ? (
                        <div className="space-y-4">
                            {/* Lista de exercícios */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-zinc-300">Exercícios Realizados</h3>
                                <div className="space-y-3">
                                    {lastWorkoutRecord.workoutRecordExercises
                                        ?.sort((a, b) => {
                                            const bodyPartComparison = a.exercise.bodyPart.localeCompare(b.exercise.bodyPart);
                                            return bodyPartComparison === 0
                                                ? a.exercise.name.localeCompare(b.exercise.name)
                                                : bodyPartComparison;
                                        })
                                        ?.map((recordExercise, index) => {
                                            const bodyPartColor = bodyPartColors[recordExercise.exercise.bodyPart] || 'bg-zinc-600';
                                            const isCompleted = recordExercise.status === 'COMPLETED';
                                            const isSkipped = recordExercise.status === 'SKIPPED';

                                            return (
                                                <div 
                                                    key={index} 
                                                    className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50"
                                                >
                                                    {/* Exercise Header */}
                                                    <div className="p-4 border-b border-zinc-700/50">
                                                        <h4 className="text-base font-medium text-white mb-2">
                                                            {capitalizeAllWords(recordExercise.exercise.name)}
                                                        </h4>
                                                        <div className="flex items-center justify-between">
                                                            <div className={`${bodyPartColor} px-2 py-0.5 rounded-full text-xs font-medium`}>
                                                                {recordExercise.exercise.bodyPart}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isCompleted ? (
                                                                    <div className="flex items-center gap-1.5 text-green-400">
                                                                        <CheckCircle size={16} />
                                                                        <span className="text-sm font-medium">Concluído</span>
                                                                    </div>
                                                                ) : isSkipped ? (
                                                                    <div className="flex items-center gap-1.5 text-orange-400">
                                                                        <Ban size={16} />
                                                                        <span className="text-sm font-medium">Pulado</span>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Exercise Content */}
                                                    <div className="p-4">
                                                        {/* Mostrar repetições se o exercício foi completado */}
                                                        {isCompleted && recordExercise.workoutRecordExerciseSets && recordExercise.workoutRecordExerciseSets.length > 0 ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                                                                    <span className="text-sm font-medium text-zinc-400">Repetições por série</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {recordExercise.workoutRecordExerciseSets.map((set: any, index: number) => (
                                                                        <div key={index} className="flex items-center justify-center min-w-[36px] h-8 px-2 text-sm font-medium bg-zinc-700/60 border border-zinc-600/50 rounded-md">
                                                                            {set.reps || 0}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : isSkipped ? (
                                                            <div className="p-4 rounded-lg bg-orange-500/10">
                                                                <p className="text-sm text-orange-400">Este exercício foi pulado no treino anterior</p>
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 rounded-lg bg-zinc-800/30">
                                                                <p className="text-sm text-zinc-400">Exercício registrado sem detalhes de repetições</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-800/50 rounded-lg p-6 flex flex-col items-center justify-center">
                            <div className="mb-4 p-4 rounded-full bg-zinc-700/50">
                                <History size={32} className="text-zinc-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Nenhum histórico encontrado</h3>
                            <p className="text-zinc-400 text-sm text-center">
                                Complete seu primeiro treino para ver o histórico aqui.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-3 py-4 border-t border-zinc-800 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full bg-red-600 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
                    >
                        Fechar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 