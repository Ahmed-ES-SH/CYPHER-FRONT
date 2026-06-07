"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Global pagination component with numbered pages, ellipsis for large page counts,
 * and Previous/Next buttons. Uses project design tokens throughout.
 *
 * Usage with URL-based filters:
 *   <Pagination currentPage={page} totalPages={lastPage} onPageChange={(p) => updateFilter("page", String(p))} />
 *
 * Usage with state-based pagination:
 *   <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    // Pages around the current one
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  const btnBase =
    "inline-flex items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1";

  const btnSize = "min-w-[32px] h-8 sm:min-w-[36px] sm:h-9 px-2 text-sm";

  return (
    <nav aria-label="Pagination" className="w-full">
      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className={`${btnBase} ${btnSize} border-border-subtle text-text-secondary hover:bg-surface disabled:opacity-40 disabled:pointer-events-none`}
        >
          <FiChevronLeft className="size-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className={`${btnSize} flex items-center justify-center text-text-muted select-none`}
                  aria-hidden="true"
                >
                  &hellip;
                </span>
              );
            }

            const isActive = p === currentPage;

            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={isActive}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={`${btnBase} ${btnSize} ${
                  isActive
                    ? "bg-primary text-white border-primary font-semibold cursor-default"
                    : "border-border-subtle text-text-secondary hover:bg-surface hover:text-text-primary"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={`${btnBase} ${btnSize} border-border-subtle text-text-secondary hover:bg-surface disabled:opacity-40 disabled:pointer-events-none`}
        >
          <FiChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
