"use client";

import { useState, useCallback } from "react";
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";

interface AvatarUploaderProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<string>;
}

export default function AvatarUploader({ currentAvatar, onUpload }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        setPreview(url);
      } catch {
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRemovePreview = () => setPreview(null);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Avatar preview"
            className="size-24 rounded-full object-cover border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemovePreview}
            className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600 transition-colors"
          >
            <FiX className="size-3" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-gray-100 p-4">
            {isUploading ? (
              <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <FiUploadCloud className="size-8 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={isUploading}
      />
    </div>
  );
}
