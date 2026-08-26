import React from "react";

const STATUS_STYLES = {
  Completed: "bg-green-100 text-green-700",
  Present: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
  "Half-day": "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
  Absent: "bg-red-100 text-red-700",
  Skipped: "bg-gray-100 text-gray-600",
  Leave: "bg-gray-100 text-gray-600",
  NA: "bg-gray-100 text-gray-600",
  Holiday: "bg-gray-100 text-gray-600",
  "Not ok": "bg-amber-100 text-amber-700",
  "Timestamp missing": "bg-amber-100 text-amber-700",
  "Form not fill": "bg-amber-100 text-amber-700",
  "Blur image": "bg-amber-100 text-amber-700",
  "wrong image": "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-green-100 text-green-700",
  Cleaned: "bg-green-100 text-green-700",
  "Not Cleaned": "bg-red-100 text-red-700",
  "Blur Image": "bg-amber-100 text-amber-700",
  "Timestamp Missing": "bg-amber-100 text-amber-700",
  "Form not filled": "bg-amber-100 text-amber-700",
  "Image missing": "bg-amber-100 text-amber-700",
  Underconstraction: "bg-teal-100 text-teal-700",
  Clean: "bg-green-100 text-green-700",
  "Not Clean": "bg-red-100 text-red-700",
  "Image Missing": "bg-amber-100 text-amber-700",
  "Same image": "bg-amber-100 text-amber-700",
};

export default function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}
