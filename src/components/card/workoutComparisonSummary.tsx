import React from 'react';
import { CheckCircle, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
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
    type: 'added' | 'removed' | 'performance' | 'status' | 'loadSuggestion';
    exerciseName: string;
    bodyPart: string;
    repsDiff?: number;
    repsPercentChange?: number;
    weightDiff?: number;
    weightPercentChange?: number;
    lastStatus?: string;
    currentStatus?: string;
    // Campos adicionais para análise mais detalhada
    avgRepsPerSetBefore?: number;
    avgRepsPerSetAfter?: number;
    avgRepsPerSetDiff?: number;
    // Campos para recomendações de carga
    suggestedLoadChange?: number;
    suggestedLoadChangePercentage?: number;
    currentLoad?: number;
    repsSummary?: number[];
    suggestionReason?: string;
}

// Definição de tipos para as seções de comparação
interface ComparisonSection {
    type: ExerciseComparison['type'];
    items: ExerciseComparison[];
    title: string;
    borderColor: string;
    textColor: string;
    bgColor: string;
}

export default function WorkoutComparisonSummary({ lastWorkout, currentWorkout }: WorkoutComparisonSummaryProps) {
    // Map to hold differences between workouts
    const exerciseComparisons = React.useMemo(() => {
        if (!lastWorkout?.workoutRecordExercises || !currentWorkout?.workoutRecordExercises) {
            return [];
        }

        const comparisons: ExerciseComparison[] = [];

        try {
            // Get all exercises from both workouts
            const lastExercises = lastWorkout.workoutRecordExercises || [];
            const currentExercises = currentWorkout.workoutRecordExercises || [];

            // Map exercises by ID for easier comparison
            const lastExercisesMap = new Map(
                lastExercises.map(ex => [ex.exercise.id, ex])
            );

            const currentExercisesMap = new Map(
                currentExercises.map(ex => [ex.exercise.id, ex])
            );

            // Find all exercise IDs from both workouts
            const allExerciseIds = new Set([
                ...Array.from(lastExercisesMap.keys()),
                ...Array.from(currentExercisesMap.keys())
            ]);

            // Compare each exercise
            Array.from(allExerciseIds).forEach(exerciseId => {
                const lastEx = lastExercisesMap.get(exerciseId);
                const currentEx = currentExercisesMap.get(exerciseId);

                // Different cases to handle
                if (!lastEx && currentEx) {
                    // New exercise added
                    comparisons.push({
                        type: 'added',
                        exerciseName: currentEx.exercise.name,
                        bodyPart: currentEx.exercise.bodyPart
                    });
                } else if (lastEx && !currentEx) {
                    // Exercise removed
                    comparisons.push({
                        type: 'removed',
                        exerciseName: lastEx.exercise.name,
                        bodyPart: lastEx.exercise.bodyPart
                    });
                } else if (lastEx && currentEx) {
                    // Exercise exists in both - compare performance
                    const lastSets = lastEx.workoutRecordExerciseSets || [];
                    const currentSets = currentEx.workoutRecordExerciseSets || [];

                    // Verificar se houve mudança de status
                    const statusChanged = lastEx.status !== currentEx.status;

                    // Verificar se ambos os exercícios têm sets para comparar
                    const hasLastSets = lastSets.length > 0 && lastEx.status === 'COMPLETED';
                    const hasCurrentSets = currentSets.length > 0 && currentEx.status === 'COMPLETED';
                    const canComparePerformance = hasLastSets && hasCurrentSets;

                    if (statusChanged) {
                        // Se o status mudou, registra como mudança de status
                        comparisons.push({
                            type: 'status',
                            exerciseName: currentEx.exercise.name,
                            bodyPart: currentEx.exercise.bodyPart,
                            lastStatus: lastEx.status,
                            currentStatus: currentEx.status
                        });
                    } else if (canComparePerformance) {
                        // Só compara performance se ambos têm sets registrados e são COMPLETED
                        // Calculate totals for comparison
                        const lastTotalReps = lastSets.reduce((sum, set) => sum + (set.reps || 0), 0);
                        const currentTotalReps = currentSets.reduce((sum, set) => sum + (set.reps || 0), 0);

                        const lastTotalWeight = lastSets.reduce((sum, set) => sum + ((set.reps || 0) * (set.exerciseLoad || 0)), 0);
                        const currentTotalWeight = currentSets.reduce((sum, set) => sum + ((set.reps || 0) * (set.exerciseLoad || 0)), 0);

                        // Calculate per-set averages for more detailed analysis
                        const avgRepsPerSetBefore = lastSets.length ? lastTotalReps / lastSets.length : 0;
                        const avgRepsPerSetAfter = currentSets.length ? currentTotalReps / currentSets.length : 0;
                        const avgRepsPerSetDiff = avgRepsPerSetAfter - avgRepsPerSetBefore;

                        // Calculate percentage changes
                        const repsDiff = currentTotalReps - lastTotalReps;
                        const repsPercentChange = lastTotalReps ? (repsDiff / lastTotalReps) * 100 : 0;

                        const weightDiff = currentTotalWeight - lastTotalWeight;
                        const weightPercentChange = lastTotalWeight ? (weightDiff / lastTotalWeight) * 100 : 0;

                        // Only show significant changes (more than 5%)
                        if (Math.abs(repsPercentChange) >= 5 || Math.abs(weightPercentChange) >= 5) {
                            comparisons.push({
                                type: 'performance',
                                exerciseName: currentEx.exercise.name,
                                bodyPart: currentEx.exercise.bodyPart,
                                repsDiff,
                                repsPercentChange,
                                weightDiff,
                                weightPercentChange,
                                avgRepsPerSetBefore,
                                avgRepsPerSetAfter,
                                avgRepsPerSetDiff
                            });
                        }
                    }
                }
            });

            // Adicionar lógica para gerar recomendações de carga
            // Analisa os exercícios do treino atual
            currentWorkout.workoutRecordExercises.forEach(exercise => {
                // Só analisamos exercícios que foram completados
                if (exercise.status === 'COMPLETED' && exercise.workoutRecordExerciseSets.length > 0) {
                    const sets = exercise.workoutRecordExerciseSets;
                    const repsBySet = sets.map(set => set.reps).sort((a, b) => b - a); // Ordem decrescente
                    const exerciseLoad = sets[0]?.exerciseLoad || 0;

                    // Se não houver carga, não faz sentido recomendar alterações
                    if (exerciseLoad <= 0) return;

                    // Recomendações baseadas na análise das repetições
                    let suggestion: ExerciseComparison | null = null;

                    // Análise para aumento de carga
                    if (repsBySet.length >= 3) {
                        // Critério para aumento: conseguir fazer pelo menos 8 repetições em todas as séries
                        // E pelo menos uma das séries com repetições próximas ao objetivo (10+)
                        const minReps = Math.min(...repsBySet);
                        const maxReps = Math.max(...repsBySet);

                        if (minReps >= 8 && maxReps >= 10) {
                            // Recomendar aumento adaptativo na carga
                            // Usa porcentagem maior se performance for muito boa (12+ reps)
                            const percentIncrease = maxReps >= 12 ? 7.5 : 5;
                            const suggestedLoadIncrease = (exerciseLoad * percentIncrease / 100);

                            suggestion = {
                                type: 'loadSuggestion',
                                exerciseName: exercise.exercise.name,
                                bodyPart: exercise.exercise.bodyPart,
                                suggestedLoadChange: suggestedLoadIncrease,
                                suggestedLoadChangePercentage: percentIncrease,
                                currentLoad: exerciseLoad,
                                repsSummary: repsBySet,
                                suggestionReason: "aumento"
                            };
                        }
                        // Critério para diminuição: adaptativo também
                        else if (minReps < 6) {
                            // Recomendação adaptativa para redução
                            // Redução maior se performance for muito abaixo do esperado
                            const percentDecrease = minReps <= 3 ? -10 : -5;
                            const suggestedLoadDecrease = (exerciseLoad * Math.abs(percentDecrease) / 100);

                            suggestion = {
                                type: 'loadSuggestion',
                                exerciseName: exercise.exercise.name,
                                bodyPart: exercise.exercise.bodyPart,
                                suggestedLoadChange: -suggestedLoadDecrease,
                                suggestedLoadChangePercentage: percentDecrease,
                                currentLoad: exerciseLoad,
                                repsSummary: repsBySet,
                                suggestionReason: "redução"
                            };
                        }
                    }

                    if (suggestion) {
                        comparisons.push(suggestion);
                    }
                }
            });

        } catch (error) {
            console.error('Error in workout comparison:', error);
        }

        return comparisons;
    }, [lastWorkout, currentWorkout]);

    // Group comparisons by type for better display
    const addedExercises = exerciseComparisons.filter(c => c.type === 'added');
    const removedExercises = exerciseComparisons.filter(c => c.type === 'removed');
    const performanceChanges = exerciseComparisons.filter(c => c.type === 'performance');
    const statusChanges = exerciseComparisons.filter(c => c.type === 'status');
    const loadSuggestions = exerciseComparisons.filter(c => c.type === 'loadSuggestion');

    // Organizando as comparações em ordem de relevância para melhor experiência do usuário
    const orderedComparisonSections = React.useMemo(() => {
        const sections: ComparisonSection[] = [];

        // Primeiro as sugestões de carga (mais acionáveis)
        if (loadSuggestions.length > 0) {
            sections.push({
                type: 'loadSuggestion',
                items: loadSuggestions,
                title: 'Sugestões de Carga',
                borderColor: 'border-cyan-500',
                textColor: 'text-cyan-500',
                bgColor: 'bg-cyan-500/20'
            });
        }

        // Segundo as mudanças de performance (mostram progresso)
        if (performanceChanges.length > 0) {
            sections.push({
                type: 'performance',
                items: performanceChanges,
                title: 'Mudanças de Performance',
                borderColor: 'border-blue-500',
                textColor: 'text-blue-500',
                bgColor: 'bg-blue-500/20'
            });
        }

        // Terceiro as mudanças de status
        if (statusChanges.length > 0) {
            sections.push({
                type: 'status',
                items: statusChanges,
                title: 'Mudanças de Status',
                borderColor: 'border-violet-500',
                textColor: 'text-violet-500',
                bgColor: 'bg-violet-500/20'
            });
        }

        // Quarto exercícios adicionados/removidos
        if (addedExercises.length > 0) {
            sections.push({
                type: 'added',
                items: addedExercises,
                title: 'Exercícios Adicionados',
                borderColor: 'border-green-500',
                textColor: 'text-green-500',
                bgColor: 'bg-green-500/20'
            });
        }

        if (removedExercises.length > 0) {
            sections.push({
                type: 'removed',
                items: removedExercises,
                title: 'Exercícios Removidos',
                borderColor: 'border-amber-500',
                textColor: 'text-amber-500',
                bgColor: 'bg-amber-500/20'
            });
        }

        return sections;
    }, [loadSuggestions, performanceChanges, statusChanges, addedExercises, removedExercises]);

    // Componentes internos para melhorar a legibilidade
    const SectionHeader = ({ title, color, count }: { title: string, color: string, count: number }) => (
        <h3 className={`font-medium ${color} flex items-center gap-2 mb-3`}>
            <span>{title}</span>
            <span className={`bg-${color.replace('text-', '')}/20 ${color} text-xs py-1 px-2 rounded-full`}>
                {count}
            </span>
        </h3>
    );

    const ExerciseHeader = ({ name, bodyPart }: { name: string, bodyPart: string }) => (
        <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{capitalizeAllWords(name)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300">
                {bodyPart}
            </span>
        </div>
    );

    const NoChangesSection = () => (
        <div className="bg-zinc-800/50 rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="mb-4 p-4 rounded-full bg-zinc-700/50">
                <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Sem mudanças significativas</h3>
            <p className="text-zinc-400 text-sm text-center">
                Não foram encontradas mudanças significativas entre este treino e o anterior.
                Continue mantendo a consistência!
            </p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Summary header */}
            <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">Visão Geral</h3>
                <p className="text-zinc-300 text-sm">
                    {exerciseComparisons.length === 0 ?
                        "Não foram encontradas mudanças significativas entre os treinos." :
                        `Encontramos ${exerciseComparisons.length} mudanças entre seu treino atual e anterior.`
                    }
                </p>
            </div>

            {/* Render sections in priority order */}
            {orderedComparisonSections.map((section, idx) => {
                // Container comum para todas as seções
                const SectionContainer = ({ children }: { children: React.ReactNode }) => (
                    <div key={`section-${idx}`} className={`border-l-4 ${section.borderColor} bg-zinc-800/50 rounded-r-lg p-4`}>
                        <SectionHeader
                            title={section.title}
                            color={section.textColor}
                            count={section.items.length}
                        />
                        {children}
                    </div>
                );

                // Rendering different section types
                if (section.type === 'added' || section.type === 'removed') {
                    // Simple list for added/removed exercises
                    return (
                        <SectionContainer key={`section-${idx}`}>
                            <ul className="flex flex-col gap-2">
                                {section.items.map((ex, itemIdx) => (
                                    <li key={`${section.type}-${itemIdx}`} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${section.textColor}`}></div>
                                        <ExerciseHeader name={ex.exerciseName} bodyPart={ex.bodyPart} />
                                    </li>
                                ))}
                            </ul>
                        </SectionContainer>
                    );
                } else if (section.type === 'performance') {
                    // Performance changes with reps and weight comparisons
                    return (
                        <SectionContainer key={`section-${idx}`}>
                            <ul className="flex flex-col gap-4">
                                {section.items.map((ex, itemIdx) => (
                                    <li key={`perf-${itemIdx}`} className="flex flex-col gap-1">
                                        <ExerciseHeader name={ex.exerciseName} bodyPart={ex.bodyPart} />

                                        {/* Reps comparison */}
                                        <div className="flex items-center gap-2 ml-2">
                                            {(ex.repsDiff && ex.repsDiff > 0) ? (
                                                <TrendingUp size={16} className="text-green-500" />
                                            ) : (
                                                <TrendingDown size={16} className="text-red-500" />
                                            )}
                                            <span className={`text-sm ${(ex.repsDiff && ex.repsDiff > 0) ? 'text-green-500' : 'text-red-500'}`}>
                                                {ex.repsDiff && ex.repsDiff > 0 ? "+" : ""}{ex.repsDiff || 0} repetições (
                                                {ex.repsPercentChange && ex.repsPercentChange > 0 ? "+" : ""}
                                                {formatNumberBR(ex.repsPercentChange)}%)
                                            </span>
                                        </div>

                                        {/* Detailed reps per set information */}
                                        {ex.avgRepsPerSetDiff !== undefined && (
                                            <div className="flex items-center gap-2 ml-2 mt-1">
                                                <span className="text-sm text-zinc-400">
                                                    Média por série: {' '}
                                                    <span className={`font-medium ${(ex.avgRepsPerSetDiff > 0) ? 'text-green-500' : 'text-red-500'}`}>
                                                        {formatNumberBR(ex.avgRepsPerSetBefore)} {' → '} {formatNumberBR(ex.avgRepsPerSetAfter)}
                                                        {' ('}{ex.avgRepsPerSetDiff > 0 ? '+' : ''}{formatNumberBR(ex.avgRepsPerSetDiff)}{')'}
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </SectionContainer>
                    );
                } else if (section.type === 'status') {
                    // Status changes
                    return (
                        <SectionContainer key={`section-${idx}`}>
                            <ul className="flex flex-col gap-3">
                                {section.items.map((ex, itemIdx) => (
                                    <li key={`status-${itemIdx}`} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${section.textColor}`}></div>
                                            <ExerciseHeader name={ex.exerciseName} bodyPart={ex.bodyPart} />
                                        </div>
                                        <div className="mt-1 ml-4 flex items-center gap-1.5">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${ex.lastStatus === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {ex.lastStatus === 'COMPLETED' ? 'Completado' : 'Pulado'}
                                            </span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${ex.currentStatus === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {ex.currentStatus === 'COMPLETED' ? 'Completado' : 'Pulado'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </SectionContainer>
                    );
                } else if (section.type === 'loadSuggestion') {
                    // Load suggestions
                    return (
                        <SectionContainer key={`section-${idx}`}>
                            <ul className="flex flex-col gap-4">
                                {section.items.map((ex, itemIdx) => (
                                    <li key={`load-${itemIdx}`} className="flex flex-col gap-1">
                                        <ExerciseHeader name={ex.exerciseName} bodyPart={ex.bodyPart} />

                                        <div className="bg-zinc-700/30 rounded-lg p-3">
                                            {/* Current load info */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-zinc-400">Carga atual:</span>
                                                <span className="font-medium">{formatNumberBR(ex.currentLoad, 1)} kg</span>
                                            </div>

                                            {/* Repetitions summary */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-zinc-400">Repetições:</span>
                                                <div className="flex gap-1">
                                                    {ex.repsSummary?.map((reps, i) => (
                                                        <span key={i} className={`text-sm px-2 py-0.5 rounded-full ${reps >= 10 ? 'bg-green-500/20 text-green-400' :
                                                            reps >= 8 ? 'bg-blue-500/20 text-blue-400' :
                                                                reps >= 6 ? 'bg-amber-500/20 text-amber-400' :
                                                                    'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {reps}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Suggestion */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-zinc-400">Sugestão:</span>
                                                <div className="flex items-center gap-1">
                                                    {ex.suggestionReason === "aumento" ? (
                                                        <>
                                                            <TrendingUp size={16} className="text-green-500" />
                                                            <span className="text-green-500">
                                                                +{formatNumberBR(Math.abs(ex.suggestedLoadChangePercentage || 0))}%
                                                                {' '}({formatNumberBR((ex.currentLoad || 0) + (ex.suggestedLoadChange || 0), 1)} kg)
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown size={16} className="text-amber-500" />
                                                            <span className="text-amber-500">
                                                                {formatNumberBR(ex.suggestedLoadChangePercentage)}%
                                                                {' '}({formatNumberBR((ex.currentLoad || 0) + (ex.suggestedLoadChange || 0), 1)} kg)
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Explanation */}
                                            <div className="mt-3 pt-2 border-t border-zinc-700/50 text-xs text-zinc-400">
                                                {ex.suggestionReason === "aumento" ? (
                                                    <p>
                                                        Você está conseguindo boas repetições com a carga atual.
                                                        Considere aumentar ligeiramente para continuar progredindo.
                                                    </p>
                                                ) : (
                                                    <p>
                                                        Você está tendo dificuldade com algumas repetições.
                                                        Uma pequena redução na carga pode melhorar a técnica e prevenir lesões.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </SectionContainer>
                    );
                }

                return null;
            })}

            {/* No changes section */}
            {exerciseComparisons.length === 0 && <NoChangesSection />}
        </div>
    );
} 