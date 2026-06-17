"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ResetPasswordWrapper from "./ResetPasswordWrapper";
import { useResetPassword } from "@/src/modules/auth";

interface ResetPasswordFormProps {
  token: string | null;
  email: string | null;
  onSuccess: () => void;
}

export default function ResetPasswordForm({
  token,
  email,
  onSuccess,
}: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const router = useRouter();
  const { reset } = useResetPassword();

  const validatePassword = () => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setResetError(null);

    try {
      await reset.mutateAsync({
        token: token ?? "",
        password: newPassword,
        email: email!,
      });
      onSuccess();
      setTimeout(() => {
        router.push("/signin");
      }, 1000);
    } catch (error: any) {
      setResetError(
        error?.message || "Failed to reset password. Please try again.",
      );
    }
  };

  return (
    <ResetPasswordWrapper>
      <div className="px-8 pt-8 pb-6 animate-fadeInUp">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#00b8db]/10 mb-4">
            <svg
              className="h-7 w-7 text-[#00b8db]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Password
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Please enter your new password below
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-1">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b8db] focus:border-transparent transition-all duration-200"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b8db] focus:border-transparent transition-all duration-200"
              placeholder="Confirm your new password"
            />
          </div>

          {(passwordError || resetError) && (
            <div
              className={`text-sm text-red-600 bg-red-50 rounded-lg p-3 ${passwordError ? "animate-shake" : ""}`}
            >
              {passwordError || resetError}
            </div>
          )}

          <button
            type="submit"
            disabled={reset.isPending}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-[#00b8db] hover:bg-[#009fbf] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {reset.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>

      <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
        <button
          onClick={() => router.push("/signin")}
          className="text-sm text-gray-600 hover:text-[#00b8db] transition-colors duration-200"
        >
          ← Back to Login
        </button>
      </div>
    </ResetPasswordWrapper>
  );
}
