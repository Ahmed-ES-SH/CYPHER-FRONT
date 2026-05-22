"use client";
import { motion } from "framer-motion";
import Img from "@/app/_components/_global/Img";
import { getAuthConfig, AUTH_ENDPOINTS } from "@/src/modules/auth";

export default function SocialLogin() {
  const { apiUrl } = getAuthConfig();

  const handleGoogleSignIn = () => {
    window.location.href = `${apiUrl}${AUTH_ENDPOINTS.GOOGLE}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-3 mb-6"
    >
      <button
        onClick={handleGoogleSignIn}
        className=" hover:scale-[103%] hover:bg-primary hover:text-white w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-3 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-center gap-3  ">
          <Img src="/google.png" className="w-5 h-5 object-contain" />
          <span className="w-[180px]">Continue with Google</span>
        </div>
      </button>
    </motion.div>
  );
}
