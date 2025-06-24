import React from 'react';
import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { capitalizeAllWords } from '@/utils/stringUtils';
import { WorkoutRecord } from '@/api/interfaces/workout';
import { formatNumberBR } from '@/utils/numberUtils';

// Interface para as props do componente
export interface WorkoutComparisonSummaryProps {
    lastWorkout: WorkoutRecord;
    currentWorkout: WorkoutRecord;
}

// Interface para os itens de comparação
interface ExerciseComparison {
    type: 'performance' | 'status' | 'load';
    exerciseName: string;
    bodyPart: string;
    lastReps?: number[];
    currentReps?: number[];
    lastLoad?: number;
    currentLoad?: number;
    lastStatus?: string;
    currentStatus?: string;
}

// Mapa de cores dos músculos
const BODY_PART_COLORS: Record<string, string> = {
    PEITO: 'bg-teal-500',
    TRICEPS: 'bg-blue-500',
    OMBRO: 'bg-emerald-500',
    PERNA: 'bg-amber-500',
    COSTAS: 'bg-pink-500',
    BICEPS: 'bg-violet-500',
};

// Configuração das seções
const SECTION_CONFIG = {
    performance: {
        title: 'Mudanças nas Repetições',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-500',
    },
    load: {
        title: 'Mudanças na Carga',
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-500',
    },
    status: {
        title: 'Mudanças de Status',
        borderColor: 'border-violet-500',
        textColor: 'text-violet-500',
    },
} as const;

// Função auxiliar para verificar se há repetições válidas
const hasValidReps = (reps: number[] | undefined): boolean => {
    return Boolean(reps?.length && reps.some(rep => rep > 0));
};

// Função auxiliar para verificar diferença significativa nas repetições
const hasSignificantRepChange = (lastReps: number[], currentReps: number[]): boolean => {
    return lastReps.some((reps, index) => {
        const currentRep = currentReps[index] || 0;
        return Math.abs(currentRep - reps) >= 3;
    });
};

