import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function ProfilePage() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
    }
    load();
  }, [token]);

  if (!profile) {
    return (
      <div className="text-sm text-slate-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-slate-400">
          View your login ID, contact details, and role.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-slate-400">Login ID</div>
            <div className="text-sm text-slate-50 font-mono">
              {profile.login_id}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Email</div>
            <div className="text-sm text-slate-50">
              {profile.email || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Phone</div>
            <div className="text-sm text-slate-50">
              {profile.phone || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Role</div>
            <div className="text-sm text-slate-50 uppercase">
              {profile.role}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
        Change password and profile editing UI to be implemented.
      </div>
    </div>
  );
}

