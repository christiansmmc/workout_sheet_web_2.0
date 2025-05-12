import { ChevronRight, Dumbbell, Pencil, Trash2, GripVertical, AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { useDeleteWorkoutMutation, usePatchWorkoutMutation } from "@/api/workout/queries";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { BeatLoader } from "react-spinners";

interface WorkoutCardProps {
    workout: {
        id: string;
        name: string;
        listOrder?: number;
    };
    onClick: (id: string) => void;
    dragHandleProps?: any;
    isDragging?: boolean;
}

const WorkoutCard = ({ workout, onClick, dragHandleProps, isDragging }: WorkoutCardProps) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(workout.name);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { mutate: patchWorkoutMutate } = usePatchWorkoutMutation();
    const { mutate: deleteWorkoutMutate } = useDeleteWorkoutMutation();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleClose = () => {
        setInputValue(workout.name); // Reset on close
        setOpen(false);
    };

    const handleEditWorkout = () => {
        if (workout.name === inputValue || inputValue.trim() === "") {
            handleClose();
            return;
        }

        setIsSubmitting(true);
        patchWorkoutMutate(
            { workoutId: workout.id, name: inputValue.trim() },
            {
                onSettled: () => {
                    setIsSubmitting(false);
                    handleClose();
                }
            }
        );
    };

    const handleDeleteWorkout = () => {
        setIsSubmitting(true);
        deleteWorkoutMutate(workout.id, {
            onSettled: () => {
                setIsSubmitting(false);
                handleClose();
            }
        });
    };

    return (
        <div
            className={`flex justify-between items-center w-full rounded-xl overflow-hidden 
                      bg-zinc-800/50 shadow-md transition-all duration-300 ease-in-out 
                      hover:shadow-lg hover:translate-y-[-2px] h-20 sm:h-24 
                      border border-zinc-700/50 backdrop-blur-sm
                      ${isDragging ? 'opacity-60 scale-105 shadow-xl ring-2 ring-red-500 z-10' : ''}`}
        >
            <div className="flex items-center h-full">
                <div
                    className="flex items-center justify-center h-full px-3 sm:px-4 
                              text-zinc-400 cursor-grab active:cursor-grabbing 
                              hover:text-white hover:bg-zinc-700/50 transition-all duration-200"
                    {...dragHandleProps}
                >
                    <GripVertical size={22} />
                </div>
            </div>
            <div
                className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 flex-1 cursor-pointer h-full
                          transition-colors duration-200 hover:bg-zinc-700/30"
                onClick={() => onClick(workout.id)}
            >
                <div className="flex-shrink-0 p-2.5 sm:p-3 bg-zinc-700/50 rounded-lg 
                              shadow-inner transition-all duration-200 
                              group-hover:bg-zinc-600/50 group-hover:shadow-md">
                    <Dumbbell size={26} className="text-red-500" />
                </div>
                <p className="text-lg sm:text-xl font-medium truncate text-white">{workout.name}</p>
            </div>

            <div className="flex items-center h-full">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            className="h-full px-5 sm:px-6 text-zinc-400 
                                     hover:text-white hover:bg-zinc-700/50 
                                     transition-all duration-200"
                            aria-label="Edit workout"
                        >
                            <Pencil size={24} />
                        </button>
                    </DialogTrigger>
                    <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                    <DialogContent
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="w-[95%] max-w-md rounded-lg bg-zinc-900 border-0 p-0 shadow-xl"
                    >
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
                            <DialogTitle className="text-xl font-semibold text-white">Editar Treino</DialogTitle>
                            <DialogDescription className="text-zinc-400 text-sm">
                                Altere o nome do treino ou exclua-o permanentemente
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Dumbbell size={18} className="text-zinc-400" />
                                <label htmlFor="workout-name" className="text-sm text-zinc-400 font-medium">
                                    Nome do treino
                                </label>
                            </div>
                            <input
                                type="text"
                                id="workout-name"
                                value={inputValue}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-zinc-800/50 rounded-lg 
                                         text-white placeholder-zinc-500 border border-zinc-700/50
                                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                                         transition-all duration-200"
                                placeholder="Digite o nome do treino"
                                autoComplete="off"
                            />
                        </div>

                        <DialogFooter className="flex justify-between px-6 py-4 border-t border-zinc-800 gap-3">
                            {showDeleteConfirm ? (
                                <>
                                    <div className="flex items-center gap-2 text-red-500">
                                        <AlertCircle size={18} />
                                        <span className="text-sm">Tem certeza?</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 rounded-lg bg-zinc-700/50 text-white hover:bg-zinc-700 
                                                     transition-all duration-200 active:scale-95"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleDeleteWorkout}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 
                                                     transition-all duration-200 active:scale-95
                                                     hover:shadow-lg"
                                        >
                                            {isSubmitting ? <BeatLoader size={8} color="#ffffff" /> : "Confirmar"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={isSubmitting}
                                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                                                 bg-zinc-800/50 text-red-500 hover:bg-zinc-700 border border-zinc-700/50
                                                 transition-all duration-200 active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                        <span>Excluir treino</span>
                                    </button>

                                    <div className="flex gap-3">
                                        <button
                                            className="px-4 py-2 rounded-lg bg-zinc-700/50 text-white hover:bg-zinc-700 
                                                     transition-all duration-200 active:scale-95"
                                            onClick={handleClose}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 
                                                     transition-all duration-200 active:scale-95
                                                     hover:shadow-lg"
                                            onClick={handleEditWorkout}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? <BeatLoader size={8} color="#ffffff" /> : "Salvar"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <button
                    onClick={() => onClick(workout.id)}
                    className="h-full px-5 sm:px-7 bg-red-600 text-white hover:bg-red-700 
                             transition-all duration-200 flex items-center justify-center rounded-r-lg
                             hover:shadow-inner"
                    aria-label="View workout"
                >
                    <ChevronRight size={28} />
                </button>
            </div>
        </div>
    );
};

export default WorkoutCard;
