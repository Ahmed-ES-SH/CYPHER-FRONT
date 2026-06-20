"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyEmail } from "../../hooks/useUser.hook";
import { BiLoader } from "react-icons/bi";
import { FiCheckCircle, FiXCircle, FiArrowLeft, FiMail } from "react-icons/fi";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { mutateAsync } = useVerifyEmail();
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const verificationStarted = useRef(false);

  const handleVerification = useCallback(async () => {
    if (verificationStarted.current) return;
    if (!token) {
      setStatus("failure");
      setErrorMessage("No verification token found in the URL. Please check the link in your email.");
      return;
    }

    verificationStarted.current = true;
    setStatus("loading");

    try {
      await mutateAsync({ token: token! , email: email! });
      setStatus("success");
    } catch (error: any) {
      setStatus("failure");
      setErrorMessage(error?.message || "Verification failed. The link may be expired or invalid.");
    }
  }, [token, mutateAsync]);

  useEffect(() => {
    handleVerification();
  }, [handleVerification]);

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <BiLoader className="size-16 text-primary animate-spin" />
          <p className="text-lg text-gray-500 font-medium">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-50">
          <FiCheckCircle className="size-12 text-green-500" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Email Verified!</h1>
          <p className="text-gray-500 max-w-md">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
        </div>
        <button
          onClick={() => router.push("/signin")}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg"
        >
          <FiArrowLeft className="size-4" />
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-50">
        <FiXCircle className="size-12 text-red-500" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Verification Failed</h1>
        <p className="text-gray-500 max-w-md">
          {errorMessage || "Something went wrong. The verification link may be expired or invalid."}
        </p>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => router.push("/signin")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
}

export function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center">
          <BiLoader className="size-16 text-primary animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
