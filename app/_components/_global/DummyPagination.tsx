"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

interface Props {
  page: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>;
}

export default function DummyPagination({ page, setPage, totalPages }: Props) {
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 4) {
        pages.push("start-ellipsis");
      }

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (page < totalPages - 3) {
        pages.push("end-ellipsis");
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

  return (
    <>
      {totalPages > 1 && (
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-md bg-primary-blue text-white disabled:bg-border-subtle flex items-center justify-center"
              aria-label="Previous Page"
            >
              <BsChevronLeft size={18} />
            </button>

            {pages.map((p, idx) => {
              if (typeof p === "string") {
                return (
                  <span
                    key={idx}
                    className="px-3 py-1 select-none text-text-muted cursor-default"
                  >
                    &hellip;
                  </span>
                );
              }

              return (
                <button
                  key={idx}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded-md ${
                    p === page
                      ? "bg-primary-blue text-white font-semibold"
                      : "hover:bg-primary-blue/10"
                  }`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-md bg-primary-blue text-white disabled:bg-border-subtle flex items-center justify-center"
              aria-label="Next Page"
            >
              <BsChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
