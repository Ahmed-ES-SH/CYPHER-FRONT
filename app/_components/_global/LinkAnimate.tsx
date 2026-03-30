"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

interface props {
  title: string;
}

export default function LinkAnimate({ title }: props) {
  return (
    <Link className="text-primary-blue flex items-center gap-2" href={"/shop"}>
      <p>{title}</p>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: [0, 5, 0] }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.5, repeatType: "loop", repeat: Infinity }}
      >
        <FaArrowRight className="" />
      </motion.div>
    </Link>
  );
}
