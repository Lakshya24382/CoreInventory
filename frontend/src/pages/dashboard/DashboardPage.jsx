import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function fetchKpis(token) {
  return fetch(`${API_BASE}/inventory/dashboard-kpis`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((r) => r.json());
}

export function DashboardPage() {
  const { token, user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: () => fetchKpis(token),
    enabled: !!token,
  });

  const cards = [
    { key: "totalProducts", label: "Total Products" },
    { key: "lowStockItems", label: "Low Stock Items" },
    { key: "pendingReceipts", label: "Pending Receipts" },
    { key: "pendingDeliveries", label: "Pending Deliveries" },
    { key: "internalTransfers", label: "Internal Transfers" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {user?.role === "manager" ? "Manager Dashboard" : "Warehouse Dashboard"}
          </h2>
          <p className="text-sm text-slate-400">
            Snapshot of inventory KPIs and activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              {card.label}
            </div>
            <div className="text-2xl font-semibold text-white">
              {isLoading || !data ? "—" : data[card.key]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

