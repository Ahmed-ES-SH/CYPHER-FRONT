"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiArrowRight, FiX, FiLoader } from "react-icons/fi";
import Img from "@/app/_components/_global/Img";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useResetPassword } from "@/src/modules/auth";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const { send } = useResetPassword();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await send.mutateAsync({ email });

      setSuccess(true);
      toast.success("Reset email sent successfully , check your inbox");
      router.push("/signin");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [success]);

  return (
    <div
      style={{ minHeight: "80vh" }}
      className="c-container flex  items-center justify-center  relative overflow-hidden"
    >
      <div className="flex overflow-hidden  border border-gray-200 rounded-lg shadow-lg w-full items-start h-[70vh]">
        <div className="flex-1 h-full flex items-center justify-center">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6 w-full max-w-md p-6 bg-white "
          >
            {/* Header */}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Forgot your password?
              </h2>
              <p className="text-gray-500 whitespace-nowrap  text-xs">
                No worries — enter your email and we’ll send you a secure reset
                link.
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">EMAIL RECOVERY</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-300 ${
                    error ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="example@email.com"
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <FiX className="w-5 h-5 text-red-500" />
                  </motion.div>
                )}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <FiMail className="text-primary-blue mt-1" />
              <p className="text-sm text-gray-600">
                You’ll receive an email with instructions to reset your
                password.
              </p>
            </div>

            {/* Submit Button */}
            {success ? (
              <motion.button
                type="submit"
                disabled={resendTimer > 0}
                whileTap={{ scale: 0.98 }}
                className=" w-full bg-primary hover:bg-primary/80 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg  hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0
                  ? `Resend in ${resendTimer}`
                  : "Resend Reset Link"}
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary hover:bg-primary/80 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg  hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <FiArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link
                href="/signin"
                className="text-primary-blue font-medium hover:underline"
              >
                Back to login
              </Link>
            </div>
          </motion.form>
        </div>

        <div className="flex-1/4  relative border-l border-gray-300 shadow-xl">
          <Img
            src="/images/login-bg.png"
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
