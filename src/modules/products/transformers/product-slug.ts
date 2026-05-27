export function buildProductSlug(title: string, existingSlug?: string): string {
  if (existingSlug && existingSlug.trim().length > 0) return existingSlug;

  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}
