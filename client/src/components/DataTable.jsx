import React from "react";
import { Inbox } from "lucide-react";

export default function DataTable({ columns, rows, rowKey = "_id", emptyMessage = "No records found", emptyHint }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[rowKey]} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle whitespace-nowrap text-gray-700 dark:text-gray-200">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
            <Inbox size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{emptyMessage}</p>
          {emptyHint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{emptyHint}</p>}
        </div>
      )}
    </div>
  );
}
