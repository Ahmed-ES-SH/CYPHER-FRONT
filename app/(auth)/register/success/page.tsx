import { FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <FiCheckCircle className="size-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h1>
        <p className="text-gray-600 mb-6">
          Your account has been created successfully. Please check your email to verify your account.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
