"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RestPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // State for token verification
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // State for reset password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Password validation
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
        const response = await fetch(
          "http://localhost:5000/api/auth/rest-password/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
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
  }, [token]);

  // Validate password match and strength
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

  // Handle reset password submission
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsResetting(true);
    setResetError(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/rest-password/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword,
          }),
        },
      );

      if (response.ok) {
        setResetSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setResetError(
          errorData.message || "Failed to reset password. Please try again.",
        );
      }
    } catch (error) {
      console.error("Reset error:", error);
      setResetError("Network error. Please check your connection.");
    } finally {
      setIsResetting(false);
    }
  };

  // Loading screen
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-[#00b8db] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-gray-700">
            Verifying reset link...
          </h2>
          <p className="mt-2 text-gray-500">
            Please wait while we validate your request
          </p>
        </div>
      </div>
    );
  }

  // Token invalid or error
  if (tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 animate-fadeInUp">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
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
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-gray-600">{verifyError}</p>
            <button
              onClick={() => router.push("/forgot-password")}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#00b8db] hover:bg-[#009fbf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b8db] transition-all duration-300 transform hover:scale-105"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset success screen
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 animate-fadeInUp">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
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
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Password Reset Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Your password has been updated. Redirecting you to login page...
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#00b8db] hover:bg-[#009fbf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b8db] transition-all duration-300 transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  if (!tokenValid)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 animate-fadeInUp">
          <div className="px-8 pt-8 pb-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#00b8db]/10">
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
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Create New Password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please enter your new password below
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="relative">
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
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
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
              </div>

              {passwordError && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 animate-shake">
                  {passwordError}
                </div>
              )}

              {resetError && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                  {resetError}
                </div>
              )}

              <button
                type="submit"
                disabled={isResetting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-white bg-[#00b8db] hover:bg-[#009fbf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b8db] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isResetting ? (
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
              onClick={() => router.push("/login")}
              className="text-sm text-gray-600 hover:text-[#00b8db] transition-colors duration-200"
            >
              ← Back to Login
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out;
          }

          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
        `}</style>
      </div>
    );
}
