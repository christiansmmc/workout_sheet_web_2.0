'use client';

import { useState, useCallback, useEffect } from 'react';
import { CreateWorkoutRequest } from '@/api/interfaces/workout';
import { useGetExercisesQuery } from '@/api/exercise/queries';
import { useCreateWorkoutMutation } from '@/api/workout/queries';
import { ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { capitalize } from '@/utils/stringUtils';
import ActionButton from '@/components/button/actionButton';
import { MoonLoader } from 'react-spinners';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const bodyParts = ['PEITO', 'BICEPS', 'COSTAS', 'TRICEPS', 'OMBRO', 'PERNA'];

enum workoutSetRepType {
  THREE_FIFTEEN = '3x15',
  FOUR_TWELVE = '4x12',
  OTHER = 'OTHER'
}

export default function Page() {
  const router = useRouter();

  const [fetchExercises, setFetchExercises] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const [workoutBodyParts, setWorkoutBodyParts] = useState<string[]>([]);
  const [workoutSetsReps, setWorkoutSetsReps] = useState<string>();
  const [workoutReps, setWorkoutReps] = useState<number>(0);
  const [workoutSets, setWorkoutSets] = useState<number>(0);
  const [workoutExercises, setWorkoutExercises] = useState<string[]>([]);
  const [workoutName, setWorkoutName] = useState<string>('');
  const [exerciseNameFilter, setExerciseNameFilter] = useState<string>('');
  const [exerciseBodyPartFilter, setExerciseBodyPartFilter] = useState<string>('');

  const { isLoading, data: exercises } = useGetExercisesQuery(fetchExercises, workoutBodyParts);

  const { mutate: mutateCreateWorkout, isLoading: isLoadingCreateWorkout } = useCreateWorkoutMutation();

  // Limpa os exercícios selecionados quando os músculos selecionados mudam
  useEffect(() => {
    setWorkoutExercises([]);
  }, [workoutBodyParts]);

  const handleSelectBodyParts = useCallback((bodyPart: string) => {
    setWorkoutBodyParts(prevState =>
      prevState.includes(bodyPart)
        ? prevState.filter(item => item !== bodyPart)
        : [...prevState, bodyPart],
    );
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && workoutBodyParts.length === 0) return;
    if (currentStep === 2 && !workoutSetsReps) return;
    if (currentStep === 3 && workoutExercises.length === 0) return;
    if (currentStep === 4 && (!workoutName || workoutName.trim().length === 0)) return;

    if (currentStep === 2) {
      setFetchExercises(true);
    }

    if (currentStep === 4) {
      const createWorkoutRequest: CreateWorkoutRequest = {
        workoutName: workoutName,
        exercises: workoutExercises.map(exerciseId => ({ exerciseId, reps: workoutReps, sets: workoutSets })),
      };
      mutateCreateWorkout(createWorkoutRequest, {
        onSuccess: () => {
          setSuccessDialogOpen(true);
        }
      });
      return;
    }

    setCurrentStep(prev => prev + 1);
  }, [currentStep, workoutBodyParts, workoutSetsReps, workoutExercises, workoutName, workoutReps, workoutSets, mutateCreateWorkout]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      if (currentStep === 3) {
        setWorkoutExercises([]);
        setFetchExercises(false);
      }
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleGoBack = () => {
    router.push('/workout');
  };

  const handleSetWorkoutSetsReps = useCallback((selectedType: workoutSetRepType) => {
    setWorkoutSetsReps(selectedType);

    switch (selectedType) {
      case workoutSetRepType.THREE_FIFTEEN:
        setWorkoutSets(3);
        setWorkoutReps(15);
        break;
      case workoutSetRepType.FOUR_TWELVE:
        setWorkoutSets(4);
        setWorkoutReps(12);
        break;
      case workoutSetRepType.OTHER:
        setWorkoutSets(0);
        setWorkoutReps(0);
        break;
    }
  }, []);

  const handleSelectExercise = useCallback((exerciseId: string) => {
    setWorkoutExercises(prevState =>
      prevState.includes(exerciseId)
        ? prevState.filter(id => id !== exerciseId)
        : [...prevState, exerciseId],
    );
  }, []);

  const getBodyPartColor = useCallback((bodyPart: string) => {
    switch (bodyPart) {
      case 'PEITO': return 'bg-teal-500';
      case 'TRICEPS': return 'bg-blue-500';
      case 'OMBRO': return 'bg-emerald-500';
      case 'PERNA': return 'bg-amber-500';
      case 'COSTAS': return 'bg-pink-500';
      case 'BICEPS': return 'bg-violet-500';
      default: return 'bg-zinc-600';
    }
  }, []);

  const handleSuccessDialogClose = useCallback(() => {
    router.push('/workout');
  }, [router]);

  // Adicionando um useEffect para controlar o redirecionamento após o modal ser exibido
  useEffect(() => {
    // Se o modal estiver aberto, não redireciona
    // Esta flag será usada para evitar que o redirecionamento da mutação funcione
  }, [successDialogOpen]);

  return (
    <main className="app-container">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 bg-zinc-800 h-16 shadow-lg">
        <button
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors duration-200",
            currentStep > 1
              ? "text-white bg-zinc-700/50 hover:bg-zinc-700 active:bg-zinc-600"
              : "text-zinc-500 bg-zinc-800 cursor-not-allowed"
          )}
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="flex items-center bg-zinc-700/30 px-3 py-1 rounded-md">
          <span className="text-sm text-zinc-300">Passo {currentStep}/4</span>
        </div>

        <button
          onClick={handleGoBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-700/50 text-white hover:bg-zinc-700 active:bg-zinc-600 transition-colors duration-200"
        >
          <span className="text-sm">Cancelar</span>
        </button>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 h-1.5">
        <div
          className="bg-red-600 h-full transition-all duration-300 ease-in-out"
          style={{ width: `${currentStep * 25}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 max-w-3xl mx-auto w-full">
        {/* Step 1: Selecionar Músculos */}
        {currentStep === 1 && (
          <div className="flex flex-col flex-1 gap-6 sm:gap-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mt-4 sm:mt-6">
              Quais músculos serão trabalhados?
            </h1>
            <div className="flex justify-center items-center flex-wrap gap-3 mt-4">
              {bodyParts.map((bodyPart, index) => {
                const isSelected = workoutBodyParts.includes(bodyPart);
                return (
                  <div
                    key={index}
                    onClick={() => handleSelectBodyParts(bodyPart)}
                    className={cn(
                      "flex justify-center items-center w-[calc(50%-0.5rem)] sm:w-36 h-14 text-lg rounded-lg border transition-colors duration-200 cursor-pointer",
                      isSelected
                        ? "bg-red-600 border-red-600 shadow-md"
                        : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    )}
                  >
                    {capitalize(bodyPart)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Séries e Repetições */}
        {currentStep === 2 && (
          <div className="flex flex-col flex-1 gap-6 sm:gap-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mt-4 sm:mt-6">
              Quantas séries e repetições?
            </h1>
            <p className="text-center text-zinc-400 text-sm max-w-sm mx-auto">
              A quantidade de séries e repetições poderá ser editada individualmente para cada exercício na aba de treino.
            </p>
            <div className="relative flex flex-col items-center gap-4 mt-4">
              <div className="flex justify-center items-center gap-3 w-full">
                <div
                  onClick={() => handleSetWorkoutSetsReps(workoutSetRepType.THREE_FIFTEEN)}
                  className={cn(
                    "flex justify-center items-center w-[calc(33%-0.5rem)] h-14 text-lg rounded-lg border transition-colors duration-200 cursor-pointer",
                    workoutSetsReps === workoutSetRepType.THREE_FIFTEEN
                      ? "bg-red-600 border-red-600 shadow-md"
                      : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                  )}
                >
                  3x15
                </div>
                <div
                  onClick={() => handleSetWorkoutSetsReps(workoutSetRepType.FOUR_TWELVE)}
                  className={cn(
                    "flex justify-center items-center w-[calc(33%-0.5rem)] h-14 text-lg rounded-lg border transition-colors duration-200 cursor-pointer",
                    workoutSetsReps === workoutSetRepType.FOUR_TWELVE
                      ? "bg-red-600 border-red-600 shadow-md"
                      : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                  )}
                >
                  4x12
                </div>
                <div
                  onClick={() => handleSetWorkoutSetsReps(workoutSetRepType.OTHER)}
                  className={cn(
                    "flex justify-center items-center w-[calc(33%-0.5rem)] h-14 text-lg rounded-lg border transition-colors duration-200 cursor-pointer",
                    workoutSetsReps === workoutSetRepType.OTHER
                      ? "bg-red-600 border-red-600 shadow-md"
                      : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                  )}
                >
                  Outro
                </div>
              </div>

              {workoutSetsReps === workoutSetRepType.OTHER && (
                <div className="w-full mt-6 flex flex-col gap-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between w-full border-b border-zinc-700 pb-3">
                    <label className="text-lg text-zinc-300">Séries:</label>
                    <input
                      type="number"
                      value={workoutSets || ''}
                      onChange={(e) => setWorkoutSets(Number(e.target.value))}
                      className="w-20 h-12 rounded-lg text-center text-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="flex items-center justify-between w-full border-b border-zinc-700 pb-3">
                    <label className="text-lg text-zinc-300">Repetições:</label>
                    <input
                      type="number"
                      value={workoutReps || ''}
                      onChange={(e) => setWorkoutReps(Number(e.target.value))}
                      className="w-20 h-12 rounded-lg text-center text-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Selecionar Exercícios */}
        {currentStep === 3 && (
          <div className="flex flex-col flex-1 gap-4 sm:gap-6 min-h-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mt-4 sm:mt-6">
              Escolha os exercícios
            </h1>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <MoonLoader color="#dc2626" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 mt-4 px-1">
                <div className="flex flex-col gap-3 mb-3">
                  <div className="flex gap-3 flex-wrap">
                    <input
                      type="text"
                      placeholder="Buscar por nome..."
                      value={exerciseNameFilter}
                      onChange={(e) => setExerciseNameFilter(e.target.value)}
                      className="flex-1 h-10 rounded-lg px-4 text-sm bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                    />
                    <select
                      value={exerciseBodyPartFilter}
                      onChange={(e) => setExerciseBodyPartFilter(e.target.value)}
                      className="w-full sm:w-auto min-w-[180px] h-10 rounded-lg px-4 text-sm bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                    >
                      <option value="">Todos os músculos</option>
                      {workoutBodyParts.map((bodyPart) => (
                        <option key={bodyPart} value={bodyPart}>{bodyPart}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 pb-4">
                  <div className="flex flex-col gap-3 pb-2">
                    {exercises
                      ?.filter((exercise) => {
                        const nameMatch = exercise.name.toLowerCase().includes(exerciseNameFilter.toLowerCase());
                        const bodyPartMatch = exerciseBodyPartFilter ? exercise.bodyPart === exerciseBodyPartFilter : true;
                        return nameMatch && bodyPartMatch;
                      })
                      .map((exercise, index) => {
                        const isSelected = workoutExercises.includes(exercise.id);

                        return (
                          <div
                            key={index}
                            onClick={() => handleSelectExercise(exercise.id)}
                            className={cn(
                              "flex justify-between items-center p-4 rounded-lg transition-all duration-200 cursor-pointer relative overflow-hidden",
                              isSelected
                                ? "bg-zinc-700 border border-green-500 shadow-md"
                                : "bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />
                            )}
                            <div className="text-base sm:text-lg font-medium">{capitalize(exercise.name)}</div>
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  getBodyPartColor(exercise.bodyPart),
                                  "flex justify-center items-center h-8 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium"
                                )}
                              >
                                {exercise.bodyPart}
                              </div>
                              {isSelected && (
                                <div className="flex items-center justify-center rounded-full bg-green-500 w-6 h-6 text-white shadow-sm">
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Nome do Treino */}
        {currentStep === 4 && (
          <div className="flex flex-col flex-1 gap-6 sm:gap-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mt-4 sm:mt-6">
              Dê um nome ao seu treino
            </h1>
            <div className="flex flex-col items-center gap-8 mt-4">
              <input
                type="text"
                placeholder="Digite o nome do treino"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full max-w-md h-14 rounded-lg px-4 text-lg text-center bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
              />

              <div className="text-center text-zinc-400 text-sm max-w-sm">
                Um bom nome pode ser o grupo muscular trabalhado, o dia da semana, ou outro identificador que facilite reconhecer este treino.
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-zinc-900/95 backdrop-blur-sm p-2 sm:p-3 border-t border-zinc-800 sm:px-6 mt-auto">
          <div className="max-w-3xl mx-auto flex justify-center">
            <ActionButton
              onClick={handleNextStep}
              className={cn(
                "mt-0 w-full sm:w-64 h-10 sm:h-11",
                (currentStep === 1 && workoutBodyParts.length === 0) ||
                  (currentStep === 2 && !workoutSetsReps) ||
                  (currentStep === 3 && workoutExercises.length === 0) ||
                  (currentStep === 4 && (!workoutName || workoutName.trim().length === 0))
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              )}
            >
              {currentStep === 4 ? (
                isLoadingCreateWorkout ? <MoonLoader size={20} color="#fff" /> : "Criar Treino"
              ) : "Continuar"}
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onOpenChange={setSuccessDialogOpen}
      >
        <DialogContent
          className="w-[95%] max-w-md rounded-lg bg-zinc-900 border-0 shadow-lg"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex justify-center items-center">
            <DialogTitle className="text-xl font-bold">Treino criado!</DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              Seu treino foi criado com sucesso.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center pb-4 pt-2">
            <ActionButton
              onClick={handleSuccessDialogClose}
              width="w-48"
              height="h-12"
            >
              Voltar para Treinos
            </ActionButton>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
