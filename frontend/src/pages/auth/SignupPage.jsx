import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function SignupPage() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Signup failed");
      } else {
        setSuccess("Account activated. You can now sign in.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-1 text-white">Activate staff account</h1>
        <p className="text-sm text-slate-400 mb-6">
          Enter the Login ID provided by your Inventory Manager.
        </p>
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded px-3 py-2">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Login ID
            </label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="STF-0001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Min 8 chars, upper, lower, special"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 inline-flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Activating..." : "Activate account"}
          </button>
        </form>
        <div className="mt-4 text-xs text-slate-400">
          Already activated?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Go back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

