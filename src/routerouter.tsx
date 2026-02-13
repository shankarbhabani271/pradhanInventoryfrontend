import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/pages/Dashboard";
import MaterialRequest from "./components/pages/MaterialRequest";
import Apporavals from "./components/pages/Apporavals";
import Procurement from "./components/pages/Procurement";
import Inventory from "./components/pages/Inventory";
import QcManagement from "./components/pages/QcManagement";
import BarcodeTracking from "./components/pages/Barcode&Tracking";
import Returns from "./components/pages/Returns"
import Vendors from "./components/pages/Vendors"
import Masters from "./components/pages/Masters";
import User from "./components/pages/User";
import Settings from "./components/pages/Settings";
import Reports from "./components/pages/Reports";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/material-request" element={<MaterialRequest />} />
      <Route path="/Apporavals" element={<Apporavals />} />
      <Route path="/Procurement" element={<Procurement />} />
      <Route path="/Inventory" element={<Inventory />}/>
      <Route path="/Qcmanagement" element={<QcManagement />}/>
      <Route path="/Barcode&Tracking" element={<BarcodeTracking />}/>
      <Route path="/returns" element={<Returns/>} />
       <Route path="/vendors" element={<Vendors />} />
       <Route path="/masters" element={<Masters />} />
       <Route path="/user" element={<User />} />
       <Route path="/settings" element={<Settings />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
};

export default AppRouter;
