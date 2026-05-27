"use client";

import { useUser, useUpdateUser } from "../../hooks/useUser.hook";
import { useAuth } from "@/src/modules/auth";
import UserForm from "../forms/UserForm";
import AvatarUploader from "../forms/AvatarUploader";
import type { UpdateUserDto } from "../../types/user.types";

interface ProfileSettingsPageProps {
  userId?: number;
}

export function ProfileSettingsPage({ userId }: ProfileSettingsPageProps) {
  const { user: authUser } = useAuth();
  const id = userId ?? authUser?.id;
  const isUnavailable = !id;

  const { data: user, isLoading } = useUser(id);
  const { mutateAsync, isPending } = useUpdateUser(id);

  const handleSubmit = async (data: UpdateUserDto) => {
    const payload: UpdateUserDto = {};
    if (data.name) payload.name = data.name;
    if (data.email) payload.email = data.email;
    if (data.password) payload.password = data.password;
    await mutateAsync(payload);
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const updated = await mutateAsync({ avatar: base64 });
    return updated?.avatar ?? user?.avatar ?? "";
  };

  if (isUnavailable) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        Sign in required to access profile settings.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>
      <div className="space-y-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Avatar</h2>
          <AvatarUploader
            currentAvatar={user?.avatar}
            onUpload={handleAvatarUpload}
          />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <UserForm
            mode="edit"
            initialData={user}
            onSubmit={handleSubmit}
            isLoading={isPending}
          />
        </div>
      </div>
    </div>
  );
}
