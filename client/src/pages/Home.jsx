import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Shield, Clock, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NON_COORDINATOR_ROLES = ["Admin", "Security Manager"];

const TILES = [
  { label: "Housekeeping", path: "/housekeeping", icon: Sparkles, color: "bg-primary-light text-primary", roles: NON_COORDINATOR_ROLES },
  { label: "Patrol Checkpoints", path: "/security/patrol/garden-city/submissions", icon: Shield, color: "bg-blue-100 text-blue-600" },
  { label: "Night Guard", path: "/security/night-guard/daily-report", icon: Shield, color: "bg-gray-100 text-gray-600" },
  { label: "Attendance", path: "/attendance", icon: Clock, color: "bg-green-100 text-green-600", roles: NON_COORDINATOR_ROLES },
];

export default function Home() {
  const { user } = useAuth();
  const tiles = TILES.filter((t) => !t.roles || t.roles.includes(user?.role));

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">Welcome back, {user?.name}</h1>
      <p className="text-sm text-subtext mt-1">Logged in as {user?.role}. Jump into a module below.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {tiles.map((tile) => (
          <Link
            key={tile.path}
            to={tile.path}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-primary transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${tile.color}`}>
              <tile.icon size={18} />
            </div>
            <p className="font-semibold text-heading">{tile.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
