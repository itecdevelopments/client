import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import DashboardHome from "./pages/DashboardHome";
import Spares from "./pages/Spares";
import ServiceReport from "./pages/ServiceReport";
import ProtectedRoute from "./components/ProtectedRoute";
import UsersDataGrid from "./pages/Users";
import Documents from "./pages/Documents";
import RegionsDataGrid from "./pages/Regions";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />

          {/* Accessible only by Admins */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["VXR"]}>
                <UsersDataGrid />
              </ProtectedRoute>
            }
          />

          {/* Accessible by everyone */}
          <Route path="customers" element={<Customers />} />
          <Route path="spares" element={<Spares />} />
          <Route
            path="regions"
            element={
              <ProtectedRoute allowedRoles={["VXR"]}>
                <RegionsDataGrid />
              </ProtectedRoute>
            }
          />

          {/* ✅ Allow CM, BM, ENG also */}
          <Route
            path="service-reports"
            element={
              <ProtectedRoute allowedRoles={["VXR", "CM", "BM", "ENG"]}>
                <Documents />
              </ProtectedRoute>
            }
          />

          <Route
            path="service-report"
            element={
              <ProtectedRoute allowedRoles={["VXR", "CM", "BM", "ENG"]}>
                <ServiceReport />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
