import React from "react";
import { User, CheckCircle2, XCircle, Trash2, Sun, Moon } from "lucide-react";
import { cloudinaryThumbnailUrl } from "../utils/cloudinary";

export default function PunchCell({ record, onPhotoClick, onDelete, canDelete }) {
  if (!record) return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>;

  return (
    <div className="flex items-center gap-2 group">
      {record.photo ? (
        <img
          src={cloudinaryThumbnailUrl(record.photo, 100)}
          alt=""
          className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 cursor-pointer shrink-0"
          onClick={() => onPhotoClick?.(record)}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
          <User size={14} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-heading dark:text-gray-100 flex items-center gap-1">
          {new Date(record.timestamp).toLocaleTimeString()}
          {record.shift === "day" && <Sun size={12} className="text-amber-500" />}
          {record.shift === "night" && <Moon size={12} className="text-indigo-500" />}
        </p>
        {record.latitude != null && (
          <a
            href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
            target="_blank"
            rel="noreferrer"
            title={record.address || `${record.latitude}, ${record.longitude}`}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary hover:underline line-clamp-1 max-w-[160px] block"
          >
            {record.address || `${record.latitude.toFixed(5)}, ${record.longitude.toFixed(5)}`}
          </a>
        )}
        {record.withinGeofence != null &&
          (record.withinGeofence ? (
            <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 text-xs">
              <CheckCircle2 size={12} /> On site
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
              <XCircle size={12} /> Off site
            </span>
          ))}
      </div>
      {canDelete && (
        <button
          onClick={() => onDelete(record)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 shrink-0"
          title="Delete this punch"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
