import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function fetchExplorer(token, search) {
  const url = new URL(`${API_BASE}/inventory/sku-explorer`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export function SkuExplorerPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sku-explorer", search],
    queryFn: () => fetchExplorer(token, search),
    enabled: !!token,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">SKU Inventory Explorer</h2>
          <p className="text-sm text-slate-400">
            Search stock by SKU, product name, and warehouse location.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or product name..."
            className="h-9 px-3 rounded-md bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => refetch()}
            className="h-9 px-4 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Search
          </button>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                SKU
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                Product
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                Warehouse
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                Location
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Loading inventory...
                </td>
              </tr>
            )}
            {!isLoading && data && data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No results.
                </td>
              </tr>
            )}
            {!isLoading &&
              data &&
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t border-slate-800/80 hover:bg-slate-900/60"
                >
                  <td className="px-3 py-2">{row.sku}</td>
                  <td className="px-3 py-2">{row.product_name}</td>
                  <td className="px-3 py-2 text-slate-300">
                    {row.warehouse_name}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {row.location_name}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-100">
                    {row.quantity}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

