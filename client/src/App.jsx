import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import RoleSelect       from "./pages/auth/RoleSelect";
import ManagerLogin     from "./pages/auth/ManagerLogin";
import EmployeeLogin    from "./pages/auth/EmployeeLogin";
import EmployeeRegister from "./pages/auth/EmployeeRegister";
import ForgotPassword   from "./pages/auth/ForgotPassword";
import Dashboard        from "./pages/dashboard/Dashboard";
import Products         from "./pages/products/Products";
import Receipts         from "./pages/operations/Receipts";
import Deliveries       from "./pages/operations/Deliveries";
import Transfers        from "./pages/operations/Transfers";
import Adjustments      from "./pages/operations/Adjustments";
import MoveHistory      from "./pages/operations/MoveHistory";
import Profile          from "./pages/Profile";

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth */}
          <Route path="/"                   element={<RoleSelect />} />
          <Route path="/manager/login"      element={<ManagerLogin />} />
          <Route path="/employee/login"     element={<EmployeeLogin />} />
          <Route path="/employee/register"  element={<EmployeeRegister />} />
          <Route path="/forgot-password"    element={<ForgotPassword />} />

          {/* App */}
          <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
          <Route path="/products"     element={<Protected><Products /></Protected>} />
          <Route path="/receipts"     element={<Protected><Receipts /></Protected>} />
          <Route path="/deliveries"   element={<Protected><Deliveries /></Protected>} />
          <Route path="/transfers"    element={<Protected><Transfers /></Protected>} />
          <Route path="/adjustments"  element={<Protected><Adjustments /></Protected>} />
          <Route path="/moves"        element={<Protected><MoveHistory /></Protected>} />
          <Route path="/profile"      element={<Protected><Profile /></Protected>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}