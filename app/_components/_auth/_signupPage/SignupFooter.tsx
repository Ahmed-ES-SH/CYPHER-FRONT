"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignupFooter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="text-center mt-6"
    >
      <p className="text-gray-600">
        Already have an account?{" "}
        <Link
          href={"/signin"}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
