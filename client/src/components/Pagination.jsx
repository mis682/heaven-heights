import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ThemedSelect from "./ThemedSelect";

export default function Pagination({ page, pageCount, onPageChange, pageSize, onPageSizeChange, totalItems }) {
  if (pageCount <= 1 && !onPageSizeChange) return null;

  const pageNumbers = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, start + 4);
  for (let p = start; p <= end; p++) pageNumbers.push(p);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
      <div className="flex items-center gap-2 text-sm text-subtext dark:text-gray-400">
        {typeof totalItems === "number" && <span>{totalItems} total</span>}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <ThemedSelect
              value={String(pageSize)}
              onChange={(v) => onPageSizeChange(Number(v))}
              options={["10", "25", "50", "100"]}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 flex items-center justify-between gap-2"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium ${
              p === page
                ? "bg-primary text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
