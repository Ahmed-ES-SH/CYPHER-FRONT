"use client";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaLinkedin,
  FaPinterest,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

interface CategoriesSocialProps {
  tags: string[];
}

export default function CategoriesSocial({ tags }: CategoriesSocialProps) {
  const socials = [
    { icon: FaFacebook, color: "bg-blue-600" },
    { icon: FaTwitter, color: "bg-blue-400" },
    { icon: FaPinterest, color: "bg-red-600" },
    { icon: FaLinkedin, color: "bg-blue-700" },
    { icon: FaWhatsapp, color: "bg-green-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="space-y-4"
    >
      <div>
        <span className="text-gray-600">Categories: </span>
        {tags &&
          tags.map((tag, index) => (
            <span
              key={index}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              {tag}
              <span
                className={`text-gray-600 ${
                  tags.length - 1 == index ? "hidden" : ""
                }`}
              >
                ,{" "}
              </span>
            </span>
          ))}
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-gray-600 font-medium">Share:</span>
        <div className="flex space-x-2">
          {socials.map((social, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-8 h-8 ${social.color} text-white rounded-full flex items-center justify-center text-sm hover:shadow-lg transition-all`}
            >
              <social.icon />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
