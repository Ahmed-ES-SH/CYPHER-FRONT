"use client";
import { motion } from "framer-motion";
import Img from "@/app/_components/_global/Img";

export default function SignupHeader() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-4"
      >
        <Img
          src="/logo.png"
          className="w-60 my-3  mx-auto object-contain"
        />
      </motion.div>
      <div className="text-center my-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
        <p className="text-gray-600">Sign up by your account</p>
      </div>
    </>
  );
}
