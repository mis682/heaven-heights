import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";

function normalizeOptions(options) {
  return options.map((opt) => ({
    value: opt?.value ?? opt,
    label: opt?.label ?? opt,
  }));
}

export default function ThemedSelect({ value, onChange, options, placeholder, required, className, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const normalized = normalizeOptions(options || []);
  const selected = normalized.find((o) => String(o.value) === String(value));
  const showSearch = normalized.length > 8;
  const filtered = showSearch
    ? normalized.filter((o) => String(o.label).toLowerCase().includes(search.toLowerCase()))
    : normalized;

  useEffect(() => {
    if (!open) return;
    const updateCoords = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const GAP = 4;
      const MARGIN = 8;
      const PREFERRED = 320;
      const spaceBelow = window.innerHeight - rect.bottom - GAP - MARGIN;
      const spaceAbove = rect.top - GAP - MARGIN;
      // Open downward (like a native <select>) unless there isn't enough
      // room below but there IS more room above — otherwise a trigger near
      // the bottom of the viewport (e.g. the last rows of a long table)
      // pops open mostly or entirely off-screen.
      const openUpward = spaceBelow < 150 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(120, Math.min(PREFERRED, openUpward ? spaceAbove : spaceBelow));
      setCoords({
        left: rect.left,
        width: rect.width,
        maxHeight,
        ...(openUpward ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
      });
    };
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (triggerRef.current?.contains(e.target) || popupRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const pick = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={
          className ||
          "px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        <span className={`truncate ${!selected ? "text-gray-400 dark:text-gray-500" : ""}`}>
          {selected ? selected.label : placeholder || "Select"}
        </span>
        <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {required && <input tabIndex={-1} value={value || ""} onChange={() => {}} required className="sr-only" />}

      {open &&
        coords &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              minWidth: coords.width,
              maxHeight: coords.maxHeight,
            }}
            className="z-[60] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden animate-fade-in-down"
          >
            {showSearch && (
              <div className="p-2 border-b border-gray-100 dark:border-gray-700 shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filtered.length > 0) pick(filtered[0]);
                    }}
                    placeholder="Search..."
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-1">
              {placeholder && (
                <button
                  type="button"
                  onClick={() => pick({ value: "", label: placeholder })}
                  className="w-full text-left px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {placeholder}
                </button>
              )}
              {filtered.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => pick(opt)}
                    className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      isSelected ? "text-primary font-medium" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="shrink-0" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No options found</p>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
