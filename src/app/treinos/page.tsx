'use client';

import { DoorOpen, User, PlusCircle, Dumbbell } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import Cookie from 'js-cookie';
import { useRouter } from 'next/navigation';
import WorkoutCard from '@/components/card/workoutCard';
import { useGetWorkoutsQuery, usePatchWorkoutsListOrderMutation } from '@/api/workout/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ActionButton from '@/components/button/actionButton';

interface Workout {
  id: string;
  name: string;
  listOrder: number;
}

// SortableWorkoutItem component
const SortableWorkoutItem = ({ workout, onClick }: { workout: Workout, onClick: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: workout.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-5">
      <WorkoutCard
        workout={workout}
        onClick={onClick}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isSuccess, data } = useGetWorkoutsQuery();
  const { mutate: patchWorkoutsListOrderMutate, isPending: patchWorkoutsListOrderIsPending } = usePatchWorkoutsListOrderMutation();

  // Update local workouts state when data changes
  useMemo(() => {
    if (isSuccess && data) {
      setWorkouts(data.sort((a, b) => a.listOrder - b.listOrder));
    }
  }, [isSuccess, data]);

  // Separate effect for animation delay
  useEffect(() => {
    if (isSuccess && data) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 150);

      // Cleanup function to prevent setting state on unmounted component
      return () => clearTimeout(timer);
    }
  }, [isSuccess, data]);

  // DnD sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (patchWorkoutsListOrderIsPending) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (patchWorkoutsListOrderIsPending) return;
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = workouts.findIndex(item => item.id === active.id);
      const newIndex = workouts.findIndex(item => item.id === over.id);

      const updatedWorkouts = [...workouts];
      const [movedItem] = updatedWorkouts.splice(oldIndex, 1);
      updatedWorkouts.splice(newIndex, 0, movedItem);

      // Update listOrder values
      const reorderedWorkouts = updatedWorkouts.map((workout, index) => ({
        ...workout,
        listOrder: index
      }));

      setWorkouts(reorderedWorkouts);

      // Create payload for backend update (as requested, just log it)
      const updatePayload = reorderedWorkouts.map(workout => ({
        id: workout.id,
        listOrder: workout.listOrder
      }));

      console.log('Reordering payload:', updatePayload);
      patchWorkoutsListOrderMutate(updatePayload);
    }

    setActiveId(null);
  };

  const handleLogout = () => {
    // Remover o token
    Cookie.remove('access_token');

    // Limpar o cache do React Query
    queryClient.clear();

    // Redirecionar para a página inicial
    router.push('/');
  };

  const handleEnterWorkout = (id: string) => {
    router.push(`/treinos/${id}`);
  };

  const handleEnterCreateWorkout = () => {
    router.push(`/treinos/criar`);
  };

  return (
    <main className="min-h-screen bg-[#161619] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 bg-zinc-800/50 h-16 shadow-lg backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-700/50 text-white hover:bg-zinc-700 active:bg-zinc-600 transition-colors duration-200"
        >
          <DoorOpen size={18} />
          <span className="text-sm">Sair</span>
        </button>
        <h1 className="text-xl font-semibold text-white">Meus Treinos</h1>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-700/50 text-white hover:bg-zinc-700 active:bg-zinc-600 transition-colors duration-200"
        >
          <User size={18} />
          <span className="text-sm">Perfil</span>
        </button>
      </header>

      {/* Workout List */}
      <section className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 md:px-8 lg:px-10 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto pb-20">
          {isSuccess && data ? (
            workouts.length > 0 ? (
              patchWorkoutsListOrderIsPending ? (
                <SortableContext
                  items={workouts.map(workout => workout.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{
                        transitionDelay: `${workouts.indexOf(workout) * 50}ms`
                      }}
                    >
                      <SortableWorkoutItem
                        workout={workout}
                        onClick={handleEnterWorkout}
                      />
                    </div>
                  ))}
                </SortableContext>
              ) : (
                <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={workouts.map(workout => workout.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {workouts.map((workout) => (
                      <div
                        key={workout.id}
                        className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{
                          transitionDelay: `${workouts.indexOf(workout) * 50}ms`
                        }}
                      >
                        <SortableWorkoutItem
                          workout={workout}
                          onClick={handleEnterWorkout}
                        />
                      </div>
                    ))}
                  </SortableContext>
                </DndContext>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center p-6 
                            bg-zinc-800/50 rounded-xl shadow-lg border border-zinc-700
                            transition-all duration-500 ease-in-out opacity-0 animate-fadeIn">
                <Dumbbell size={48} className="text-zinc-600 mb-4" />
                <p className="text-xl text-zinc-300 mb-4">Nenhum treino encontrado</p>
                <p className="text-zinc-400 mb-6">Crie seu primeiro treino para começar</p>
                <ActionButton
                  onClick={handleEnterCreateWorkout}
                  width="w-48"
                  height="h-12"
                  className="flex items-center justify-center gap-2"
                >
                  <PlusCircle size={20} />
                  Criar treino
                </ActionButton>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-80">
              <BeatLoader size={24} color="#dc2626" />
              <p className="text-zinc-400 mt-4">Carregando treinos...</p>
            </div>
          )}
        </div>
      </section>

      {/* Create Workout Button - Only show if there are workouts */}
      {isSuccess && data && data.length > 0 && (
        <section className="fixed bottom-6 right-6 md:bottom-8 md:right-8 
                          transition-all duration-500 animate-fadeIn">
          <button
            onClick={handleEnterCreateWorkout}
            className="flex items-center justify-center bg-red-600 text-white p-4 rounded-full shadow-lg 
                     hover:bg-red-700 transition-all duration-300 
                     hover:shadow-xl hover:scale-110 active:scale-95 transform">
            <PlusCircle size={24} />
          </button>
        </section>
      )}
    </main>
  );
}
