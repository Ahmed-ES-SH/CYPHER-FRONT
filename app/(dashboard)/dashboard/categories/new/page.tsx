"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCreateCategoryMutation,
  normalizeSlug,
} from "@/src/modules/categories";
import CategoryImageUploader from "@/app/_components/_dashboard/Category/CategoryImageUploader";
import { FiArrowLeft, FiLoader } from "react-icons/fi";

export default function NewCategoryPage() {
  const router = useRouter();

  const createMutation = useCreateCategoryMutation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(normalizeSlug(name));
    }
  }, [name, slugManuallyEdited]);

  const handleUpload = async (file: File) => {
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Category name is required";
    if (!slug.trim()) errs.slug = "Slug is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        icon: icon || null,
      });
      toast.success("Category created successfully");
      router.push("/dashboard/categories");
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        const map: Record<string, string> = {};
        err.errors.forEach((it: any) => {
          if (it.field && it.message) map[it.field] = it.message;
        });
        setErrors(map);
      }
      toast.error(err?.message || "Failed to create category");
    }
  };

  const loading = createMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard/categories")}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-container-low transition-colors"
          aria-label="Back to categories"
        >
          <FiArrowLeft className="size-5" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-1">
            Add New Category
          </h2>
          <p className="text-sm text-text-secondary">
            Create a new product category for your store.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6"
      >
        {/* Basic Information */}
        <section className="bg-surface-elevated rounded-lg border border-border-subtle p-6 shadow-sm">
          <h3 className="text-base font-semibold text-text-primary mb-6 pb-4 border-b border-border-subtle">
            Basic Information
          </h3>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="field-name"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Category Name *
              </label>
              <input
                id="field-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Laptops, Headphones, Accessories"
                className={`w-full border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none transition-shadow bg-surface ${
                  errors.name
                    ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                autoFocus
              />
              {errors.name && (
                <p className="text-rose-600 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="field-slug"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                URL Slug
              </label>
              <div className="flex items-center">
                <span className="bg-gray-50 border border-r-0 border-border-subtle px-3 py-2 rounded-l-md text-xs text-text-secondary whitespace-nowrap">
                  cypher.com/categories/
                </span>
                <input
                  id="field-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setSlug(e.target.value);
                    if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
                  }}
                  placeholder="laptops"
                  className={`flex-1 border rounded-r-md px-3 py-2 text-sm text-text-primary focus:outline-none transition-shadow bg-surface ${
                    errors.slug
                      ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary"
                  }`}
                />
              </div>
              {errors.slug && (
                <p className="text-rose-600 text-xs mt-1">{errors.slug}</p>
              )}
              <p className="text-xs text-text-muted mt-1">
                Auto-generated from name. Edit to customize.
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="field-description"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Description{" "}
                <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <textarea
                id="field-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this category includes..."
                rows={3}
                className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface resize-none"
              />
            </div>
          </div>
        </section>

        {/* Category Image */}
        <section className="bg-surface-elevated rounded-lg border border-border-subtle p-6 shadow-sm">
          <h3 className="text-base font-semibold text-text-primary mb-6 pb-4 border-b border-border-subtle">
            Category Image
          </h3>

          <div>
            <p className="text-sm text-text-secondary mb-4">
              Upload an icon or image that represents this category.
            </p>
            <CategoryImageUploader
              current={icon ?? undefined}
              onUpload={handleUpload}
              isUploading={isUploading}
            />
          </div>
        </section>

        {/* Form Actions */}
        <div className="border-t border-border-subtle pt-5 mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/categories")}
            disabled={loading}
            className="px-5 py-2 rounded-md border border-border-subtle bg-surface-elevated text-text-primary text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-dark-navy transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="size-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              "Create Category"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
