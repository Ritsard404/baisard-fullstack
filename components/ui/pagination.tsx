import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
}: PaginationProps) {
  // Calculate the range of page numbers to display
  const getPaginationItems = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 1) return pages;

    // Always add the first page
    pages.push(1);

    // Calculate start and end of the middle range
    let startPage = Math.max(2, currentPage - siblingCount);
    let endPage = Math.min(totalPages - 1, currentPage + siblingCount);

    // Add ellipsis before if needed
    if (startPage > 2) {
      pages.push("...");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis after if needed
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Always add the last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const items = getPaginationItems();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {items.map((item, index) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const pageNum = item as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="min-w-10 h-10"
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
