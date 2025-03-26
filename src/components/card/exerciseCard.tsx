import { useState } from 'react';
import { capitalizeAllWords } from '@/utils/stringUtils';
import { useDeleteExerciseFromWorkoutMutation, usePatchWorkoutExerciseMutation } from '@/api/workout/queries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Ellipsis, Trash2 } from 'lucide-react';
import ActionButton from '@/components/button/actionButton';

interface ExerciseCardProps {
  workoutExercise: {
    id: number;
    sets: number;
    reps: number;
    exerciseLoad: number;
    exercise: {
      id: number;
      name: string;
      bodyPart: string;
    };
  };
  workoutId: number;
}

const ExerciseCard = ({ workoutExercise, workoutId }: ExerciseCardProps) => {
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseLoad, setExerciseLoad] = useState(workoutExercise.exerciseLoad);

  const [editExerciseSets, setEditExerciseSets] = useState(workoutExercise.sets || 0);
  const [editExerciseReps, setEditExerciseReps] = useState(workoutExercise.reps || 0);
  const [editExerciseLoad, setEditExerciseLoad] = useState(workoutExercise.exerciseLoad);

  const { mutate: deleteWorkoutExerciseMutate } = useDeleteExerciseFromWorkoutMutation();
  const { mutate: patchWorkoutExerciseMutate } = usePatchWorkoutExerciseMutation();

  const updateExercise = () => {
    setEditDialogOpen(false);

    if (
      workoutExercise.sets === editExerciseSets
      && workoutExercise.reps === editExerciseReps
      && workoutExercise.exerciseLoad === editExerciseLoad
    ) {
      return;
    }

    patchWorkoutExerciseMutate({
      workoutExerciseId: workoutExercise.id,
      load: editExerciseLoad,
      sets: editExerciseSets,
      reps: editExerciseReps,
    });
  };

  const updateExerciseLoad = () => {
    if (workoutExercise.exerciseLoad === exerciseLoad) return;

    patchWorkoutExerciseMutate({
      workoutExerciseId: workoutExercise.id,
      load: exerciseLoad,
      sets: workoutExercise.sets,
      reps: workoutExercise.reps,
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteWorkoutExercise = () => {
    deleteWorkoutExerciseMutate({ workoutExerciseId: workoutExercise.id });
    setDeleteDialogOpen(false);
  };

  const getBodyPartColor = (bodyPart: string) => {
    switch (bodyPart) {
      case 'PEITO': return 'bg-teal-500';
      case 'TRICEPS': return 'bg-blue-500';
      case 'OMBRO': return 'bg-emerald-500';
      case 'PERNA': return 'bg-amber-500';
      case 'COSTAS': return 'bg-pink-500';
      case 'BICEPS': return 'bg-violet-500';
      default: return 'bg-zinc-600';
    }
  };

  return (
    <>
      <div className="flex flex-col flex-shrink-0 bg-zinc-800 rounded-lg w-[95%] max-w-2xl mx-auto mb-3 shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center h-12 mt-2 pb-2 border-b border-zinc-600">
          <div className="ml-3 lg:ml-5 font-medium text-sm md:text-base lg:text-lg">
            <p>{capitalizeAllWords(workoutExercise.exercise.name)}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-5 mr-2 md:mr-5">
            <div
              className={`${getBodyPartColor(workoutExercise.exercise.bodyPart)} 
                flex justify-center items-center h-7 w-16 md:h-8 md:w-20 lg:w-24 rounded-lg 
                text-xs md:text-sm font-medium`}
            >
              {workoutExercise.exercise.bodyPart}
            </div>
            <div className="flex items-center">
              <button>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <div
                      className="cursor-pointer p-1 active:bg-neutral-600 active:rounded hover:bg-neutral-700 hover:rounded transition-colors duration-200">
                      <Ellipsis size={24} className="md:w-6 md:h-6 lg:w-7 lg:h-7" />
                    </div>
                  </DialogTrigger>
                  <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                  <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}
                    className="w-[95%] rounded-lg sm:max-w-[425px] bg-zinc-900 border-0 shadow-lg">
                    <DialogHeader className="flex justify-center items-center">
                      <DialogTitle className="text-2xl font-bold mb-2">Editar exercício</DialogTitle>
                      <DialogDescription
                        className="text-base text-zinc-400">{capitalizeAllWords(workoutExercise.exercise.name)}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-5 py-4">
                      <div
                        className="flex justify-between items-center w-[90%] border-b border-zinc-700 pb-3">
                        <div className="w-1/2 text-left text-base">Séries:</div>
                        <input type="number"
                          placeholder={editExerciseSets.toString()}
                          onChange={(e) => setEditExerciseSets(Number(e.target.value))}
                          maxLength={2}
                          className="w-16 rounded-lg bg-zinc-800 text-center h-10 outline-0 focus:ring-2 focus:ring-red-500 transition-all duration-300" />
                      </div>
                      <div
                        className="flex justify-between items-center w-[90%] border-b border-zinc-700 pb-3">
                        <div className="w-1/2 text-left text-base">Repetições:</div>
                        <input type="number"
                          placeholder={editExerciseReps.toString()}
                          onChange={(e) => setEditExerciseReps(Number(e.target.value))}
                          maxLength={2}
                          className="w-16 rounded-lg bg-zinc-800 text-center h-10 outline-0 focus:ring-2 focus:ring-red-500 transition-all duration-300" />
                      </div>
                      <div
                        className="flex justify-between items-center w-[90%] border-b border-zinc-700 pb-3">
                        <div className="w-1/2 text-left text-base">Carga:</div>
                        <input type="number"
                          placeholder={editExerciseLoad.toString()}
                          onChange={(e) => setEditExerciseLoad(Number(e.target.value))}
                          className="w-16 rounded-lg bg-zinc-800 text-center h-10 outline-0 focus:ring-2 focus:ring-red-500 transition-all duration-300" />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-3 w-[90%] mx-auto mt-2 mb-4">
                      <ActionButton
                        height={'h-11'}
                        width={'w-full'}
                        onClick={updateExercise}>
                        Salvar alterações
                      </ActionButton>

                      <div className="flex justify-between">
                        <button
                          onClick={() => setDeleteDialogOpen(true)}
                          className="flex items-center justify-center gap-1 text-red-500 hover:text-red-400 transition-colors duration-200">
                          <Trash2 size={16} />
                          <span>Excluir exercício</span>
                        </button>

                        <button
                          onClick={() => setEditDialogOpen(false)}
                          className="text-zinc-400 hover:text-zinc-300 transition-colors duration-200">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center py-3 px-4">
          <div className="flex flex-row justify-between w-full flex-wrap gap-y-2">
            <div className="flex items-center">
              <span className="text-sm text-zinc-400 mr-2">Séries x Repetições:</span>
              <span className="font-medium">{workoutExercise.sets || 0}x{workoutExercise.reps || 0}</span>
            </div>
            <div className="flex items-center">
              <div className="text-sm text-zinc-400 mr-2">Carga:</div>
              <input
                placeholder={exerciseLoad.toString()}
                type="number"
                step="0.01"
                maxLength={9}
                onChange={(e) => setExerciseLoad(Number(e.target.value))}
                onBlur={updateExerciseLoad}
                className="w-20 h-9 text-center bg-zinc-900 rounded-lg placeholder:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <DialogContent className="w-[95%] rounded-lg sm:max-w-[425px] bg-zinc-900 border-0 shadow-lg">
          <DialogHeader className="flex justify-center items-center">
            <DialogTitle className="text-xl font-bold">Excluir exercício</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col p-4">
            <p className="text-center">
              Tem certeza que deseja excluir este exercício?
            </p>
          </div>
          <DialogFooter className="flex flex-row justify-center gap-3 pb-4">
            <button
              className="bg-zinc-700 w-28 h-11 rounded-lg font-medium hover:bg-zinc-600 transition-colors duration-300"
              onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </button>
            <button
              className="bg-red-600 w-28 h-11 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
              onClick={handleDeleteWorkoutExercise}>
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseCard;