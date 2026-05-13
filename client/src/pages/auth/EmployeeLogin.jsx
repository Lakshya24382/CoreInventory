import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Boxes, HardHat, ArrowLeft } from "lucide-react";

export default function EmployeeLogin() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      if (res.data.user.role !== "staff") {
        toast.error("Invalid credentials");
        return;
      }
      loginUser(res.data.token, res.data.user);
      toast.success("Welcome!");
      navigate("/dashboard");  // in both login files
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-2">
          <Boxes size={22} className="text-indigo-600" />
          <span className="text-lg font-semibold text-gray-800">CoreInventory</span>
        </div>

        <div className="flex items-center gap-2 mb-6 mt-4">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <HardHat size={16} className="text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            Employee Login
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-gray-500 text-sm mb-6">Use your registered email and password</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex justify-end mt-1">
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in as Employee"}
          </button>
        </form>

        <div className="border-t border-gray-100 mt-5 pt-4">
          <p className="text-center text-sm text-gray-500">
            First time?{" "}
            <Link to="/employee/register" className="text-indigo-600 hover:underline">
              Register with your Employee ID
            </Link>
          </p>
        </div>

        <Link to="/" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600 mt-3">
          <ArrowLeft size={14} /> Back to role selection
        </Link>
      </div>
    </div>
  );
}