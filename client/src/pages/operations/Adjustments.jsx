import { useEffect, useState } from "react";
import { getAdjustments, createAdjustment, validateAdjustment } from "../../api/operations";
import { getProducts } from "../../api/products";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import { Plus, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const locations = [
  { id: 1, name: "Main Store" }, { id: 2, name: "Rack A" },
  { id: 3, name: "Rack B" },    { id: 4, name: "Production Floor" },
  { id: 5, name: "Finished Goods Area" },
];

export default function Adjustments() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ location_id: 1, reason: "", lines: [{ product_id: "", recorded_qty: 0, actual_qty: 0 }] });

  const load = () => getAdjustments().then((r) => setAdjustments(r.data));

  useEffect(() => { load(); getProducts().then((r) => setProducts(r.data)); }, []);

  const addLine = () => setForm({ ...form, lines: [...form.lines, { product_id: "", recorded_qty: 0, actual_qty: 0 }] });
  const updateLine = (i, key, val) => {
    const lines = [...form.lines]; lines[i][key] = val; setForm({ ...form, lines });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAdjustment(form);
      toast.success("Adjustment created");
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const handleValidate = async (id) => {
    try {
      await validateAdjustment(id);
      toast.success("Stock corrected!");
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adjustments</h1>
          <p className="text-sm text-gray-500">Reconcile physical vs recorded stock</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={16} /> New Adjustment
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>{["Reference","Location","Reason","Status","Created",""].map(h => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {adjustments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-700">{a.reference}</td>
                <td className="px-4 py-3 text-gray-600">{a.location_name}</td>
                <td className="px-4 py-3 text-gray-500">{a.reason || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === "done" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {a.status !== "done" && isManager && (
                    <button onClick={() => handleValidate(a.id)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium">
                      <CheckCircle size={14} /> Validate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {adjustments.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No adjustments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">New Adjustment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. Damaged goods, Physical count"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Products</label>
                  <button type="button" onClick={addLine} className="text-xs text-indigo-600 hover:underline">+ Add line</button>
                </div>
                {form.lines.map((line, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select required value={line.product_id} onChange={(e) => updateLine(i, "product_id", e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" min="0" placeholder="Recorded" value={line.recorded_qty}
                      onChange={(e) => updateLine(i, "recorded_qty", e.target.value)}
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" min="0" placeholder="Actual" value={line.actual_qty}
                      onChange={(e) => updateLine(i, "actual_qty", e.target.value)}
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">Recorded = what system shows · Actual = what you physically counted</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium">Create</button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}