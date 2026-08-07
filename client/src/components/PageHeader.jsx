import React from "react";

export default function PageHeader({ title, subtitle, primaryAction, secondaryActions = [] }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">{title}</h1>
        {subtitle && <p className="text-sm text-subtext mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {secondaryActions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-orange-600"
          >
            {primaryAction.icon}
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
