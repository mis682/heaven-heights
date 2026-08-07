import React from "react";
import { Menu, Sun, Moon, Maximize, Bell, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const TEAM_AVATARS = ["A", "R", "P", "S"];

export default function Topbar({ onToggleSidebar }) {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <header className="h-16 sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3">
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Fullscreen">
          <Maximize size={18} />
        </button>

        <div className="flex items-center -space-x-2">
          {TEAM_AVATARS.map((initial, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600"
            >
              {initial}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-xs font-semibold">
            +5
          </div>
        </div>

        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 relative" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-semibold text-sm">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-sm font-semibold text-heading">{user?.name || "User"}</p>
            <p className="text-xs text-subtext">{user?.role || "Guest"}</p>
          </div>
          <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
