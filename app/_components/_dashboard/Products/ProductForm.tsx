"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
  validateCreateProduct,
  validateUpdateProduct,
  buildProductSlug,
} from "@/src/modules/products";
import { useCategories } from "@/src/modules/categories";
import type { CreateProductDto } from "@/src/modules/products";
import { FiInfo, FiDollarSign, FiImage, FiTruck, FiHash, FiX } from "react-icons/fi";

interface Props {
  productId?: string;
  onDone?: () => void;
}

export default function ProductForm({ productId, onDone }: Props) {
  const isEdit = Boolean(productId);
  const router = useRouter();

  const { data: product, isLoading: loadingProduct } = useAdminProduct(productId);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categories = [] } = useCategories();

  // Basic fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");

  // Pricing & inventory
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState(0);
  const [stock, setStock] = useState(0);
  const [minOrderQty, setMinOrderQty] = useState(1);

  // Category, brand & tags
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Media (URLs only)
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState("");

  // Shipping & dimensions
  const [weight, setWeight] = useState<number | "">("");
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [depth, setDepth] = useState<number | "">("");
  const [warranty, setWarranty] = useState("1yr");
  const [shippingClass, setShippingClass] = useState("standard");

  // Identifiers
  const [barcode, setBarcode] = useState("");

  const [isPublished, setIsPublished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slugManuallyEdited = useRef(false);

  // Populate form fields when editing an existing product
  useEffect(() => {
    if (!product) return;
    setTitle(product.title ?? "");
    setSlug(product.slug ?? "");
    setDescription(product.description ?? "");
    setSku(product.sku ?? "");
    setPrice(String(product.price ?? ""));
    setDiscount(product.discountPercentage ?? 0);
    setStock(product.stock ?? 0);
    setMinOrderQty(product.minimumOrderQuantity ?? 1);
    setCategoryId(product.categoryId ?? "");
    setBrand(product.brand ?? "");
    setTags(product.tags ?? []);

    const primary = product.media?.find((m) => m.isPrimary);
    setThumbnailUrl(primary?.url ?? product.thumbnail ?? "");
    const rest = product.media?.filter((m) => !m.isPrimary).map((m) => m.url) ?? [];
    setGalleryUrls(rest);

    setWeight(product.weight ?? "");
    if (product.dimensions) {
      setWidth(product.dimensions.width || "");
      setHeight(product.dimensions.height || "");
      setDepth(product.dimensions.depth || "");
    }
    setIsPublished(Boolean(product.isPublished));
  }, [product]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited.current) {
      setSlug(buildProductSlug(title || ""));
    }
  }, [title]);

  const confirmPublish = () => {
    if (confirmingPublish) {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      setConfirmingPublish(false);
      setIsPublished(true);
      handleSubmit();
    } else {
      setConfirmingPublish(true);
      confirmTimer.current = setTimeout(() => setConfirmingPublish(false), 3000);
    }
  };

  const handleCancel = () => {
    if (onDone) return onDone();
    router.push("/dashboard/products");
  };

  const addTag = (t: string) => {
    const v = t.trim().toLowerCase();
    if (!v || tags.includes(v)) return;
    setTags((s) => [...s, v]);
  };

  const removeTag = (t: string) => setTags((s) => s.filter((x) => x !== t));

  const addGalleryUrl = () => {
    const url = galleryInput.trim();
    if (!url) return;
    setGalleryUrls((prev) => [...prev, url]);
    setGalleryInput("");
  };

  const removeGalleryUrl = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    const media: { url: string; alt?: string; isPrimary?: boolean }[] = [];
    if (thumbnailUrl.trim()) {
      media.push({ url: thumbnailUrl.trim(), alt: title.trim(), isPrimary: true });
    }
    galleryUrls.filter((u) => u.trim()).forEach((url) => {
      if (!media.find((m) => m.url === url.trim())) {
        media.push({ url: url.trim() });
      }
    });

    const dto: CreateProductDto & Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      sku: sku.trim(),
      price: Number(price) || 0,
      discountPercentage: Number(discount) || 0,
      stock: Number(stock) || 0,
      minimumOrderQuantity: Number(minOrderQty) || 1,
      categoryId,
      brand: brand.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      media: media.length > 0 ? media : undefined,
      weight: typeof weight === "number" ? weight : undefined,
      dimensions:
        width || height || depth
          ? {
              width: Number(width) || 0,
              height: Number(height) || 0,
              depth: Number(depth) || 0,
            }
          : undefined,
      isPublished,
      barcode: barcode.trim() || undefined,
    };

    try {
      if (isEdit) {
        const validation = validateUpdateProduct(dto);
        if (validation.length) {
          const map: Record<string, string> = {};
          validation.forEach((it) => (map[it.field] = it.message));
          setErrors(map);
          return;
        }
        await updateMutation.mutateAsync({ id: productId!, dto });
        toast.success("Product updated");
      } else {
        const validation = validateCreateProduct(dto);
        if (validation.length) {
          const map: Record<string, string> = {};
          validation.forEach((it) => (map[it.field] = it.message));
          setErrors(map);
          return;
        }
        await createMutation.mutateAsync(dto as CreateProductDto);
        toast.success("Product created");
      }

      if (onDone) onDone();
      else router.push("/dashboard/products");
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        const map: Record<string, string> = {};
        err.errors.forEach((it: any) => {
          if (it.field && it.message) map[it.field] = it.message;
        });
        setErrors(map);
      }
      toast.error(err?.message || "Failed to save product");
    }
  };

  const loading = loadingProduct || createMutation.isPending || updateMutation.isPending;

  const validateField = (field: string, value: string | number): string | null => {
    switch (field) {
      case "title":
        return !String(value).trim() ? "Title is required" : null;
      case "description":
        return !String(value).trim() ? "Description is required" : null;
      case "sku":
        return !String(value).trim() ? "SKU is required" : null;
      case "price":
        return value === "" || Number(value) < 0 ? "Price must be non-negative" : null;
      case "stock":
        return value === "" || Number(value) < 0 ? "Stock must be non-negative" : null;
      case "categoryId":
        return !value ? "Category is required" : null;
      case "thumbnailUrl":
        return value && !/^https?:\/\/.+/.test(String(value)) ? "Enter a valid URL" : null;
      case "barcode":
        return value && !/^[\d]{8,13}$/.test(String(value)) ? "Enter 8-13 digits" : null;
      default:
        return null;
    }
  };

  const handleBlur = (field: string, value: string | number) => {
    const msg = validateField(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const markBroken = (url: string) => {
    setBrokenImages((prev) => new Set(prev).add(url));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Basic Information ── */}
      <section className="bg-surface-elevated rounded-lg border border-border-subtle p-6 shadow-sm">
        <div className="border-b border-border-subtle pb-4 mb-6">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <FiInfo className="text-icon-color text-[20px]" />
            Basic Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Product Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur("title", title)}
                placeholder="e.g. Next-Gen Quantum Processor X9"
                aria-describedby={errors.title ? "error-title" : undefined}
                className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
              />
            {errors.title && <p id="error-title" className="text-rose-600 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">URL Slug</label>
            <div className="flex items-center">
              <span className="bg-gray-50 border border-r-0 border-border-subtle px-3 py-2 rounded-l-md text-xs text-text-secondary whitespace-nowrap">
                cypher.com/p/
              </span>
              <input
                value={slug}
                onChange={(e) => {
                  slugManuallyEdited.current = true;
                  setSlug(e.target.value);
                }}
                className="flex-1 border border-border-subtle rounded-r-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
                placeholder="quantum-processor-x9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Category *</label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                onBlur={() => handleBlur("categoryId", categoryId)}
                aria-describedby={errors.categoryId ? "error-categoryId" : undefined}
                className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface appearance-none"
              >
                <option value="">Select a category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-icon-color">
                expand_more
              </span>
            </div>
            {errors.categoryId && <p id="error-categoryId" className="text-rose-600 text-xs mt-1">{errors.categoryId}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. CYPHER, Intel, NVIDIA"
              className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Short Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleBlur("description", description)}
                placeholder="A brief technical overview for the product card..."
                rows={3}
                aria-describedby={errors.description ? "error-description" : undefined}
                className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface resize-none"
              />
            {errors.description && <p id="error-description" className="text-rose-600 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>
      </section>

      {/* ── Pricing & Inventory ── */}
      <section className="bg-surface-elevated rounded-lg border border-border-subtle p-6 shadow-sm">
        <div className="border-b border-border-subtle pb-4 mb-6">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <FiDollarSign className="text-icon-color text-[20px]" />
            Pricing & Inventory
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">Base Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                $
              </span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => handleBlur("price", price)}
                placeholder="0.00"
                type="number"
                aria-describedby={errors.price ? "error-price" : undefined}
                className="w-full border border-border-subtle rounded-md pl-8 pr-3 py-2 text-sm font-medium text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
              />
            </div>
            {errors.price && <p id="error-price" className="text-rose-600 text-xs mt-1">{errors.price}</p>}
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">Discount (%)</label>
            <div className="relative">
              <input
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                type="number"
                className="w-full border border-border-subtle rounded-md pr-8 pl-3 py-2 text-sm font-medium text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface text-right"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">%</span>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">Stock Quantity *</label>
              <input
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                onBlur={() => handleBlur("stock", stock)}
                placeholder="0"
                type="number"
                aria-describedby={errors.stock ? "error-stock" : undefined}
                className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
              />
            {errors.stock && <p id="error-stock" className="text-rose-600 text-xs mt-1">{errors.stock}</p>}
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">Min Order Qty</label>
            <input
              value={minOrderQty}
              onChange={(e) => setMinOrderQty(Number(e.target.value))}
              placeholder="1"
              type="number"
              className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
            />
          </div>

          <div className="col-span-4 border-t border-border-subtle pt-6 mt-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Internal SKU *</label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                onBlur={() => handleBlur("sku", sku)}
                placeholder="e.g. CPHR-COMP-X9-001"
                aria-describedby={errors.sku ? "error-sku" : undefined}
                className="w-full max-w-md border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface font-mono"
              />
            {errors.sku && <p id="error-sku" className="text-rose-600 text-xs mt-1">{errors.sku}</p>}
          </div>
        </div>
      </section>

      {/* ── Media Assets ── */}
      <section className="bg-surface-elevated rounded-lg border border-border-subtle p-6 shadow-sm">
        <div className="border-b border-border-subtle pb-4 mb-6 flex justify-between items-center">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <FiImage className="text-icon-color text-[20px]" />
            Media Assets
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">Primary Thumbnail URL</label>
            {thumbnailUrl ? (
              <div className="relative rounded-md overflow-hidden h-40 border border-border-subtle mb-4">
                {brokenImages.has(thumbnailUrl) ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs text-text-secondary">
                    Failed to load
                  </div>
                ) : (
                  <img src={thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" onError={() => markBroken(thumbnailUrl)} />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailUrl("");
                    setBrokenImages((prev) => { const n = new Set(prev); n.delete(thumbnailUrl); return n; });
                  }}
                  aria-label="Remove thumbnail"
                  className="absolute top-1 right-1 rounded-full bg-rose-600 p-1 text-white"
                >
                  <FiX size={12} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center h-40 mb-4">
                <FiImage className="text-icon-color text-[32px] mb-2" />
                <p className="text-xs text-text-secondary">No thumbnail set</p>
              </div>
            )}
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              onBlur={() => handleBlur("thumbnailUrl", thumbnailUrl)}
              placeholder="https://images.example.com/thumb.jpg"
              className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
            />
          </div>

          <div className="col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Gallery Image URLs</label>
            <div className="flex gap-2 mb-4">
              <input
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGalleryUrl();
                  }
                }}
                placeholder="https://images.example.com/gallery-1.jpg"
                className="flex-1 border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
              />
              <button
                type="button"
                onClick={addGalleryUrl}
                className="px-6 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-dark-navy transition-colors shadow-sm whitespace-nowrap"
              >
                Add URL
              </button>
            </div>

            {galleryUrls.length === 0 ? (
              <div className="flex gap-4 overflow-x-auto py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-24 h-24 rounded-md border border-border-subtle bg-gray-50 flex items-center justify-center"
                  >
                    <span className="text-xs text-text-secondary">Empty</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 flex-wrap">
                {galleryUrls.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="w-24 h-24 rounded-md border border-border-subtle overflow-hidden relative group"
                  >
                    {brokenImages.has(url) ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[10px] text-text-secondary">Broken</div>
                    ) : (
                      <img src={url} alt={`gallery ${i}`} className="w-full h-full object-cover" onError={() => markBroken(url)} />
                    )}
                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(i)}
                      aria-label={`Remove gallery image ${i + 1}`}
                      className="absolute -top-1 -right-1 rounded-full bg-rose-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Shipping & Warranty ── */}
      <section className="bg-surface-elevated rounded-lg border border-border-subtle p-6 shadow-sm">
        <div className="border-b border-border-subtle pb-4 mb-6">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <FiTruck className="text-icon-color text-[20px]" />
            Shipping & Warranty
          </h3>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Package Weight (kg)</label>
              <input
                value={weight === "" ? "" : String(weight)}
                onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0.00"
                type="number"
                className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Warranty Type</label>
              <div className="relative">
                <select
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface appearance-none"
                >
                  <option value="1yr">1 Year Standard</option>
                  <option value="3yr">3 Year Extended</option>
                  <option value="lifetime">Lifetime Guarantee</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-icon-color">
                  expand_more
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Shipping Class</label>
              <div className="relative">
                <select
                  value={shippingClass}
                  onChange={(e) => setShippingClass(e.target.value)}
                  className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface appearance-none"
                >
                  <option value="standard">Standard Electronic</option>
                  <option value="fragile">Fragile Handling</option>
                  <option value="heavy">Heavy Freight</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-icon-color">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-6">
            <p className="text-sm font-medium text-text-secondary mb-2">Package Dimensions (cm)</p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs text-text-secondary mb-2">Width</label>
                <input
                  value={width === "" ? "" : String(width)}
                  onChange={(e) => setWidth(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  type="number"
                  className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-2">Height</label>
                <input
                  value={height === "" ? "" : String(height)}
                  onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  type="number"
                  className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-2">Depth</label>
                <input
                  value={depth === "" ? "" : String(depth)}
                  onChange={(e) => setDepth(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  type="number"
                  className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Identifiers & Tags ── */}
      <section className="bg-surface-elevated rounded-lg border border-border-subtle p-6 shadow-sm">
        <div className="border-b border-border-subtle pb-4 mb-6">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <FiHash className="text-icon-color text-[20px]" />
            Identifiers & Tags
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Barcode (UPC/EAN)</label>
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onBlur={() => handleBlur("barcode", barcode)}
                placeholder="8–13 digit UPC or EAN"
                className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Search Tags</label>
            <input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              className="w-full border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow bg-surface"
              placeholder="Press Enter to add tags..."
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-gray-50 px-2 py-1 rounded border border-border-subtle text-xs flex items-center gap-1"
                >
                  {t}
                  <button type="button" onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`} className="text-rose-600 hover:text-red-700">
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-24" />

      {/* ── Sticky Action Bar ── */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-surface-elevated border-t border-border-subtle p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-end items-center gap-4">
        <p className="mr-auto text-xs text-text-secondary flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full inline-block ${isPublished ? "bg-green-500" : "bg-gray-300"}`}
          />
          Status: {isPublished ? "Published" : "Draft"}
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirmTimer.current) clearTimeout(confirmTimer.current);
            setConfirmingPublish(false);
            setIsPublished(false);
            handleSubmit();
          }}
          disabled={loading}
          className="px-6 py-2 rounded-md border border-border-subtle bg-surface-elevated text-text-primary text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={confirmPublish}
          disabled={loading || confirmingPublish}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 ${
            confirmingPublish
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-primary text-white hover:bg-dark-navy"
          }`}
        >
          {loading ? "Saving..." : confirmingPublish ? "Confirm Publish?" : isEdit ? "Save Changes" : "Publish Product"}
        </button>
      </div>
    </form>
  );
}
