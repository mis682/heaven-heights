import React from "react";
import { Filter, Search, Columns3 } from "lucide-react";

export default function FilterBar({ search, onSearchChange, placeholder = "Search...", filters, onColumns }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <button className="p-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">
        <Filter size={16} />
      </button>

      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {filters}

      {onColumns && (
        <button
          onClick={onColumns}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Columns3 size={16} />
          Columns
        </button>
      )}
    </div>
  );
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  );
}
