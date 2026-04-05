"use client";

export default function VerifyingState() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
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
