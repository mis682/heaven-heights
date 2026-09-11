import React from "react";
import { Filter, Search, Columns3 } from "lucide-react";
import ThemedSelect from "./ThemedSelect";

export default function FilterBar({ search, onSearchChange, placeholder = "Search...", filters, onColumns }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <button className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
        <Filter size={16} />
      </button>

      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {filters}

      {onColumns && (
        <button
          onClick={onColumns}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Columns3 size={16} />
          Columns
        </button>
      )}
    </div>
  );
}

export function Select(props) {
  return <ThemedSelect {...props} />;
}
