import LandingPageImage from '@/components/images/landing_page_image';
import Link from 'next/link';
import ActionButton from '@/components/button/actionButton';

export default function Home() {
  return (
    <main
      className="flex flex-col justify-center items-center w-full h-full
    lg:flex-row"
    >
      <div
        className="flex flex-1 justify-center items-end w-full h-1/2
      lg:flex-auto lg:items-center lg:w-1/2"
      >
        <div
          className="flex justify-center w-full
        md:w-3/4
        lg:w-[95%]
        xl:w-[80%]
        2xl:w-[50%]"
        >
          <LandingPageImage width={'90%'} />
        </div>
      </div>
      <div
        className="flex flex-col items-center justify-end gap-12 h-1/2
      md:justify-center
      lg:w-1/2 lg:border-l lg:border-neutral-800 lg:h-full
      2xl:items-start 2xl:justify-center 2xl:gap-24"
      >
        <div
          className="flex flex-col items-center justify-center w-full pt-12
        2xl:w-3/5"
        >
          <div className="text-4xl">MeuTreino</div>
          <div className="text-center text-lg px-3 pt-5">
            Organize e potencialize seus treinos.
          </div>
          <div className="text-center text-lg px-3 pt-1">
            Crie, edite e acompanhe sua evolução com facilidade.
          </div>
        </div>
        <div
          className="flex flex-col gap-3 pb-6
        2xl:w-3/5 2xl:items-center"
        >
          <Link href={'/login'}>
            <ActionButton>
              Entrar
            </ActionButton>
          </Link>
          <Link href={'/register'}>
            <ActionButton>
              Criar conta
            </ActionButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
