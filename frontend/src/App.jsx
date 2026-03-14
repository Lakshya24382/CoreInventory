import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { ReceiptsPage } from "./pages/receipts/ReceiptsPage";
import { DeliveriesPage } from "./pages/deliveries/DeliveriesPage";
import { InventoryAdjustmentPage } from "./pages/adjustments/InventoryAdjustmentPage";
import { MoveHistoryPage } from "./pages/move-history/MoveHistoryPage";
import { SkuExplorerPage } from "./pages/sku-explorer/SkuExplorerPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { AppLayout } from "./layout/AppLayout";

const queryClient = new QueryClient();

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="receipts" element={<ReceiptsPage />} />
              <Route path="deliveries" element={<DeliveriesPage />} />
              <Route path="inventory-adjustments" element={<InventoryAdjustmentPage />} />
              <Route path="move-history" element={<MoveHistoryPage />} />
              <Route path="sku-explorer" element={<SkuExplorerPage />} />
              <Route
                path="settings"
                element={
                  <PrivateRoute allowedRoles={["manager"]}>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
