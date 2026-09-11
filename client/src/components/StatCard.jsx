import React from "react";

export default function StatCard({ label, value, icon, color = "gray", active, onClick }) {
  const colorMap = {
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    orange: "bg-primary-light dark:bg-primary/20 text-primary",
  };

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors ${
        active ? "border-primary" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-subtext dark:text-gray-400">{label}</p>
        {icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-heading dark:text-gray-100 mt-2">{value}</p>
    </button>
  );
}

export function StatsCards({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {items.map((item, idx) => (
        <StatCard key={item.key ?? idx} {...item} />
      ))}
    </div>
  );
}
