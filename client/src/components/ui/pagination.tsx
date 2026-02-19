import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type PaginationItem = number | "ellipsis";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
};

const buildPages = (page: number, totalPages: number): PaginationItem[] => {
  if (totalPages <= 1) return [1];

  const pages: PaginationItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }
  if (end < totalPages - 1) pages.push("ellipsis");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
};

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);
  const isBusy = isLoading;

  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      aria-busy={isBusy}
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1 || isBusy}
        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>
      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            disabled={isBusy}
            className={cn(
              "min-w-[2.25rem] rounded-md border px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
              item === page
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
            )}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || isBusy}
        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
      {isBusy && (
        <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading
        </span>
      )}
    </div>
  );
};

export default Pagination;
