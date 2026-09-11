import React from "react";
import { Construction } from "lucide-react";
import PageHeader from "../components/PageHeader";

export default function ComingSoon({ title }) {
  return (
    <div>
      <PageHeader title={title} subtitle="This module is on the roadmap." />
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
          <Construction size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Coming soon</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{title} isn't built out yet in this portal.</p>
      </div>
    </div>
  );
}
