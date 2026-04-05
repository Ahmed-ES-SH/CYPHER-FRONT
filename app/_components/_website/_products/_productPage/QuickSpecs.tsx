"use client";
import { motion } from "framer-motion";
import { MdFeaturedPlayList } from "react-icons/md";

interface QuickSpecsProps {
  specs: {
    label: string;
    value: string;
  }[];
}

export default function QuickSpecs({ specs }: QuickSpecsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="bg-gray-50 rounded-lg p-6"
    >
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <MdFeaturedPlayList className="mr-2 text-blue-600" />
        Quick Specifications
      </h3>
      <div className="space-y-2">
        {specs.map((spec, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">{spec.label}:</span>
            <span className="font-medium text-gray-800">{spec.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
