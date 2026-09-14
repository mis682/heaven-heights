import React from "react";

const STATUS_STYLES = {
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Present: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Half-day": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Absent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Skipped: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Leave: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  NA: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Holiday: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  "Not ok": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Timestamp missing": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Form not fill": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Blur image": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "wrong image": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  submitted: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Cleaned: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  "Not Cleaned": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  "Blur Image": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Timestamp Missing": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Form not filled": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Image missing": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Underconstraction: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  Clean: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  "Not Clean": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  "Image Missing": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Same image": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

export default function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}
