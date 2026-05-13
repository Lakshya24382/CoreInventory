import { useNavigate } from "react-router-dom";
import { Boxes, ShieldCheck, HardHat } from "lucide-react";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-8">
      <div className="flex items-center gap-2">
        <Boxes size={28} className="text-indigo-600" />
        <span className="text-2xl font-semibold text-gray-800">CoreInventory</span>
      </div>

      <div>
        <h1 className="text-center text-xl font-bold text-gray-900 mb-1">Who are you?</h1>
        <p className="text-center text-sm text-gray-500 mb-8">Choose your role to continue</p>

        <div className="flex gap-4">
          <button onClick={() => navigate("/manager/login")}
            className="flex flex-col items-center gap-3 bg-white border-2 border-indigo-200 hover:border-indigo-500 rounded-2xl p-8 w-48 transition-all group">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <ShieldCheck size={28} className="text-indigo-600" />
            </div>
            <span className="font-semibold text-gray-800">Manager</span>
            <span className="text-xs text-gray-400 text-center">Full access & team management</span>
          </button>

          <button onClick={() => navigate("/employee/login")}
            className="flex flex-col items-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-400 rounded-2xl p-8 w-48 transition-all group">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <HardHat size={28} className="text-gray-600" />
            </div>
            <span className="font-semibold text-gray-800">Employee</span>
            <span className="text-xs text-gray-400 text-center">Warehouse operations access</span>
          </button>
        </div>
      </div>
    </div>
  );
}