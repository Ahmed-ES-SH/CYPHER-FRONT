"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useAdminBlogPost,
  useCreateBlogPost,
  useUpdateBlogPost,
  generateExcerpt,
  normalizeSlug,
} from "@/src/modules/blog";
import type { CreateArticleInput } from "@/src/modules/blog";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdLooksOne,
  MdLooksTwo,
  MdFormatQuote,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdLink,
  MdImage,
  MdCode,
  MdAddPhotoAlternate,
  MdExpandMore,
  MdClose,
  MdDelete,
} from "react-icons/md";

interface Props {
  postId?: string;
  onDone?: () => void;
}

const CATEGORY_OPTIONS = [
  { id: "product-updates", name: "Product Updates" },
  { id: "technical-deep-dives", name: "Technical Deep Dives" },
  { id: "industry-news", name: "Industry News" },
  { id: "tutorials", name: "Tutorials" },
];

const AUTHOR_OPTIONS = [
  { id: "admin", name: "Admin User" },
  { id: "system", name: "System Account" },
];

export default function BlogEditor({ postId, onDone }: Props) {
  const isEdit = Boolean(postId);
  const router = useRouter();

  const { data: post, isLoading: loadingPost } = useAdminBlogPost(postId);
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTitleDirty, setIsTitleDirty] = useState(false);

  const autoResizeTitle = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    if (titleRef.current) {
      autoResizeTitle(titleRef.current);
    }
  }, [title]);

  useEffect(() => {
    if (post) {
      setTitle(post.title ?? "");
      setContent(post.content ?? "");
      setExcerpt(post.excerpt ?? "");
      setCategoryId(post.category?.id ?? "");
      setFeaturedImage(post.featuredImage ?? null);
      setStatus(post.status as "draft" | "published" ?? "draft");
      setTags(post.tags?.map(t => t.name) ?? []);
      setSlug(post.slug ?? normalizeSlug(post.title ?? ""));
      setIsTitleDirty(true);
    }
  }, [post]);

  useEffect(() => {
    if (title && !isTitleDirty && !isEdit) {
      setSlug(normalizeSlug(title));
    }
  }, [title, isTitleDirty, isEdit]);

  const addTag = (tag: string) => {
    const t = tag.trim().replace(/,$/, "");
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleTagPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const splitted = pasted.split(/[,]+/).map(s => s.trim()).filter(Boolean);
    setTags(prev => [...new Set([...prev, ...splitted])]);
  };

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const url = URL.createObjectURL(file);
    setFeaturedImage(url);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = "";
  };

  const removeImage = () => {
    setFeaturedImage(null);
  };

  const execFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value ?? undefined);
    contentRef.current?.focus();
  }, []);

  const syncContent = useCallback(() => {
    if (contentRef.current) {
      const html = contentRef.current.innerHTML;
      if (html !== content) {
        setContent(html);
      }
    }
  }, [content]);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    const textContent = contentRef.current?.textContent?.trim() ?? "";
    if (!textContent) errs.content = "Content is required";
    if (!categoryId.trim()) errs.category = "Category is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [title, categoryId]);

  const handleSubmit = async (publishStatus: "draft" | "published") => {
    syncContent();

    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    const finalContent = contentRef.current?.innerHTML || content;
    const finalExcerpt = excerpt || generateExcerpt(finalContent);

    const dto: CreateArticleInput & Record<string, unknown> = {
      title: title.trim(),
      content: finalContent,
      excerpt: finalExcerpt,
      featuredImage: featuredImage || null,
      categoryId,
      tagIds: tags,
      status: publishStatus,
    };

    if (slug) {
      dto.slug = normalizeSlug(slug);
    }
    if (metaDescription) {
      dto.metaDescription = metaDescription;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: postId!, input: dto });
        toast.success(publishStatus === "published" ? "Post published" : "Draft updated");
      } else {
        await createMutation.mutateAsync(dto);
        toast.success(publishStatus === "published" ? "Post published" : "Draft created");
      }

      if (onDone) return onDone();
      router.push("/dashboard/blog");
    } catch (err: any) {
      const msg = err?.message || "Failed to save post";
      toast.error(msg);
    }
  };

  const loading = loadingPost || createMutation.isPending || updateMutation.isPending;

  const seoTitle = title ? `${title} — CYPHER` : "Post Title Here — CYPHER";
  const seoUrl = slug
    ? `https://cypher.com/blog/${slug}`
    : "https://cypher.com/blog/your-post-slug";
  const seoDesc = metaDescription || (contentRef.current
    ? generateExcerpt(contentRef.current.textContent ?? "", 160)
    : "Your meta description appears here in search results. Add a concise summary to encourage clicks.");

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex flex-1 min-h-0">
        {/* Left: Writing Canvas */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle">
          {/* Toolbar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border-subtle px-4 py-1.5 flex items-center gap-0.5 overflow-x-auto">
            <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-border-subtle">
              <ToolbarButton onClick={() => execFormat("bold")} title="Bold"><MdFormatBold size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => execFormat("italic")} title="Italic"><MdFormatItalic size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => execFormat("underline")} title="Underline"><MdFormatUnderlined size={18} /></ToolbarButton>
            </div>
            <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-border-subtle">
              <ToolbarButton onClick={() => execFormat("formatBlock", "<h1>")} title="Heading 1"><MdLooksOne size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => execFormat("formatBlock", "<h2>")} title="Heading 2"><MdLooksTwo size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => execFormat("formatBlock", "<blockquote>")} title="Quote"><MdFormatQuote size={18} /></ToolbarButton>
            </div>
            <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-border-subtle">
              <ToolbarButton onClick={() => execFormat("insertUnorderedList")} title="Bullet list"><MdFormatListBulleted size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => execFormat("insertOrderedList")} title="Numbered list"><MdFormatListNumbered size={18} /></ToolbarButton>
            </div>
            <div className="flex items-center gap-0.5">
              <ToolbarButton onClick={() => {
                const url = prompt("Enter URL:", "https://");
                if (url) execFormat("createLink", url);
              }} title="Insert link"><MdLink size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Insert image"><MdImage size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => execFormat("formatBlock", "<pre>")} title="Code block"><MdCode size={18} /></ToolbarButton>
            </div>
          </div>

          {/* Editor Canvas */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 lg:px-10 xl:px-16 py-8 lg:py-12">
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onInput={(e) => autoResizeTitle(e.currentTarget)}
                rows={1}
                placeholder="Enter post title..."
                className={`w-full bg-transparent border-none text-3xl font-bold text-text-primary placeholder:text-text-muted focus:ring-0 focus:outline-none resize-none overflow-hidden p-0 mb-6 ${
                  errors.title ? "ring-2 ring-rose-400/30 rounded" : ""
                }`}
              />
              {errors.title && (
                <p className="text-rose-600 text-xs -mt-4 mb-4">{errors.title}</p>
              )}

              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncContent}
                onBlur={syncContent}
                data-placeholder="Start writing or type '/' for commands..."
                className={`editor-content w-full min-h-[400px] outline-none text-base text-text-primary leading-relaxed ${
                  errors.content
                    ? "ring-2 ring-rose-400/30 rounded p-3 -m-3"
                    : ""
                }`}
                dangerouslySetInnerHTML={{ __html: content }}
              />
              {errors.content && (
                <p className="text-rose-600 text-xs mt-2">{errors.content}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Settings Sidebar */}
        <aside className="w-80 xl:w-96 shrink-0 bg-white flex flex-col border-l border-border-subtle overflow-y-auto">
          {/* Action Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-border-subtle p-4 flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="flex-1 bg-surface border border-border-subtle text-primary text-sm font-medium py-2.5 px-4 rounded-md hover:bg-gray-50 transition-colors text-center disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={loading}
              className="flex-1 bg-primary text-white text-sm font-medium py-2.5 px-4 rounded-md hover:bg-dark-navy transition-colors text-center shadow-sm disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Cover Image */}
            <section>
              <h3 className="text-base font-semibold text-text-primary mb-3">Cover Image</h3>
              {featuredImage ? (
                <div className="relative rounded-md overflow-hidden border border-border-subtle group">
                  <img
                    src={featuredImage}
                    alt="Cover"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "";
                      setFeaturedImage(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleImageDrop}
                  onDragOver={handleImageDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center p-6 text-center min-h-[140px]"
                >
                  <MdAddPhotoAlternate size={32} className="text-icon-color mb-2" />
                  <p className="text-sm text-text-secondary font-medium">Click to upload</p>
                  <p className="text-xs text-text-muted mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageInput}
              />
            </section>

            <hr className="border-border-subtle" />

            {/* Category & Author */}
            <section className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Category</label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={`w-full appearance-none bg-surface border rounded-md py-2 pl-3 pr-10 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer ${
                      errors.category ? "border-rose-400" : "border-border-subtle"
                    }`}
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <MdExpandMore size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-icon-color pointer-events-none" />
                </div>
                {errors.category && (
                  <p className="text-rose-600 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Author</label>
                <div className="relative">
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full appearance-none bg-surface border border-border-subtle rounded-md py-2 pl-3 pr-10 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Select author</option>
                    {AUTHOR_OPTIONS.map((author) => (
                      <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                  </select>
                  <MdExpandMore size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-icon-color pointer-events-none" />
                </div>
              </div>
            </section>

            <hr className="border-border-subtle" />

            {/* Tags */}
            <section>
              <h3 className="text-base font-semibold text-text-primary mb-1">Tags</h3>
              <p className="text-xs text-text-muted mb-3">Separate with commas</p>
              <div className="bg-surface border border-border-subtle rounded-md p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-gray-50 text-text-primary text-xs py-1 px-2.5 rounded-full border border-border-subtle"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-rose-600 transition-colors flex"
                      >
                        <MdClose size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onPaste={handleTagPaste}
                  placeholder={tags.length === 0 ? "Add a tag..." : ""}
                  className="w-full bg-transparent border-none text-sm text-text-primary focus:ring-0 p-0.5 placeholder:text-text-muted"
                />
              </div>
            </section>

            <hr className="border-border-subtle" />

            {/* SEO Preview */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-text-primary">SEO Preview</h3>
                <span className="text-xs text-primary">Edit</span>
              </div>
              <div className="bg-surface border border-border-subtle rounded-md p-3">
                <div className="text-sm text-blue-600 truncate mb-0.5">
                  {seoUrl}
                </div>
                <div className="text-base font-medium text-[#1a0dab] truncate mb-0.5">
                  {seoTitle}
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {seoDesc}
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Custom URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsTitleDirty(true);
                    }}
                    placeholder="e.g. new-hardware-release"
                    className="w-full bg-surface border border-border-subtle rounded-md py-2 px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Optional brief summary..."
                    rows={2}
                    className="w-full bg-surface border border-border-subtle rounded-md py-2 px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
    >
      {children}
    </button>
  );
}
