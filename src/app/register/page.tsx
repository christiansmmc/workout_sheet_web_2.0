'use client';

import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BeatLoader } from 'react-spinners';
import { useRegisterMutation } from '@/api/user/queries';

// Validation Schema
const registrationSchema = z
  .object({
    name: z.string().min(2, 'Nome precisa ter pelo menos 2 caracteres'),
    height: z.string().refine(val => {
      const numVal = Number(val.replace(',', '.'));
      return !isNaN(numVal) && numVal > 0 && numVal < 3;
    }, { message: 'Altura inválida' }),
    weight: z.string().refine(val => {
      const numVal = Number(val);
      return !isNaN(numVal) && numVal > 0 && numVal < 300;
    }, { message: 'Peso inválido' }),
    email: z.string().email('Email inválido'),
    password: z.string()
      .min(6, 'Senha precisa de pelo menos 6 caracteres')
      .max(20, 'Senha não pode ter mais de 20 caracteres'),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'As senhas não coincidem',
      });
    }
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

const FormInput = ({
  label,
  type = 'text',
  error,
  register,
  placeholder
}: {
  label: keyof RegistrationFormData;
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

export default function RegistrationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const { mutate, isLoading } = useRegisterMutation();

  const onSubmit = (data: RegistrationFormData) => {
    mutate({
      firstName: data.name,
      height: Number(data.height.replace(',', '.')),
      weight: Number(data.weight),
      user: {
        email: data.email,
        password: data.password,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile & Tablet Image Section */}
      <div className="block lg:hidden w-full h-64 relative">
        <Image
          src="/images/register-banner.jpg"
          alt="Fitness Registration"
          fill
          className="absolute inset-0 object-cover filter grayscale"
          priority
        />

      </div>

      {/* Desktop Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/register-banner.jpg"
          alt="Fitness Registration"
          fill
          className="absolute inset-0 object-cover filter grayscale"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center 
                      px-6 py-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Crie sua conta
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="name"
              placeholder="Nome completo"
              register={register}
              error={errors.name}
            />
            <div className="flex space-x-4">
              <div className="w-1/2">
                <FormInput
                  label="height"
                  placeholder="Altura (m)"
                  register={register}
                  error={errors.height}
                />
              </div>
              <div className="w-1/2">
                <FormInput
                  label="weight"
                  placeholder="Peso (kg)"
                  register={register}
                  error={errors.weight}
                />
              </div>
            </div>
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
            <FormInput
              label="confirmPassword"
              type="password"
              placeholder="Confirmar senha"
              register={register}
              error={errors.confirmPassword}
            />

            <div className="mt-6">
              {!isLoading ? (
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white 
                             py-3 rounded-lg hover:bg-red-700 
                             transition-colors duration-300
                             active:scale-95 transform"
                >
                  Criar conta
                </button>
              ) : (
                <div className="flex justify-center w-full">
                  <BeatLoader color="#dc2626" />
                </div>
              )}

              <p className="text-center text-sm mt-4">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="text-red-600 hover:underline font-semibold"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}