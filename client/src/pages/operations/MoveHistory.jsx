import { useEffect, useState } from "react";
import { getMoves } from "../../api/operations";
import Layout from "../../components/Layout";
import { ArrowRight } from "lucide-react";

const typeStyles = {
  receipt:    "bg-green-100 text-green-700",
  delivery:   "bg-blue-100 text-blue-700",
  transfer:   "bg-purple-100 text-purple-700",
  adjustment: "bg-yellow-100 text-yellow-700",
};

export default function MoveHistory() {
  const [moves, setMoves] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMoves().then((r) => setMoves(r.data)).catch(console.error);
  }, []);

  const filtered = moves.filter((m) => {
    const matchType = filter === "all" || m.move_type === filter;
    const matchSearch =
      m.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.product_sku?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Move History</h1>
        <p className="text-sm text-gray-500">Full ledger of every stock movement</p>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="Search product or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
        <div className="flex gap-2">
          {["all", "receipt", "delivery", "transfer", "adjustment"].map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === t
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              {["Type", "Product", "Qty", "From → To", "By", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${typeStyles[m.move_type] || "bg-gray-100 text-gray-600"}`}>
                    {m.move_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{m.product_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{m.product_sku}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-700">{m.quantity}</td>
                <td className="px-4 py-3 text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>{m.from_location || "—"}</span>
                    <ArrowRight size={12} className="text-gray-400" />
                    <span>{m.to_location || "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{m.created_by}</td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(m.created_at).toLocaleDateString()}{" "}
                  <span className="text-xs">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No moves found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">{filtered.length} record{filtered.length !== 1 ? "s" : ""} shown</p>
    </Layout>
  );
}