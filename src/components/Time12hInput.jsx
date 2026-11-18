import React from "react";
import ThemedSelect from "./ThemedSelect";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const SELECT_CLASS =
  "px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-1 w-[64px]";

function parseValue(value) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value || "");
  if (!m) return { hour: "12", minute: "00", period: "AM" };
  return { hour: m[1].padStart(2, "0"), minute: m[2], period: m[3].toUpperCase() };
}

// A plain <input type="time"> renders in 24-hour format on most
// browsers/OS locales (no AM/PM shown) — this gives full control so the
// AM/PM is always visible, storing the value as a plain "hh:mm AM/PM"
// string (the backend doesn't do any time math on it, just displays it).
export default function Time12hInput({ value, onChange, disabled }) {
  const { hour, minute, period } = parseValue(value);
  const emit = (h, m, p) => onChange(`${h}:${m} ${p}`);

  return (
    <div className="flex items-center gap-1.5">
      <ThemedSelect disabled={disabled} value={hour} onChange={(h) => emit(h, minute, period)} options={HOURS} className={SELECT_CLASS} />
      <span className="text-gray-400 dark:text-gray-500">:</span>
      <ThemedSelect disabled={disabled} value={minute} onChange={(m) => emit(hour, m, period)} options={MINUTES} className={SELECT_CLASS} />
      <ThemedSelect disabled={disabled} value={period} onChange={(p) => emit(hour, minute, p)} options={["AM", "PM"]} className={SELECT_CLASS} />
    </div>
  );
}
