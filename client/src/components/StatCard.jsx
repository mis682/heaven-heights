import React from "react";

export default function StatCard({ label, value, icon, color = "gray", active, onClick }) {
  const colorMap = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-primary-light text-primary",
  };

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border bg-white p-4 shadow-sm transition-colors ${
        active ? "border-primary" : "border-gray-200 hover:border-gray-300"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-subtext">{label}</p>
        {icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-heading mt-2">{value}</p>
    </button>
  );
}
