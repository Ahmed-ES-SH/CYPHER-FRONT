"use client";

import { useState, useCallback } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

interface Props {
  current?: string | null;
  onUpload: (file: File) => Promise<string>;
  isUploading?: boolean;
}

export default function CategoryImageUploader({ current, onUpload, isUploading: isUploadingProp }: Props) {
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploading = isUploadingProp || isUploading;

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

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-md border-2 p-4 transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-border-subtle bg-surface-elevated"
      }`}
    >
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Category" className="h-20 w-20 object-cover rounded-md border" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPreview(null); }}
            className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white"
          >
            <FiX className="size-3" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <FiUploadCloud className="size-8 text-icon-color" />
          <div className="text-sm text-text-secondary">Drop image or click to upload</div>
          <div className="text-xs text-text-muted">PNG/JPG up to 5MB</div>
        </div>
      )}

      <input type="file" accept="image/*" onChange={handleInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
    </div>
  );
}
