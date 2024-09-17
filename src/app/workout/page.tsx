"use client";

import {ArrowLeft, DoorOpen, User} from "lucide-react";
import {BeatLoader} from "react-spinners";
import Cookie from "js-cookie";
import {useRouter} from "next/navigation";
import WorkoutCard from "@/components/card/workoutCard";
import {useGetWorkoutsQuery} from "@/api/workout/queries";

export default function Page() {
    const router = useRouter();

    const {isSuccess, data, remove} = useGetWorkoutsQuery();

    const handleLogout = () => {
        router.push("/");
        Cookie.remove("access_token");
        remove();
    };

    const handleEnterWorkout = (id: number) => {
        router.push(`/workout/${id}`);
    };

    const handleEnterCreateWorkout = () => {
        router.push(`/create-workout`);
    };

    return (
        <main className={"h-full flex flex-col"}>
            <header className={"flex items-center justify-between px-10 bg-zinc-800 h-16 shadow-lg"}>
                <div className='cursor-pointer p-1 active:p-1 active:bg-neutral-700 active:rounded'>
                    <DoorOpen size={32} onClick={handleLogout}/>
                </div>
                <div className='cursor-pointer p-1 active:p-1 active:bg-neutral-700 active:rounded'>
                    <User size={32} className={"cursor-pointer"}/>
                </div>
            </header>
            <section className={"flex flex-1 flex-col items-center gap-4 my-10 lg:gap-7"}>
                {isSuccess && data ? (
                    data
                        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                        .map((workout) => <WorkoutCard key={workout.id} workout={workout}
                                                       onClick={handleEnterWorkout}/>)
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BeatLoader size={26} color="#dc2626"/>
                    </div>
                )}
            </section>
            <section className={"flex justify-center mb-6"}>
                <button className={"bg-red-600 w-96 h-16 rounded-lg font-bold active:bg-red-800"} onClick={handleEnterCreateWorkout}>
                    Criar treino
                </button>
            </section>
        </main>
    );
}
