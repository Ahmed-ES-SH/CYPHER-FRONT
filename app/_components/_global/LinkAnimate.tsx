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
    <Link className="text-primary-blue flex items-center gap-2 font-medium text-[14px] group" href={"/shop"}>
      <p>{title}</p>
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
      </motion.div>
    </Link>
  );
}
