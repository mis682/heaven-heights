import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Building2 } from "lucide-react";
import { NAV_SECTIONS } from "../layouts/navConfig";
import { useAuth } from "../context/AuthContext";

function pathsOf(item) {
  if (item.path) return [item.path];
  if (item.children) return item.children.flatMap(pathsOf);
  return [];
}

function NavItem({ item, collapsed, depth = 0, onNavigate }) {
  const location = useLocation();
  const descendantPaths = pathsOf(item);
  const isActiveBranch = descendantPaths.some((p) => location.pathname.startsWith(p));
  const [open, setOpen] = useState(isActiveBranch);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActiveBranch ? "text-primary" : "text-gray-600 hover:bg-gray-100"
          }`}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && (
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </button>
        {open && !collapsed && (
          <div className="mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavItem key={child.label} item={child} collapsed={collapsed} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg text-sm font-medium py-2 border-l-[3px] transition-colors ${
          isActive
            ? "border-primary text-primary bg-primary-light"
            : "border-transparent text-gray-600 hover:bg-gray-100"
        }`
      }
      style={{ paddingLeft: `${12 + depth * 12}px`, paddingRight: "12px" }}
    >
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const { user } = useAuth();
  const visible = (item) => !item.roles || item.roles.includes(user?.role);

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-[260px] shrink-0 border-r border-gray-200 bg-white flex flex-col transition-transform md:transition-all duration-200 ${
          collapsed ? "md:w-[64px]" : "md:w-[260px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center gap-2 px-4 h-16 border-b border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-heading leading-tight truncate">Heaven Heights</p>
              <p className="text-xs text-subtext leading-tight truncate">Company Portal</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id}>
              {!collapsed && section.label && (
                <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.filter(visible).map((item) => (
                  <NavItem key={item.label} item={item} collapsed={collapsed} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
