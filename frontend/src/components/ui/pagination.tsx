import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // pages to show on each side of current
}

const range = (start: number, end: number) => {
  const res = [];
  for (let i = start; i <= end; i++) res.push(i);
  return res;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const totalNumbers = siblingCount * 2 + 5; // first, last, current, two ellipses
  const totalBlocks = totalNumbers;

  const paginationRange = React.useMemo(() => {
    if (totalPages <= totalBlocks) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    const pages: (number | string)[] = [];

    pages.push(1);

    if (showLeftEllipsis) {
      pages.push("...");
    } else {
      pages.push(...range(2, leftSiblingIndex - 1));
    }

    pages.push(...range(leftSiblingIndex, rightSiblingIndex));

    if (showRightEllipsis) {
      pages.push("...");
    } else {
      pages.push(...range(rightSiblingIndex + 1, totalPages - 1));
    }

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages, siblingCount, totalBlocks]);

  const onPrev = () => onPageChange(Math.max(1, currentPage - 1));
  const onNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center">
      <div className="inline-flex items-center space-x-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed border ${
            currentPage === 1
              ? "bg-transparent"
              : "hover:bg-[#8ac6dd]/90"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 16.293a1 1 0 010 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L8.414 10l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {paginationRange.map((p, idx) =>
          typeof p === "string" ? (
            <span key={`dots-${idx}`} className="px-2 text-sm text-muted-foreground">
              {p}
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`px-3 py-1 rounded-md text-sm font-medium border transition focus:outline-none ${
                p === currentPage
                  ? "bg-[#8ac6dd] text-[#042a2d] border-transparent"
                  : "bg-transparent hover:bg-[#8ac6dd]/10"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed border ${
            currentPage === totalPages
              ? "bg-transparent"
              : "hover:bg-[#8ac6dd]/90"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 3.707a1 1 0 010-1.414l6 6a1 1 0 010 1.414l-6 6A1 1 0 016.293 14.293L11.586 9 6.293 3.707a1 1 0 011.414-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
