import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Package, ArrowDownCircle,
  ArrowUpCircle, ArrowLeftRight, ClipboardList,
  LogOut, User, Boxes
} from "lucide-react";
import { History } from "lucide-react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/receipts", icon: ArrowDownCircle, label: "Receipts" },
  { to: "/deliveries", icon: ArrowUpCircle, label: "Deliveries" },
  { to: "/transfers", icon: ArrowLeftRight, label: "Transfers" },
  { to: "/adjustments", icon: ClipboardList, label: "Adjustments" },
  { to: "/moves", icon: History, label: "Move History" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700 flex items-center gap-2">
        <Boxes size={22} className="text-indigo-400" />
        <span className="font-semibold text-lg">CoreInventory</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-700 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400">
          <User size={18} />
          <span className="truncate">{user?.name}</span>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}