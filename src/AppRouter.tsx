import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import React from "react";
import Layout from "./Layout";
import Loader from "./components/Loader";
//import Login from "./components/pages/Login";
//import CreateEmployee from "./components/pages/Createemployee";
// Normal imports
import Productmenu from "./components/pages/Productmenu";
import Userdetails from "./components/pages/Userdetails";
import Material from "./components/pages/Material";
import Po from "./components/pages/Po";
import Login from "./components/pages/Login";
import CreateEmployee from "./components/pages/CreateEmployee";
import Poo from "./components/pages/Poo"
import VerifyOtp from "./components/pages/VerifyOtp"
import Adddepartment from "./components/pages/Adddepartment"
import Password from "./components/pages/Password"
import Frontend from "./components/pages/Frontend"
import SetPassword from "./components/pages/SetPassword"
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

const SuspenseGate = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>
    {children}
  </Suspense>
);

const AppRouter = () => {
  return (
    <Routes>
      
      {/* Login Page */}
     <Route path="login" element={<Login/>}/>
     <Route path="createemployee" element={<CreateEmployee/>}/>
     <Route path="VerifyOtp" element={<VerifyOtp/>}/>
     <Route path="adddepartment" element={<Adddepartment/>}/>
     <Route path="password" element={<Password/>}/>
     <Route path="Frontend" element={<Frontend/>}/>
     <Route path="/set-password" element={<SetPassword/>}/>
      {/* Main Layout Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <Suspense fallback={<Loader />}>
              <Dashboard />
            </Suspense>
          </Layout>
        }
      />
      <Route
      path="/poo"
      element={
        <Layout>
          <Poo/>
        </Layout>
      }/>

      <Route
        path="/userdetails"
        element={
          <Layout>
            <Userdetails />
          </Layout>
        }
      />

      <Route
        path="/material"
        element={
          <Layout>
            <Material />
          </Layout>
        }
      />

      <Route
        path="/po"
        element={
          <Layout>
            <Po />
          </Layout>
        }
      />

      <Route
        path="/productmenu"
        element={
          <Layout>
            <Productmenu />
          </Layout>
        }
      />

      <Route
        path="/material-request"
        element={
          <Layout>
            <SuspenseGate>
              <MaterialRequest />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/apporavals"
        element={
          <Layout>
            <SuspenseGate>
              <Apporavals />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/procurement"
        element={
          <Layout>
            <SuspenseGate>
              <Procurement />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/inventory"
        element={
          <Layout>
            <SuspenseGate>
              <Inventory />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/qcmanagement"
        element={
          <Layout>
            <SuspenseGate>
              <QcManagement />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/barcode-tracking"
        element={
          <Layout>
            <SuspenseGate>
              <BarcodeTracking />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/returns"
        element={
          <Layout>
            <SuspenseGate>
              <Returns />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/vendors"
        element={
          <Layout>
            <SuspenseGate>
              <Vendors />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/reports"
        element={
          <Layout>
            <SuspenseGate>
              <Reports />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/settings"
        element={
          <Layout>
            <SuspenseGate>
              <Settings />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/user"
        element={
          <Layout>
            <SuspenseGate>
              <User />
            </SuspenseGate>
          </Layout>
        }
      />

      <Route
        path="/masters"
        element={
          <Layout>
            <SuspenseGate>
              <Masters />
            </SuspenseGate>
          </Layout>
        }
      />
    </Routes>
    

  );
};

export default AppRouter;