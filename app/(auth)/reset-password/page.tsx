"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiInstance } from "@/app/helpers/axios";
import { API_ENDPOINTS } from "@/constants/endpoints";

// Child components
import VerifyingState from "@/app/_components/_auth/_restPasswordPage/VerifyingState";
import InvalidLinkState from "@/app/_components/_auth/_restPasswordPage/InvalidLinkState";
import ResetSuccessState from "@/app/_components/_auth/_restPasswordPage/ResetSuccessState";
import ResetPasswordForm from "@/app/_components/_auth/_restPasswordPage/ResetPasswordForm";

export default function RestPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("e");

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
        const response = await apiInstance.post(
          API_ENDPOINTS.AUTH.resetPasswordVerify,
          {
            token,
            email,
          },
        );

        if (response.status === 200 || response.status === 201) {
          setTokenValid(true);
          setVerifyError(null);
        } else {
          setTokenValid(false);
          setVerifyError(
            "Invalid or expired reset token. Please request a new password reset.",
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        setTokenValid(false);
        setVerifyError(
          "Network error. Please check your connection and try again.",
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
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
