import { ChevronRight, Dumbbell, Pencil, Trash2, GripVertical } from "lucide-react";
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
            className={`flex justify-between items-center w-full rounded-lg overflow-hidden bg-zinc-800 shadow-md transition-all duration-200 hover:shadow-lg h-20 sm:h-24 border border-zinc-700 ${isDragging ? 'opacity-50 shadow-xl ring-2 ring-red-500' : ''}`}
        >
            <div className="flex items-center h-full">
                <div
                    className="flex items-center justify-center h-full px-3 sm:px-4 text-zinc-400 cursor-grab active:cursor-grabbing hover:text-white hover:bg-zinc-700 transition-colors duration-200"
                    {...dragHandleProps}
                >
                    <GripVertical size={22} />
                </div>
            </div>
            <div
                className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 flex-1 cursor-pointer h-full"
                onClick={() => onClick(workout.id)}
            >
                <div className="flex-shrink-0 p-2.5 sm:p-3 bg-zinc-700 rounded-lg">
                    <Dumbbell size={26} className="text-red-500" />
                </div>
                <p className="text-lg sm:text-xl font-medium truncate">{workout.name}</p>
            </div>

            <div className="flex items-center h-full">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            className="h-full px-5 sm:px-6 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors duration-200"
                            aria-label="Edit workout"
                        >
                            <Pencil size={24} />
                        </button>
                    </DialogTrigger>
                    <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                    <DialogContent
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="w-[90%] max-w-md rounded-lg bg-zinc-900 border-0 p-0 shadow-xl"
                        aria-describedby="edit-workout-description"
                    >
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
                            <DialogTitle className="text-xl font-semibold">Editar Treino</DialogTitle>
                            <DialogDescription id="edit-workout-description" className="sr-only">
                                Edite o nome do treino selecionado
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6">
                            <label htmlFor="workout-name" className="block text-sm text-zinc-400 mb-2">
                                Nome do treino
                            </label>
                            <input
                                type="text"
                                id="workout-name"
                                value={inputValue}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-zinc-800 rounded-lg 
                                         text-white placeholder-zinc-500
                                         focus:outline-none focus:ring-2 focus:ring-red-500
                                         transition-all duration-300"
                                placeholder="Nome do treino"
                                autoComplete="off"
                            />
                        </div>

                        <DialogFooter className="flex justify-between px-6 py-4 border-t border-zinc-800 gap-3">
                            <button
                                onClick={handleDeleteWorkout}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                                         bg-zinc-800 text-red-500 hover:bg-zinc-700 
                                         transition-colors duration-200 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <BeatLoader size={8} color="#dc2626" />
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>Excluir</span>
                                    </>
                                )}
                            </button>

                            <div className="flex gap-3">
                                <button
                                    className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 
                                             transition-colors duration-200 active:scale-95"
                                    onClick={handleClose}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 
                                             transition-colors duration-200 active:scale-95"
                                    onClick={handleEditWorkout}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <BeatLoader size={8} color="#ffffff" /> : "Salvar"}
                                </button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <button
                    onClick={() => onClick(workout.id)}
                    className="h-full px-5 sm:px-7 bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 flex items-center justify-center rounded-r-lg"
                    aria-label="View workout"
                >
                    <ChevronRight size={28} />
                </button>
            </div>
        </div>
    );
};

export default WorkoutCard;
