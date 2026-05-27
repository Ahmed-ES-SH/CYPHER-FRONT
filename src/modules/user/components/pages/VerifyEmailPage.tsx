"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail } from "../../hooks/useUser.hook";
import { BiLoader } from "react-icons/bi";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

export function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutateAsync } = useVerifyEmail();
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("failure");
      return;
    }

    mutateAsync({ token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("failure"));
  }, [token, mutateAsync]);

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <BiLoader className="size-48 text-primary animate-spin" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <FiCheckCircle className="size-20 text-green-500" />
        <p className="text-2xl font-semibold text-green-600">Email Verified Successfully</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
      <FiXCircle className="size-20 text-red-500" />
      <p className="text-2xl font-semibold text-red-600">Verification Failed</p>
    </div>
  );
}
