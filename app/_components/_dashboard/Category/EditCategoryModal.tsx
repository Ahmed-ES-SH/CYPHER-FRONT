"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/src/modules/categories";
import { useCreateCategoryMutation, useUpdateCategoryMutation, normalizeSlug } from "@/src/modules/categories";
import CategoryImageUploader from "./CategoryImageUploader";

interface Props {
  category?: Category | null;
  onClose: () => void;
}

export default function EditCategoryModal({ category, onClose }: Props) {
  const isEdit = !!category;

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState<string | null>(category?.icon ?? null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setDescription(category?.description ?? "");
    setIcon(category?.icon ?? null);
  }, [category]);

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  useEffect(() => {
    // auto-generate slug when name changes and slug is empty or equal to normalized previous
    if (name && (!slug || slug === normalizeSlug(category?.name ?? ""))) {
      setSlug(normalizeSlug(name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const handleUpload = async (file: File) => {
    // For now, convert to data URL and return it. The backend expects a string for `icon`.
    setIsUploading(true);
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result));
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      setIcon(dataUrl);
      return dataUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreateCategoryInput | UpdateCategoryInput = {
      name: name.trim(),
      slug: slug.trim() || normalizeSlug(name),
      description: description || null,
      icon: icon || null,
    };

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({ id: category.id, input });
        toast.success("Category updated");
      } else {
        await createMutation.mutateAsync(input as CreateCategoryInput);
        toast.success("Category created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save category");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface-elevated rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{isEdit ? "Edit Category" : "Create Category"}</h2>
          <button onClick={onClose} className="text-text-muted">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-border-subtle p-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full rounded-md border border-border-subtle p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary">Description</label>
            <textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-md border border-border-subtle p-2" rows={4} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Image</label>
            <CategoryImageUploader current={icon ?? undefined} onUpload={handleUpload} isUploading={isUploading} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border-subtle px-4 py-2">Cancel</button>
            <button type="submit" className="rounded-md bg-primary-blue text-white px-4 py-2">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
