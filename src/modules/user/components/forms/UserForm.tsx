"use client";

import { useState } from "react";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import type { CreateUserDto, UpdateUserDto, User, ApiError } from "../../types/user.types";

interface UserFormProps {
  mode: "register" | "edit";
  initialData?: Partial<User>;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
  isLoading?: boolean;
}

type FormErrors = Partial<Record<"name" | "email" | "password", string>>;

export default function UserForm({ mode, initialData, onSubmit, isLoading }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (mode === "register" && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setFormError(null);
      await onSubmit(formData);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.errors) {
        const fieldErrors: FormErrors = {};
        apiErr.errors.forEach(({ field, message }) => {
          if (field in formData) {
            fieldErrors[field as keyof FormErrors] = message;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setFormError(typeof apiErr.message === "string" ? apiErr.message : apiErr.message.join(", "));
        }
      } else {
        const message = typeof apiErr?.message === "string"
          ? apiErr.message
          : Array.isArray(apiErr?.message)
            ? apiErr.message.join(", ")
            : "An unexpected error occurred";
        setFormError(message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.name ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Enter your name"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Enter your email"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {mode === "register" ? "Password" : "New Password (optional)"}
        </label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className={`w-full rounded-xl border-2 py-3 pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.password ? "border-red-500" : "border-gray-200"
            }`}
            placeholder={mode === "register" ? "Create a password" : "Leave blank to keep current"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff className="size-5" /> : <FiEye className="size-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {formError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{formError}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <FiLoader className="size-5 animate-spin" />
            <span>{mode === "register" ? "Creating account..." : "Saving..."}</span>
          </>
        ) : (
          <span>{mode === "register" ? "Create Account" : "Save Changes"}</span>
        )}
      </button>
    </form>
  );
}
