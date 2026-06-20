"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiMail } from "react-icons/fi";
import { createPortal } from "react-dom";

interface VerifyEmailPopupProps {
  email: string;
  redirectTo?: string;
  duration?: number;
  onClose?: () => void;
}

export default function VerifyEmailPopup({
  email,
  redirectTo = "/signin",
  duration = 5,
  onClose,
}: VerifyEmailPopupProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    if (countdown <= 0) {
      const timeout = setTimeout(() => {
        if (onClose) onClose();
        router.push(redirectTo);
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [countdown, redirectTo, router, onClose]);

  const content = (<AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-9999999 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-email-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <FiMail className="size-10 text-green-500" />
          </div>

          <h2
            id="verify-email-title"
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Check Your Email
          </h2>

          <p className="text-gray-500 mb-6">
            We&apos;ve sent a verification link to{" "}
            <strong className="text-gray-700">{email}</strong>. Please check
            your inbox and click the link to activate your account.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <FiMail className="size-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the email? Check your spam folder or try
                signing up again.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="text-primary-blue"
                  strokeDasharray={2 * Math.PI * 28}
                  initial={{
                    strokeDashoffset: 0,
                  }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 28,
                  }}
                  transition={{ duration, ease: "linear" }}
                />
              </svg>
              <span className="text-xl font-bold text-gray-900">
                {countdown}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Redirecting to sign in in{" "}
              <span className="font-semibold text-gray-700">
                {countdown}
              </span>{" "}
              {countdown === 1 ? "second" : "seconds"}...
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>)

    if (typeof window == undefined) return null; 


      return createPortal(content, document.body)
    
  
}