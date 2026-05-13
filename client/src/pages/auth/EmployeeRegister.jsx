import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { employeeRegister } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Boxes, HardHat, ArrowLeft } from "lucide-react";

export default function EmployeeRegister() {
  const [form, setForm] = useState({
    employee_id:   "",
    temp_password: "",
    name:          "",
    email:         "",
    new_password:  "",
    confirm:       "",
  });
  const [loading, setLoading] = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await employeeRegister({
        employee_id:   form.employee_id,
        temp_password: form.temp_password,
        name:          form.name,
        email:         form.email,
        new_password:  form.new_password,
      });
      loginUser(res.data.token, res.data.user);
      toast.success("Registration complete! Welcome.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
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
            Employee Registration
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Complete registration</h1>
        <p className="text-gray-500 text-sm mb-6">
          Use the Employee ID and temporary password given by your manager
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input required value={form.employee_id} placeholder="EMP-001"
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temp password</label>
              <input required value={form.temp_password}
                onChange={(e) => setForm({ ...form, temp_password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your full name</label>
            <input required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your email</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input type="password" required minLength={6} value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input type="password" required value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                form.confirm && form.confirm !== form.new_password
                  ? "border-red-400" : "border-gray-300"
              }`} />
            {form.confirm && form.confirm !== form.new_password && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50 mt-2">
            {loading ? "Registering..." : "Complete registration"}
          </button>
        </form>

        <Link to="/employee/login" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600 mt-4">
          <ArrowLeft size={14} /> Back to employee login
        </Link>
      </div>
    </div>
  );
}