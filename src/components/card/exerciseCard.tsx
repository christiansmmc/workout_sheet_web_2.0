import { useState } from 'react';
import { capitalizeAllWords } from '@/utils/stringUtils';
import { useDeleteExerciseFromWorkoutMutation, usePatchWorkoutExerciseMutation } from '@/api/workout/queries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Ellipsis, Trash2, AlertCircle, Dumbbell, Repeat } from 'lucide-react';

interface ExerciseCardProps {
  workoutExercise: {
    id: string;
    sets: number;
    reps: number;
    exerciseLoad: number;
    exercise: {
      id: string;
      name: string;
      bodyPart: string;
    };
  };
  workoutId: string;
}

const bodyPartColors: Record<string, string> = {
  PEITO: 'bg-teal-500',
  TRICEPS: 'bg-blue-500',
  OMBRO: 'bg-emerald-500',
  PERNA: 'bg-amber-500',
  COSTAS: 'bg-pink-500',
  BICEPS: 'bg-violet-500',
};

const ExerciseCard = ({ workoutExercise, workoutId }: ExerciseCardProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseLoad, setExerciseLoad] = useState(workoutExercise.exerciseLoad);

  const [editSets, setEditSets] = useState(workoutExercise.sets || 0);
  const [editReps, setEditReps] = useState(workoutExercise.reps || 0);
  const [editLoad, setEditLoad] = useState(workoutExercise.exerciseLoad);

  // Função auxiliar para tratar entrada de números decimais (com vírgula ou ponto)
  const parseDecimalInput = (value: string): number => {
    // Substitui vírgula por ponto e converte para número
    const normalizedValue = value.replace(',', '.');
    return parseFloat(normalizedValue);
  };

  const { mutate: deleteWorkoutExerciseMutate } = useDeleteExerciseFromWorkoutMutation();
  const { mutate: patchWorkoutExerciseMutate } = usePatchWorkoutExerciseMutation();

  const updateExercise = () => {
    setEditDialogOpen(false);

    if (
      workoutExercise.sets === editSets &&
      workoutExercise.reps === editReps &&
      workoutExercise.exerciseLoad === editLoad
    ) {
      return;
    }

    patchWorkoutExerciseMutate({
      workoutExerciseId: workoutExercise.id,
      load: editLoad,
      sets: editSets,
      reps: editReps,
      workoutId,
    });
  };

  const updateExerciseLoad = () => {
    if (workoutExercise.exerciseLoad === exerciseLoad) return;

    patchWorkoutExerciseMutate({
      workoutExerciseId: workoutExercise.id,
      load: exerciseLoad,
      sets: workoutExercise.sets,
      reps: workoutExercise.reps,
      workoutId,
    });
  };

  const handleDeleteWorkoutExercise = () => {
    deleteWorkoutExerciseMutate({ workoutExerciseId: workoutExercise.id, workoutId });
    setDeleteDialogOpen(false);
  };

  const bodyPartColor = bodyPartColors[workoutExercise.exercise.bodyPart] || 'bg-zinc-600';

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300">
        {/* Header: Exercise name and edit button */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-700/50">
          <h3 className="text-base font-medium text-white truncate">
            {capitalizeAllWords(workoutExercise.exercise.name)}
          </h3>
          <button
            onClick={() => setEditDialogOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors"
          >
            <Ellipsis size={18} />
          </button>
        </div>

        {/* Content: Exercise details */}
        <div className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Body part tag */}
            <div className={`${bodyPartColor} px-2.5 h-7 flex items-center rounded-lg text-xs font-medium`}>
              {workoutExercise.exercise.bodyPart}
            </div>

            {/* Series and Reps */}
            <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-zinc-700/50">
              <Repeat size={14} className="text-zinc-400" />
              <span className="text-sm font-medium text-white">
                {workoutExercise.sets || 0}x{workoutExercise.reps || 0}
              </span>
            </div>

            {/* Load */}
            <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-zinc-700/50">
              <Dumbbell size={14} className="text-zinc-400" />
              <input
                placeholder={exerciseLoad.toString()}
                type="number"
                step="0.01"
                maxLength={9}
                onChange={(e) => setExerciseLoad(parseDecimalInput(e.target.value))}
                onBlur={updateExerciseLoad}
                className="w-16 h-7 text-center bg-transparent text-sm font-medium text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <DialogContent
          className="w-[95%] rounded-lg sm:max-w-[425px] bg-zinc-900 border-0 shadow-lg"
        >
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="text-xl font-bold mb-4">Editar exercício</DialogTitle>
            <div className="text-center text-zinc-300 mb-2">
              {capitalizeAllWords(workoutExercise.exercise.name)}
            </div>
          </DialogHeader>

          <div className="space-y-4 px-4">
            {/* Series and Reps in a single row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">Séries</label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                <div className="relative flex items-center">
                  <button
                    onClick={() => setEditSets(prev => Math.max(0, prev - 1))}
                    className="absolute left-2 p-1 rounded hover:bg-zinc-700/50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                      <path d="M5 12h14"></path>
                    </svg>
                  </button>
                  <input
                    type="number"
                    placeholder={editSets.toString()}
                    value={editSets}
                    onChange={(e) => setEditSets(Number(e.target.value))}
                    maxLength={2}
                    className="w-full h-10 rounded-lg bg-zinc-800 text-center pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                  />
                  <button
                    onClick={() => setEditSets(prev => prev + 1)}
                    className="absolute right-2 p-1 rounded hover:bg-zinc-700/50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">Repetições</label>
                  <Repeat size={14} className="text-zinc-500" />
                </div>
                <div className="relative flex items-center">
                  <button
                    onClick={() => setEditReps(prev => Math.max(0, prev - 1))}
                    className="absolute left-2 p-1 rounded hover:bg-zinc-700/50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                      <path d="M5 12h14"></path>
                    </svg>
                  </button>
                  <input
                    type="number"
                    placeholder={editReps.toString()}
                    value={editReps}
                    onChange={(e) => setEditReps(Number(e.target.value))}
                    maxLength={2}
                    className="w-full h-10 rounded-lg bg-zinc-800 text-center pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                  />
                  <button
                    onClick={() => setEditReps(prev => prev + 1)}
                    className="absolute right-2 p-1 rounded hover:bg-zinc-700/50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Load input with icon */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-zinc-400">Carga (kg)</label>
                <Dumbbell size={14} className="text-zinc-500" />
              </div>
              <div className="relative flex items-center">
                <button
                  onClick={() => setEditLoad(prev => Math.max(0, prev - 0.5))}
                  className="absolute left-2 p-1 rounded hover:bg-zinc-700/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <path d="M5 12h14"></path>
                  </svg>
                </button>
                <input
                  type="number"
                  placeholder={editLoad.toString()}
                  value={editLoad}
                  onChange={(e) => setEditLoad(parseDecimalInput(e.target.value))}
                  step="0.01"
                  className="w-full h-10 rounded-lg bg-zinc-800 text-center pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                />
                <button
                  onClick={() => setEditLoad(prev => prev + 0.5)}
                  className="absolute right-2 p-1 rounded hover:bg-zinc-700/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4">
            <button
              onClick={updateExercise}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-colors"
            >
              <span className="font-medium">Salvar alterações</span>
            </button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
                <span className="text-sm">Remover exercício</span>
              </button>

              <button
                onClick={() => setEditDialogOpen(false)}
                className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <DialogContent
          className="w-[95%] rounded-lg sm:max-w-[425px] bg-zinc-900 border-0 shadow-lg"
        >
          <DialogHeader className="flex flex-col items-center">
            <div className="flex justify-center items-center rounded-full bg-red-500/10 w-16 h-16 mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold mb-4">Excluir exercício</DialogTitle>
            <div className="text-center text-zinc-300 mb-2">
              Tem certeza que deseja excluir este exercício?
            </div>
          </DialogHeader>

          <div className="flex justify-between gap-4 pb-2 px-4 mt-6">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 bg-zinc-700 py-2.5 rounded-lg font-medium hover:bg-zinc-600 transition-colors duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteWorkoutExercise}
              className="flex-1 bg-red-600 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
            >
              Excluir
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseCard;