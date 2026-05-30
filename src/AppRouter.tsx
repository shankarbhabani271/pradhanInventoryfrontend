import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import React from "react";
import Layout from "./Layout";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";

// Normal imports
import Productmenu from "./components/pages/Productmenu";
import Userdetails from "./components/pages/Userdetails";
import Material from "./components/pages/Material";
import Po from "./components/pages/Po";
import Login from "./components/pages/Login";
import CreateEmployee from "./components/pages/CreateEmployee";
import Poo from "./components/pages/Poo";
import Adddepartment from "./components/pages/Adddepartment";
import Password from "./components/pages/Password";
import Frontend from "./components/pages/Frontend";
import SetPassword from "./components/pages/SetPassword";
import RegisterEmployee from "./components/pages/RegisterEmployee";
//import IssueMaterial from "./pages/IssueMaterial";
//import CreatePurchaseRequisition from "./pages/CreatePurchaseRequisition";


// Custom Dashboards
import ManagerDashboard from "./components/pages/ManagerDashboard";
import ProcurementDashboard from "./components/pages/ProcurementDashboard";
import InventoryDashboard from "./components/pages/InventoryDashboard";
import EmployeeDashboard from "./components/pages/EmployeeDashboard";

// Lazy imports
const Dashboard = lazy(() => import("./components/pages/Dashboard"));
const MaterialRequest = lazy(() => import("./components/pages/MaterialRequest"));
const Apporavals = lazy(() => import("./components/pages/Apporavals"));
const Procurement = lazy(() => import("./components/pages/Procurement"));
const Inventory = lazy(() => import("./components/pages/Inventory"));
const QcManagement = lazy(() => import("./components/pages/QcManagement"));
const BarcodeTracking = lazy(() => import("./components/pages/BarcodeTracking"));
const Returns = lazy(() => import("./components/pages/Returns"));
const Vendors = lazy(() => import("./components/pages/Vendors"));
const User = lazy(() => import("./components/pages/User"));
const Settings = lazy(() => import("./components/pages/Settings"));
const Reports = lazy(() => import("./components/pages/Reports"));
const Masters = lazy(() => import("./components/pages/Masters"));
const PurchaseRequestList = lazy(() => import("./components/pages/PurchaseRequestList"));

const SuspenseGate = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>
    {children}
  </Suspense>
);

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const DashboardRedirect = () => {
  const token = localStorage.getItem("token");
  const claims = token ? decodeJwt(token) : null;
  const role = claims?.role || "employee";
  
  if (role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  } else if (role === "manager") {
    return <Navigate to="/manager-dashboard" replace />;
  } else if (role === "procurement") {
    return <Navigate to="/procurement-dashboard" replace />;
  } else if (role === "inventory") {
    return <Navigate to="/inventory-dashboard" replace />;
  } else {
    return <Navigate to="/employee-dashboard" replace />;
  }
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Public / Auth Setup Routes */}
      <Route path="login" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/set-password/:token" element={<SetPassword />} />
      


      {/* Root Path Dynamic Redirect */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Protected Dashboards */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <SuspenseGate>
                <Dashboard />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <Layout>
              <ManagerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/procurement-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "procurement"]}>
            <Layout>
              <ProcurementDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory"]}>
            <Layout>
              <InventoryDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "employee"]}>
            <Layout>
              <EmployeeDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Standard Protected Routes */}
      <Route
        path="createemployee"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateEmployee />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="adddepartment"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adddepartment />
          </ProtectedRoute>
        }
      />

      <Route
        path="registeremployee"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RegisterEmployee />
          </ProtectedRoute>
        }
      />

      <Route
        path="password"
        element={
          <ProtectedRoute>
            <Password />
          </ProtectedRoute>
        }
      />

      <Route
        path="Frontend"
        element={
          <ProtectedRoute>
            <Frontend />
          </ProtectedRoute>
        }
      />

      <Route
        path="/poo"
        element={
          <ProtectedRoute allowedRoles={["admin", "procurement"]}>
            <Layout>
              <Poo />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-request-list"
        element={
          <ProtectedRoute allowedRoles={["admin", "procurement", "manager"]}>
            <Layout>
              <SuspenseGate>
                <PurchaseRequestList />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/userdetails"
        element={
          <ProtectedRoute>
            <Layout>
              <Userdetails />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/material"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory"]}>
            <Layout>
              <Material />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/po"
        element={
          <ProtectedRoute allowedRoles={["admin", "procurement"]}>
            <Layout>
              <Po />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/productmenu"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory"]}>
            <Layout>
              <Productmenu />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/material-request"
        element={
          <ProtectedRoute allowedRoles={["admin", "employee", "manager"]}>
            <Layout>
              <SuspenseGate>
                <MaterialRequest />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/apporavals"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <Layout>
              <SuspenseGate>
                <Apporavals />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/procurement"
        element={
          <ProtectedRoute allowedRoles={["admin", "procurement"]}>
            <Layout>
              <SuspenseGate>
                <Procurement />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/procurement/vendor"
        element={
          <ProtectedRoute allowedRoles={["admin", "procurement"]}>
            <Layout>
              <SuspenseGate>
                <Vendors />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/procurement/requisition"
        element={
          <ProtectedRoute allowedRoles={["admin", "procurement"]}>
            <Layout>
              <SuspenseGate>
                <Procurement />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory"]}>
            <Layout>
              <SuspenseGate>
                <Inventory />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qcmanagement"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory", "procurement"]}>
            <Layout>
              <SuspenseGate>
                <QcManagement />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/barcode-tracking"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory"]}>
            <Layout>
              <SuspenseGate>
                <BarcodeTracking />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/returns"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory"]}>
            <Layout>
              <SuspenseGate>
                <Returns />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendors"
        element={<Navigate to="/procurement/vendor" replace />}
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <Layout>
              <SuspenseGate>
                <Reports />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SuspenseGate>
                <Settings />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <SuspenseGate>
                <User />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/masters"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory"]}>
            <Layout>
              <SuspenseGate>
                <Masters />
              </SuspenseGate>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;