export default function WorkoutComparisonSummary({ lastWorkout, currentWorkout }: WorkoutComparisonSummaryProps) {
    // Função para processar comparações de exercícios
    const processExerciseComparisons = React.useCallback(() => {
        if (!lastWorkout?.workoutRecordExercises || !currentWorkout?.workoutRecordExercises) {
            return [];
        }

        const comparisons: ExerciseComparison[] = [];
        
        // Criar mapas para facilitar a comparação
        const lastExercisesMap = new Map(
            lastWorkout.workoutRecordExercises.map(ex => [ex.exercise.id, ex])
        );
        
        const currentExercisesMap = new Map(
            currentWorkout.workoutRecordExercises.map(ex => [ex.exercise.id, ex])
        );

        // Comparar apenas exercícios que existem em ambos os treinos
        Array.from(currentExercisesMap.keys()).forEach(exerciseId => {
            const currentEx = currentExercisesMap.get(exerciseId);
            const lastEx = lastExercisesMap.get(exerciseId);
            
            if (!lastEx || !currentEx) return;

            const baseComparison = {
                exerciseName: currentEx.exercise.name,
                bodyPart: currentEx.exercise.bodyPart,
            };

            // Verificar mudança de status
            if (lastEx.status !== currentEx.status) {
                comparisons.push({
                    ...baseComparison,
                    type: 'status',
                    lastStatus: lastEx.status,
                    currentStatus: currentEx.status,
                });
            }

            // Comparar apenas exercícios completados
            if (lastEx.status === 'COMPLETED' && currentEx.status === 'COMPLETED') {
                const lastSets = lastEx.workoutRecordExerciseSets || [];
                const currentSets = currentEx.workoutRecordExerciseSets || [];
                
                const lastReps = lastSets.map((set: any) => set.reps || 0);
                const currentReps = currentSets.map((set: any) => set.reps || 0);
                
                // Verificar mudanças nas repetições
                if (hasValidReps(lastReps) && hasValidReps(currentReps) && 
                    hasSignificantRepChange(lastReps, currentReps)) {
                    comparisons.push({
                        ...baseComparison,
                        type: 'performance',
                        lastReps,
                        currentReps,
                    });
                }

                // Verificar mudanças na carga
                const lastLoad = lastSets[0]?.exerciseLoad || 0;
                const currentLoad = currentSets[0]?.exerciseLoad || 0;
                
                if (lastLoad > 0 && currentLoad > 0 && lastLoad !== currentLoad) {
                    comparisons.push({
                        ...baseComparison,
                        type: 'load',
                        lastLoad,
                        currentLoad,
                    });
                }
            }
        });

        return comparisons;
    }, [lastWorkout, currentWorkout]);

    const exerciseComparisons = React.useMemo(processExerciseComparisons, [processExerciseComparisons]);

    // Agrupar comparações por tipo
    const groupedComparisons = React.useMemo(() => {
        const grouped = {
            performance: exerciseComparisons.filter(c => c.type === 'performance'),
            status: exerciseComparisons.filter(c => c.type === 'status'),
            load: exerciseComparisons.filter(c => c.type === 'load'),
        };

        const totalChanges = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
        
        return { ...grouped, totalChanges };
    }, [exerciseComparisons]);

    // Componentes internos
    const SectionHeader = React.useCallback(({ title, color, count }: { title: string, color: string, count: number }) => (
        <h3 className={`font-medium ${color} flex items-center gap-2 mb-3`}>
            <span>{title}</span>
            <span className={`bg-${color.replace('text-', '')}/20 ${color} text-xs py-1 px-2 rounded-full`}>
                {count}
            </span>
        </h3>
    ), []);

    const ExerciseHeader = React.useCallback(({ name, bodyPart }: { name: string, bodyPart: string }) => (
        <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{capitalizeAllWords(name)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${BODY_PART_COLORS[bodyPart] || 'bg-zinc-600'} text-zinc-100`}>
                {bodyPart}
            </span>
        </div>
    ), []);

    const RepetitionsSection = React.useCallback(({ items }: { items: ExerciseComparison[] }) => (
        <div className="space-y-3">
            {items.map((ex, idx) => {
                // Calcular total de repetições
                const lastTotal = ex.lastReps?.reduce((sum, reps) => sum + reps, 0) || 0;
                const currentTotal = ex.currentReps?.reduce((sum, reps) => sum + reps, 0) || 0;
                const repsDiff = currentTotal - lastTotal;
                const isIncrease = repsDiff > 0;
                
                return (
                    <div key={`perf-${idx}`} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50">
                        <ExerciseHeader name={ex.exerciseName} bodyPart={ex.bodyPart} />
                        
                        <div className="mt-3 space-y-3">
                            {/* Treino anterior */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-zinc-400">Treino anterior</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ex.lastReps?.map((reps, i) => (
                                        <div key={i} className="flex items-center justify-center min-w-[36px] h-8 px-2 text-sm font-medium bg-zinc-700/60 border border-zinc-600/50 rounded-md">
                                            {reps}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Treino atual */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-blue-400">Treino atual</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ex.currentReps?.map((reps, i) => (
                                        <div key={i} className="flex items-center justify-center min-w-[36px] h-8 px-2 text-sm font-medium bg-blue-500/20 border border-blue-500/30 rounded-md text-blue-100">
                                            {reps}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Comparação total */}
                            <div className="bg-zinc-700/30 rounded-lg p-3 mt-3">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="text-center flex-1">
                                        <div className="text-xs text-zinc-400 mb-1">Total anterior</div>
                                        <div className="text-lg font-semibold text-zinc-300">
                                            {lastTotal}
                                            <span className="text-sm text-zinc-500 ml-1">reps</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center flex-1">
                                        <div className="text-xs text-zinc-400 mb-1">Total atual</div>
                                        <div className="text-lg font-semibold text-white">
                                            {currentTotal}
                                            <span className="text-sm text-zinc-400 ml-1">reps</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-center">
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isIncrease 
                                        ? 'bg-green-500/20 border border-green-500/30' 
                                        : 'bg-red-500/20 border border-red-500/30'}`}>
                                        {isIncrease ? (
                                            <TrendingUp size={16} className="text-green-400" />
                                        ) : (
                                            <TrendingDown size={16} className="text-red-400" />
                                        )}
                                        <span className={`text-sm font-semibold ${isIncrease ? 'text-green-300' : 'text-red-300'}`}>
                                            {isIncrease ? '+' : ''}
                                            {repsDiff} reps
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    ), [ExerciseHeader]);

    const LoadSection = React.useCallback(({ items }: { items: ExerciseComparison[] }) => (
        <div className="space-y-3">
            {items.map((ex, idx) => (
                <div key={`load-${idx}`} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50">
                    <ExerciseHeader name={ex.exerciseName} bodyPart={ex.bodyPart} />
                    
                    <div className="mt-3 bg-zinc-700/30 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-center flex-1">
                                <div className="text-xs text-zinc-400 mb-1">Anterior</div>
                                <div className="text-lg font-semibold text-zinc-300">
                                    {formatNumberBR(ex.lastLoad || 0)}
                                    <span className="text-sm text-zinc-500 ml-1">kg</span>
                                </div>
                            </div>
                            
                            <div className="text-center flex-1">
                                <div className="text-xs text-zinc-400 mb-1">Atual</div>
                                <div className="text-lg font-semibold text-white">
                                    {formatNumberBR(ex.currentLoad || 0)}
                                    <span className="text-sm text-zinc-400 ml-1">kg</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${(ex.currentLoad || 0) > (ex.lastLoad || 0) 
                                ? 'bg-green-500/20 border border-green-500/30' 
                                : 'bg-red-500/20 border border-red-500/30'}`}>
                                {(ex.currentLoad || 0) > (ex.lastLoad || 0) ? (
                                    <TrendingUp size={16} className="text-green-400" />
                                ) : (
                                    <TrendingDown size={16} className="text-red-400" />
                                )}
                                <span className={`text-sm font-semibold ${(ex.currentLoad || 0) > (ex.lastLoad || 0) ? 'text-green-300' : 'text-red-300'}`}>
                                    {(ex.currentLoad || 0) > (ex.lastLoad || 0) ? '+' : ''}
                                    {formatNumberBR((ex.currentLoad || 0) - (ex.lastLoad || 0))}kg
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    ), [ExerciseHeader]);

    const StatusSection = React.useCallback(({ items }: { items: ExerciseComparison[] }) => (
        <div className="space-y-3">
            {items.map((ex, idx) => (
                <div key={`status-${idx}`} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50">
                    <ExerciseHeader name={ex.exerciseName} bodyPart={ex.bodyPart} />
                    
                    <div className="mt-3 space-y-3">
                        <div className={`flex items-center gap-3 p-2.5 rounded-lg ${ex.lastStatus === 'COMPLETED' ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                            <div className={`w-3 h-3 rounded-full ${ex.lastStatus === 'COMPLETED' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                            <div className="flex-1">
                                <div className="text-xs text-zinc-400 mb-1">Treino anterior</div>
                                <span className={`text-sm font-medium ${ex.lastStatus === 'COMPLETED' ? 'text-green-400' : 'text-amber-400'}`}>
                                    {ex.lastStatus === 'COMPLETED' ? 'Completado' : 'Pulado'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                                <path d="M12 5v14M5 12l7 7 7-7" />
                            </svg>
                        </div>
                        
                        <div className={`flex items-center gap-3 p-2.5 rounded-lg ${ex.currentStatus === 'COMPLETED' ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                            <div className={`w-3 h-3 rounded-full ${ex.currentStatus === 'COMPLETED' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                            <div className="flex-1">
                                <div className="text-xs text-zinc-400 mb-1">Treino atual</div>
                                <span className={`text-sm font-medium ${ex.currentStatus === 'COMPLETED' ? 'text-green-400' : 'text-amber-400'}`}>
                                    {ex.currentStatus === 'COMPLETED' ? 'Completado' : 'Pulado'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    ), [ExerciseHeader]);

    if (groupedComparisons.totalChanges === 0) {
        return (
            <div className="space-y-3">
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                    <h3 className="font-semibold text-lg mb-2 text-white">Visão Geral</h3>
                    <p className="text-zinc-300 text-sm">
                        Não foram encontradas mudanças significativas entre os treinos.
                    </p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-3">
                        <CheckCircle size={24} className="text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Consistência mantida!</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Não foram encontradas mudanças significativas entre este treino e o anterior.
                        Continue mantendo essa consistência!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Summary header */}
            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                <h3 className="font-semibold text-lg mb-2 text-white">Visão Geral</h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500/20 rounded-full flex-shrink-0">
                        <span className="text-blue-400 font-semibold text-xs">{groupedComparisons.totalChanges}</span>
                    </div>
                    <p className="text-zinc-300 text-sm">
                        {groupedComparisons.totalChanges === 1 
                            ? 'mudança identificada entre os treinos.'
                            : 'mudanças identificadas entre os treinos.'
                        }
                    </p>
                </div>
            </div>

            {/* Render sections */}
            {(['performance', 'load', 'status'] as const).map((sectionType) => {
                const items = groupedComparisons[sectionType];
                if (items.length === 0) return null;

                const config = SECTION_CONFIG[sectionType];
                
                return (
                    <div key={sectionType} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-2 h-2 rounded-full ${config.textColor.replace('text-', 'bg-')}`}></div>
                            <h3 className="font-semibold text-base text-white">
                                {config.title}
                            </h3>
                            <div className="flex items-center justify-center min-w-[18px] h-4 px-1 bg-zinc-700/50 text-zinc-300 text-xs font-medium rounded-full">
                                {items.length}
                            </div>
                        </div>
                        {sectionType === 'performance' && <RepetitionsSection items={items} />}
                        {sectionType === 'load' && <LoadSection items={items} />}
                        {sectionType === 'status' && <StatusSection items={items} />}
                    </div>
                );
            })}
        </div>
    );
} 