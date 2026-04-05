"use client";

import { useRouter } from "next/navigation";
import ResetPasswordWrapper from "./ResetPasswordWrapper";

export default function ResetSuccessState() {
  const router = useRouter();

  return (
    <ResetPasswordWrapper>
      <div className="p-8 text-center animate-fadeInUp">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Password Reset Successfully!
        </h2>
        <p className="text-gray-600 mb-6">
          Your password has been updated. Redirecting you to login page...
        </p>
        <button
          onClick={() => router.push("/signin")}
          className="w-full py-3 px-4 border border-transparent rounded-xl text-white bg-[#00b8db] hover:bg-[#009fbf] transition-all duration-300 transform hover:scale-105 font-medium"
        >
          Go to Login
        </button>
      </div>
    </ResetPasswordWrapper>
  );
}
