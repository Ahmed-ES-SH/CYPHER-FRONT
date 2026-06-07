"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "@/src/modules/auth";

// Child components
import VerifyingState from "@/app/_components/_auth/_restPasswordPage/VerifyingState";
import InvalidLinkState from "@/app/_components/_auth/_restPasswordPage/InvalidLinkState";
import ResetSuccessState from "@/app/_components/_auth/_restPasswordPage/ResetSuccessState";
import ResetPasswordForm from "@/app/_components/_auth/_restPasswordPage/ResetPasswordForm";

export default function RestPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("e");
  const { verify } = useResetPassword();

  // State management
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setVerifyError("No reset token provided. Please check your link.");
        setIsVerifying(false);
        return;
      }

      try {
        await verify.mutateAsync({ token, email: email ?? undefined });
        setTokenValid(true);
        setVerifyError(null);
      } catch (error) {
        setTokenValid(false);
        setVerifyError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  // Orchestrate rendering based on state
  if (isVerifying) {
    return <VerifyingState />;
  }

  if (!tokenValid) {
    return <InvalidLinkState error={verifyError} />;
  }

  if (resetSuccess) {
    return <ResetSuccessState />;
  }

  return (
    <ResetPasswordForm
      token={token}
      email={email}
      onSuccess={() => setResetSuccess(true)}
    />
  );
}
