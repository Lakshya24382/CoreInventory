import { useEffect, useState } from "react";
import { getKPIs } from "../../api/operations";
import StatCard from "../../components/StatCard";
import Layout from "../../components/Layout";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    getKPIs().then((res) => setKpis(res.data)).catch(console.error);
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Live snapshot of your inventory operations</p>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Products"       value={kpis?.total_products}      color="indigo" />
        <StatCard label="Low / Out of Stock"   value={kpis?.low_stock_items}     color="red"    />
        <StatCard label="Pending Receipts"     value={kpis?.pending_receipts}    color="green"  />
        <StatCard label="Pending Deliveries"   value={kpis?.pending_deliveries}  color="blue"   />
        <StatCard label="Pending Transfers"    value={kpis?.pending_transfers}   color="yellow" />
      </div>
    </Layout>
  );
}