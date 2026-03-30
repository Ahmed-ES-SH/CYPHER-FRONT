"use client";
import { motion } from "framer-motion";
import Img from "@/app/_components/_global/Img";

export default function SignInHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center mb-8"
    >
      <Img
        src="/logo.png"
        className="w-80 my-3  mx-auto object-contain"
      />
    </motion.div>
  );
}
