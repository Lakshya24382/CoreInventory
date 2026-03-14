import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function fetchProducts(token) {
  const res = await fetch(`${API_BASE}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export function ProductsPage() {
  const { token, user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(token),
    enabled: !!token,
  });

  const isManager = user?.role === "manager";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-sm text-slate-400">
            Master data for all SKUs.
          </p>
        </div>
        {isManager && (
          <button className="h-9 px-4 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500">
            New Product
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                SKU
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                Category
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                UOM
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                Reorder Level
              </th>
              {isManager && (
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={isManager ? 6 : 5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Loading products...
                </td>
              </tr>
            )}
            {!isLoading && data && data.length === 0 && (
              <tr>
                <td
                  colSpan={isManager ? 6 : 5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No products yet.
                </td>
              </tr>
            )}
            {!isLoading &&
              data &&
              data.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-slate-800/80 hover:bg-slate-900/60"
                >
                  <td className="px-3 py-2">{p.sku}</td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2 text-slate-300">{p.category}</td>
                  <td className="px-3 py-2 text-slate-300">{p.uom}</td>
                  <td className="px-3 py-2 text-slate-300">
                    {p.reorder_level}
                  </td>
                  {isManager && (
                    <td className="px-3 py-2 text-right text-slate-300 text-xs">
                      Edit
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

