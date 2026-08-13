import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLES = ["Admin", "Security Manager", "Coordinator"];

export default function Login() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Coordinator");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setSubmitting(true);
    setError("");
    try {
      await login(name.trim(), role, password);
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-heading">Heaven Heights</h1>
          <p className="text-sm text-subtext">Company Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Nair"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                    role === r ? "border-primary bg-primary-light text-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Role ka password"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Logging in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
