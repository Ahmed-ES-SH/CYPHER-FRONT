"use client";

import { useRouter } from "next/navigation";
import ResetPasswordWrapper from "./ResetPasswordWrapper";

interface InvalidLinkStateProps {
  error: string | null;
}

export default function InvalidLinkState({ error }: InvalidLinkStateProps) {
  const router = useRouter();

  return (
    <ResetPasswordWrapper>
      <div className="p-8 text-center animate-fadeInUp">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Invalid Reset Link
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "The reset link is invalid or has expired."}
        </p>
        <button
          onClick={() => router.push("/forgot-password")}
          className="w-full py-3 px-4 border border-transparent rounded-xl text-white bg-[#00b8db] hover:bg-[#009fbf] transition-all duration-300 transform hover:scale-105 font-medium"
        >
          Request New Reset Link
        </button>
      </div>
    </ResetPasswordWrapper>
  );
}
