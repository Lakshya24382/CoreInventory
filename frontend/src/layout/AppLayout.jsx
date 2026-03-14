import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: HomeIcon },
  { to: "/products", label: "Products", icon: CubeIcon },
  { to: "/receipts", label: "Receipts", icon: ArrowDownTrayIcon },
  { to: "/deliveries", label: "Deliveries", icon: ArrowUpTrayIcon },
  { to: "/inventory-adjustments", label: "Inventory Adjustment", icon: AdjustmentsHorizontalIcon },
  { to: "/move-history", label: "Move History", icon: ArrowsRightLeftIcon },
  { to: "/sku-explorer", label: "SKU Inventory Explorer", icon: MagnifyingGlassIcon },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <span className="text-lg font-semibold tracking-tight">
            CoreInventory
          </span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          {user?.role === "manager" && (
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Settings
            </NavLink>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <UserCircleIcon className="h-4 w-4" />
            Profile
          </NavLink>
        </nav>
        <div className="border-t border-slate-800 p-3 text-xs text-slate-400">
          <div className="flex items-center justify-between mb-1">
            <span>{user?.loginId}</span>
            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-left text-slate-300 hover:text-white text-xs"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold">Inventory Management</h1>
            <p className="text-xs text-slate-400">
              Real-time visibility into stock across warehouses
            </p>
          </div>
        </header>
        <section className="flex-1 p-6 overflow-auto bg-slate-950">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

