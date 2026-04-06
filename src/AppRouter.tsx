import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import React from "react";
import Layout from "./Layout";
import Login from "./components/pages/Login";
import Forgotpassword from "./components/pages/Forgotpassword";
import Sendotp from "./components/pages/Sendotp";


import SignInPage from "./components/pages/Login";
import Loader from "./components/Loader";
import { useSelector } from "react-redux";
import type { RootState } from "./config/redux/reducers/rootReducer";
import Signup from "./components/pages/Signup";


const Dashboard = lazy(() => import("./components/pages/Dashboard"));
const MaterialRequest = lazy(
  () => import("./components/pages/MaterialRequest"),
);
const Apporavals = lazy(() => import("./components/pages/Apporavals"));
const Procurement = lazy(() => import("./components/pages/Procurement"));
const Inventory = lazy(() => import("./components/pages/Inventory"));
const QcManagement = lazy(() => import("./components/pages/QcManagement"));
const BarcodeTracking = lazy(
  () => import("./components/pages/BarcodeTracking"),
);
const Returns = lazy(() => import("./components/pages/Returns"));
const Vendors = lazy(() => import("./components/pages/Vendors"));
const User = lazy(() => import("./components/pages/User"));
const Settings = lazy(() => import("./components/pages/Settings"));
const Reports = lazy(() => import("./components/pages/Reports"));
const Masters = lazy(() => import("./components/pages/Masters"));

const SuspenseGate = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div>Loading ...</div>}>{children}</Suspense>
);
const AppRouter = () => {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/sendotp" element={<Sendotp />} />
        <Route path="/signup" element={<Signup />} />
        
      </Route>
      <Route element={<RequireAuth />}>
        <Route index element={<Dashboard />} />

        <Route
          path="material-request"
          element={
            <SuspenseGate>
              <MaterialRequest />
            </SuspenseGate>
          }
        />
        <Route
          path="apporavals"
          element={
            <SuspenseGate>
              <Apporavals />
            </SuspenseGate>
          }
        />
        <Route
          path="procurement"
          element={
            <SuspenseGate>
              <Procurement />
            </SuspenseGate>
          }
        />
        <Route
          path="inventory"
          element={
            <SuspenseGate>
              <Inventory />
            </SuspenseGate>
          }
        />
        <Route
          path="qcmanagement"
          element={
            <SuspenseGate>
              <QcManagement />
            </SuspenseGate>
          }
        />
        <Route
          path="barcode-tracking"
          element={
            <SuspenseGate>
              <BarcodeTracking />
            </SuspenseGate>
          }
        />
        <Route
          path="returns"
          element={
            <SuspenseGate>
              <Returns />
            </SuspenseGate>
          }
        />
        <Route
          path="vendors"
          element={
            <SuspenseGate>
              <Vendors />
            </SuspenseGate>
          }
        />
        <Route
          path="reports"
          element={
            <SuspenseGate>
              <Reports />
            </SuspenseGate>
          }
        />
        <Route
          path="settings"
          element={
            <SuspenseGate>
              <Settings />
            </SuspenseGate>
          }
        />
        <Route
          path="user"
          element={
            <SuspenseGate>
              <User />
            </SuspenseGate>
          }
        />

        <Route
          path="masters"
          element={
            <SuspenseGate>
              <Masters />
            </SuspenseGate>
          }
        />
      </Route>
    </Routes>
  );
};

const RequireAuth = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  if (!accessToken) {
    return <SignInPage />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Layout> {<Outlet />} </Layout>
    </Suspense>
  );
};

const GuestOnly = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  return (
    <Suspense fallback={<Loader />}>
      {accessToken ? (
        <Navigate to={"/"} replace />
      ) : (
        <Suspense fallback={<Loader />}>{<Outlet />}</Suspense>
      )}
    </Suspense>
  );
};

export default AppRouter;
