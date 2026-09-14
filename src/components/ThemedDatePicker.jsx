import React from "react";
import { Calendar } from "lucide-react";

export default function ThemedDatePicker({ value, onChange, min, max, className, disabled, required }) {
  return (
    <div className={`relative ${className || ""}`}>
      <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="date"
        value={value || ""}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
        className="input pl-9"
      />
    </div>
  );
}
