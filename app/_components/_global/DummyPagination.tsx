"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Props {
  page: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>;
}

export default function DummyPagination({ page, setPage, totalPages }: Props) {
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis");
      }

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  useEffect(() => {
    window.scrollTo({
      top: 600,
      behavior: "smooth",
    });
  }, [page]);

  const pages = getPageNumbers();

  if (totalPages <= 1) return null;

  const btnBase =
    "inline-flex items-center justify-center  border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1";

  const btnSize = "min-w-[32px] h-8 sm:min-w-[36px] sm:h-9 px-2 text-sm";

  return (
    <nav aria-label="Pagination" className="w-full mt-4">
      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${btnBase} ${btnSize} border-border-subtle text-text-secondary hover:bg-surface disabled:opacity-40 disabled:pointer-events-none`}
        >
          <FiChevronLeft className="size-4" />
        </button>

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

            const isActive = p === page;

            return (
              <button
                key={p}
                onClick={() => setPage(p)}
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

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={`${btnBase} ${btnSize} border-border-subtle text-text-secondary hover:bg-surface disabled:opacity-40 disabled:pointer-events-none`}
        >
          <FiChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
