"use client";

import { useRouter } from "next/navigation";
import { useRegister } from "../../hooks/useUser.hook";
import UserForm from "../forms/UserForm";
import type { CreateUserDto, UpdateUserDto } from "../../types/user.types";

export function RegisterPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useRegister();

  const handleSubmit = async (data: CreateUserDto | UpdateUserDto) => {
    await mutateAsync(data as CreateUserDto);
    router.push("/register/success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start your journey
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <UserForm mode="register" onSubmit={handleSubmit} isLoading={isPending} />
        </div>
      </div>
    </div>
  );
}
