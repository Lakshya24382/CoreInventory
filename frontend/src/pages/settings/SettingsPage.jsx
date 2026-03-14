import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function SettingsPage() {
  const { token } = useAuth();
  const [generated, setGenerated] = useState([]);
  const [count, setCount] = useState(1);

  const generateLoginIds = async () => {
    const res = await fetch(`${API_BASE}/users/staff-login-ids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ count }),
    });
    const data = await res.json();
    setGenerated(data.loginIds || []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-slate-400">
          Manager-only configuration for warehouses and staff accounts.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">
            Generate Staff Login IDs
          </h3>
          <p className="text-xs text-slate-400">
            Create pre-approved login IDs (e.g. STF-0001) for warehouse staff.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="h-8 w-20 px-2 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={generateLoginIds}
              className="h-8 px-3 rounded-md bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Generate
            </button>
          </div>
          {generated.length > 0 && (
            <div className="mt-2 text-xs text-slate-200 space-y-1">
              <div className="font-semibold text-slate-300">
                New Login IDs:
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {generated.map((g) => (
                  <li key={g.id}>{g.login_id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
          Warehouse configuration UI (create/edit/disable warehouses and
          locations) to be implemented.
        </div>
      </div>
    </div>
  );
}

