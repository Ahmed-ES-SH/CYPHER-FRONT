"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignInFooter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="text-center mt-6"
    >
      <p className="text-gray-600">
        Don't have an account?{" "}
        <Link
          href={"/signup"}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
