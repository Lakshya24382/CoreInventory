import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Receipts from "./pages/operations/Receipts";
import Deliveries from "./pages/operations/Deliveries";
import Transfers from "./pages/operations/Transfers";
import Adjustments from "./pages/operations/Adjustments";
import MoveHistory from "./pages/operations/MoveHistory";
import ForgotPassword from "./pages/auth/ForgotPassword";

const Protected = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"           element={<Protected><Dashboard /></Protected>} />
          <Route path="/products"   element={<Protected><Products /></Protected>} />
          <Route path="/receipts"   element={<Protected><Receipts /></Protected>} />
          <Route path="/deliveries" element={<Protected><Deliveries /></Protected>} />
          <Route path="/transfers"  element={<Protected><Transfers /></Protected>} />
          <Route path="/moves" element={<Protected><MoveHistory /></Protected>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/adjustments" element={<Protected><Adjustments /></Protected>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}