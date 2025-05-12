'use client';

import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BeatLoader } from 'react-spinners';
import { useLoginMutation } from '@/api/user/queries';

// Validation Schema
const loginSchema = z.object({
  email: z.string({ required_error: 'Email é obrigatório' })
    .email('Email inválido'),
  password: z.string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha precisa ter pelo menos 6 caracteres')
    .max(20, 'Senha não pode ter mais de 20 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const FormInput = ({
  label,
  type = 'text',
  error,
  register,
  placeholder
}: {
  label: keyof LoginFormData;
  type?: string;
  error?: { message?: string };
  register: any;
  placeholder: string;
}) => (
  <div className="w-full mb-4">
    <input
      className="w-full px-4 py-3 bg-zinc-800 rounded-lg 
                 text-white placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-red-500
                 transition-all duration-300"
      type={type}
      placeholder={placeholder}
      {...register(label)}
    />
    {error && (
      <span className="text-sm text-red-500 ml-2 mt-1 block">
        {error.message}
      </span>
    )}
  </div>
);

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isLoading } = useLoginMutation();

  const onSubmit = (data: LoginFormData) => {
    mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="h-full overflow-hidden ios-scroll-fix flex flex-col lg:flex-row">
      {/* Mobile & Tablet Image Section */}
      <div className="block lg:hidden w-full h-64 relative">
        <Image
          src="/images/login-page-banner.webp"
          alt="Fitness Login"
          fill
          className="absolute inset-0 object-cover blur-sm"
          priority
        />
      </div>

      {/* Desktop Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/login-page-banner.webp"
          alt="Fitness Login"
          fill
          className="absolute inset-0 object-cover blur-sm"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center 
                      px-6 py-12 lg:px-16 xl:px-24 flex-1 lg:flex-none overflow-y-auto">
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Acesse sua conta
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="email"
              placeholder="Email"
              register={register}
              error={errors.email}
            />
            <FormInput
              label="password"
              type="password"
              placeholder="Senha"
              register={register}
              error={errors.password}
            />

            <p className="text-end text-sm">
              <span className="text-red-600 hover:underline cursor-pointer">
                Esqueceu sua senha?
              </span>
            </p>

            <div className="mt-6">
              {!isLoading ? (
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white 
                             py-3 rounded-lg hover:bg-red-700 
                             transition-colors duration-300
                             active:scale-95 transform"
                >
                  Entrar
                </button>
              ) : (
                <div className="flex justify-center w-full">
                  <BeatLoader color="#dc2626" />
                </div>
              )}

              <p className="text-center text-sm mt-4">
                Ainda não tem uma conta?{' '}
                <Link
                  href="/cadastro"
                  className="text-red-600 hover:underline font-semibold"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}