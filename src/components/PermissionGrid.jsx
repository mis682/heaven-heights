import React from "react";
import { PERMISSION_MODULES } from "../constants/permissionModules";

export default function PermissionGrid({ permissions, onToggle, disabled }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Module</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-500">View</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-500">Edit</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-500">Delete</th>
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((m) => (
            <tr key={m.key} className="border-b border-gray-100 last:border-b-0">
              <td className="px-3 py-2">{m.label}</td>
              {["view", "edit", "delete"].map((action) => (
                <td key={action} className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={!!permissions[m.key]?.[action]}
                    onChange={() => onToggle(m.key, action)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
