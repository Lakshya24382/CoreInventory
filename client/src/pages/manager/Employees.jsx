import { useEffect, useState } from "react";
import { getEmployees, createEmployee, deleteEmployee } from "../../api/auth";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import { UserPlus, Trash2, Copy, CheckCheck } from "lucide-react";

export default function Employees() {
  const [employees, setEmployees]         = useState([]);
  const [loading, setLoading]             = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [copied, setCopied]               = useState("");

  const load = () =>
    getEmployees().then((r) => setEmployees(r.data)).catch(console.error);

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await createEmployee();
      setNewCredentials(res.data);
      toast.success("Employee created!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this employee?")) return;
    try {
      await deleteEmployee(id);
      toast.success("Employee removed");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Manage warehouse staff accounts</p>
        </div>
        <button onClick={handleCreate} disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
          <UserPlus size={16} />
          {loading ? "Creating..." : "Add Employee"}
        </button>
      </div>

      {/* New credentials banner */}
      {newCredentials && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-semibold text-indigo-900">New employee credentials</h2>
              <p className="text-sm text-indigo-600 mt-0.5">
                Share these with your employee — they'll use these to complete registration.
                <span className="font-medium"> This won't be shown again.</span>
              </p>
            </div>
            <button onClick={() => setNewCredentials(null)}
              className="text-indigo-400 hover:text-indigo-600 text-xs">
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border border-indigo-200 p-3">
              <p className="text-xs text-gray-500 mb-1">Employee ID</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-gray-800">
                  {newCredentials.employee_id}
                </span>
                <button onClick={() => copyToClipboard(newCredentials.employee_id, "id")}
                  className="text-indigo-400 hover:text-indigo-600">
                  {copied === "id" ? <CheckCheck size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-indigo-200 p-3">
              <p className="text-xs text-gray-500 mb-1">Temporary Password</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-gray-800">
                  {newCredentials.temp_password}
                </span>
                <button onClick={() => copyToClipboard(newCredentials.temp_password, "pass")}
                  className="text-indigo-400 hover:text-indigo-600">
                  {copied === "pass" ? <CheckCheck size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              {["Employee ID", "Name", "Email", "Status", "Joined", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-700">{e.employee_id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {e.is_temp_password ? (
                    <span className="text-gray-400 italic">Pending registration</span>
                  ) : e.name}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {e.is_temp_password ? "—" : e.email}
                </td>
                <td className="px-4 py-3">
                  {e.is_temp_password ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(e.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(e.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No employees yet — click Add Employee to create one
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}