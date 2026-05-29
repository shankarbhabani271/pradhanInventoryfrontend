import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


import { PurchaseRequestForm } from "./Poo";

import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
  Package,
  UserPlus,
  Trash2,
  CalendarDays,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Edit,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Printer,
  Download,
  Eye,
  Truck,
  Ban,
  TrendingUp,
  Loader2,
} from "lucide-react";

/* ---------------- Dashboard Cards ---------------- */
const dashboardCards = [
  {
    title: "Open Requests",
    value: "24",
    subtitle: "+3 from yesterday",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Pending Approvals",
    value: "8",
    subtitle: "-2 from yesterday",
    icon: IndianRupee,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Active POs",
    value: "12",
    subtitle: "+5 this week",
    icon: ShoppingCart,
    iconBg: "bg-purple-100",
    iconColor: "text-green-500",
  },
  {
    title: "Low Stock Items",
    value: "5",
    subtitle: "Requires attention",
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];


interface Vendor {
  _id?: string;
  id?: number;
  name?: string;
  vendorName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  primaryaddress?: string;
  gst?: string;
  productType?: string;
  category?: string;
  location?: string;
  logo?: string;
  status?: string;
}

const STATIC_VENDORS: Vendor[] = [
  {
    id: 1,
    name: "HP Solutions",
    category: "Laptops & Computers",
    contactPerson: "Alok Gupta",
    email: "alok@hpsolutions.com",
    phone: "+91-9988776655",
    gst: "07HP9012H3X7",
    location: "Delhi, India",
    address: "Okhla Phase 3, Delhi, India",
    logo: "HP"
  },
  {
    id: 2,
    name: "Dell Technologies",
    category: "Computers & Servers",
    contactPerson: "Rajesh Kumar",
    email: "rajesh@dell.com",
    phone: "+91-8877665544",
    gst: "07DELL1234A1",
    location: "Bangalore, India",
    address: "Whitefield, Bangalore, India",
    logo: "DELL"
  },
  {
    id: 3,
    name: "Logitech India",
    category: "Peripherals & Accessories",
    contactPerson: "Sanjay Kumar",
    email: "sanjay@logitech.in",
    phone: "+91-7766554433",
    gst: "07LOGI5678B2",
    location: "Mumbai, India",
    address: "Andheri East, Mumbai, India",
    logo: "LOGI"
  },
  {
    id: 4,
    name: "Bhabani Traders",
    category: "Stationery & Office Supplies",
    contactPerson: "Bhabani Patra",
    email: "bhabani@traders.com",
    phone: "+91-9876543210",
    gst: "21BHAB8765C1Z9",
    location: "Bhubaneswar, Odisha",
    address: "Nayapalli, Bhubaneswar, Odisha",
    logo: "BT"
  }
];


/* ---------------- Performance Data ---------------- */




/* ---------------- Page Component ---------------- */
const VendorsPage = () => {
 
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || "all-vendors";
  });

 
 const [vendors, setVendors] = useState<Vendor[]>([]);
 const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);

  // Add Vendor Form States
  const [newVendorName, setNewVendorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productType, setProductType] = useState("");
  const [gst, setGst] = useState("");
  const [address, setAddress] = useState("");
  const [openVendorId, setOpenVendorId] = useState<string | null>(null);
  const [status, setStatus] = useState("Active");

  // Edit Vendor Form States
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [editVendorName, setEditVendorName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editProductType, setEditProductType] = useState("");
  const [editGst, setEditGst] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editStatus, setEditStatus] = useState("Active");

  // Purchase Requests Dashboard Filters & Modal States
  const [prSearchText, setPrSearchText] = useState("");
  const [prStatusFilter, setPrStatusFilter] = useState("All");
  const [prDeliveryFilter, setPrDeliveryFilter] = useState("All");
  const [prPriorityFilter, setPrPriorityFilter] = useState("All");

  // Delivery Dashboard Filters
  const [delSearchText, setDelSearchText] = useState("");
  const [delStatusFilter, setDelStatusFilter] = useState("All");

  // Details Modal state
  const [viewingRequest, setViewingRequest] = useState<any | null>(null);

  const handleStartEdit = (vendor: Vendor) => {
    const vId = vendor._id || vendor.id?.toString() || "";
    setEditingVendorId(vId);
    setEditVendorName(vendor.vendorName || vendor.name || "");
    setEditContactPerson(vendor.contactPerson || "");
    setEditEmail(vendor.email || "");
    setEditPhone(vendor.phone || "");
    setEditProductType(vendor.productType || vendor.category || "");
    setEditGst(vendor.gst || "");
    setEditAddress(vendor.primaryaddress || vendor.address || vendor.location || "");
    setEditStatus(vendor.status || "Active");
  };

  const handleSaveEdit = async (e: React.FormEvent, vendorId: string) => {
    e.preventDefault();
    if (!editVendorName || !editEmail || !editPhone || !editAddress) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    try {
      const vendorToUpdate = vendors.find(v => (v._id || v.id?.toString()) === vendorId);
      let updatedVendorData: Vendor;

      if (vendorToUpdate && vendorToUpdate._id) {
        const payload = {
          name: editVendorName,
          email: editEmail,
          phone: editPhone,
          secondphone: editPhone,
          primaryaddress: editAddress,
          contactPerson: editContactPerson,
          gst: editGst,
          productType: editProductType,
          category: editProductType,
          status: editStatus
        };

        const response = await axios.put(`${API_BASE_URL}/vendor/${vendorToUpdate._id}`, payload);
        
        if (response.data && response.data.success) {
          updatedVendorData = {
            ...response.data.data,
            vendorName: response.data.data.name,
            address: response.data.data.primaryaddress,
            category: response.data.data.productType || editProductType,
            gst: response.data.data.gst || editGst,
            status: response.data.data.status || editStatus
          };
        } else {
          throw new Error("Failed to update vendor on the server.");
        }
      } else {
        updatedVendorData = {
          id: vendorToUpdate ? vendorToUpdate.id : undefined,
          name: editVendorName,
          vendorName: editVendorName,
          contactPerson: editContactPerson,
          email: editEmail,
          phone: editPhone,
          productType: editProductType,
          category: editProductType,
          gst: editGst,
          address: editAddress,
          primaryaddress: editAddress,
          status: editStatus
        };
      }

      setVendors((prev) =>
        prev.map((v) => {
          const vId = v._id || v.id?.toString();
          return vId === vendorId ? updatedVendorData : v;
        })
      );

      toast.success("Vendor updated successfully! 🎉");
      setEditingVendorId(null);
    } catch (err: any) {
      console.error("Update vendor error:", err);
      const errMsg = err.response?.data?.message || "Failed to update vendor.";
      toast.error(errMsg);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !email || !phone || !address) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    try {
      const payload = {
        name: newVendorName,
        email,
        phone,
        secondphone: phone, // required by backend Mongoose schema
        primaryaddress: address,
        // Optional custom properties mapping to frontend Vendor interface
        vendorName: newVendorName,
        contactPerson,
        gst,
        productType,
        address,
        status
      };

      const response = await axios.post(`${API_BASE_URL}/vendor/create`, payload);
      
      if (response.data && response.data.success) {
        // Map database response to frontend Vendor format
        const createdVendor = {
          ...response.data.data,
          vendorName: response.data.data.name,
          address: response.data.data.primaryaddress,
          category: response.data.data.productType || productType,
          gst: response.data.data.gst || gst,
          status: response.data.data.status || status
        };
        
        // Dynamic frontend update (instantly update state without page refresh)
        setVendors((prev) => [createdVendor, ...prev]);

        toast.success("Vendor successfully created! 🎉");
        
        // Reset form
        setNewVendorName("");
        setContactPerson("");
        setEmail("");
        setPhone("");
        setProductType("");
        setGst("");
        setAddress("");
        setStatus("Active");

        // Switch tab back to All Vendors to show the new vendor instantly!
        setActiveTab("all-vendors");
      }
    } catch (err: any) {
      console.error("Add vendor error:", err);
      const errMsg = err.response?.data?.message || "Failed to add vendor.";
      toast.error(errMsg);
    }
  };
  // FETCH DATA
  useEffect(() => {
    fetchVendors();
    fetchPurchaseRequests();
  }, []);

  // Sync activeTab when location state changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const fetchPurchaseRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/purchase-request/get`);
      let dbRequests = [];
      if (Array.isArray(res.data)) {
        dbRequests = res.data;
      }
      
      const saved = localStorage.getItem("purchase_requests");
      let localRequests = [];
      if (saved) {
        try {
          localRequests = JSON.parse(saved);
        } catch {
          localRequests = [];
        }
      }
      
      const merged = [...dbRequests];
      localRequests.forEach((localIt: any) => {
        const exists = merged.some(m => m.id === localIt.id || (m._id && localIt._id && m._id === localIt._id));
        if (!exists) {
          merged.push(localIt);
        }
      });
      setPurchaseRequests(merged);
    } catch (err) {
      console.warn("Axios request fetch failed:", err);
      const saved = localStorage.getItem("purchase_requests");
      if (saved) {
        try {
          setPurchaseRequests(JSON.parse(saved));
        } catch {
          setPurchaseRequests([]);
        }
      } else {
        setPurchaseRequests([]);
      }
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/vendor/get`);

      console.log("API:", res.data);

      let loaded: Vendor[] = [];
      if (Array.isArray(res.data)) {
        loaded = res.data;
      } else if (res.data && Array.isArray(res.data.vendors)) {
        loaded = res.data.vendors;
      }

      if (loaded.length > 0) {
        const merged = [...STATIC_VENDORS];
        loaded.forEach(v => {
          const exists = merged.some(m => 
            (m.id?.toString() === v.id?.toString()) || 
            (m._id && v._id && m._id === v._id) ||
            ((m.vendorName || m.name || "").toLowerCase() === (v.vendorName || v.name || "").toLowerCase())
          );
          if (!exists) {
            merged.push(v);
          }
        });
        setVendors(merged);
      } else {
        setVendors(STATIC_VENDORS);
      }
    } catch (error) {
      console.log("ERROR:", error);
      setVendors(STATIC_VENDORS);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this vendor?")) {
      return;
    }

    try {
      const vendorToDelete = vendors.find(v => (v._id || v.id?.toString()) === id);
      if (vendorToDelete && vendorToDelete._id) {
        await axios.delete(`${API_BASE_URL}/vendor/${vendorToDelete._id}`);
      }

      setVendors((prev) => prev.filter((vendor) => {
        const vendorId = vendor._id || vendor.id?.toString() || "";
        return vendorId !== id;
      }));

      toast.success("Vendor successfully deleted! 🎉");
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete vendor from the database.");
    }
  };

  // UPDATE PURCHASE REQUEST STATUS / DELIVERY STATUS DYNAMIC SYNC
  const handlePRStatusUpdate = async (id: string, updateFields: { status?: string; deliveryStatus?: string }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/purchase-request/status/${id}`, updateFields);
      if (response.data && response.data.success) {
        const updated = response.data.data;
        
        // Update local React state instantly
        setPurchaseRequests(prev => prev.map(req => {
          const reqId = req._id || req.id;
          if (reqId === id) {
            return {
              ...req,
              status: updated.status,
              approvedBy: updated.approvedBy,
              deliveryStatus: updated.deliveryStatus
            };
          }
          return req;
        }));

        // Keep localStorage synchronizer perfectly aligned
        const saved = localStorage.getItem("purchase_requests");
        if (saved) {
          try {
            const localList = JSON.parse(saved);
            const updatedLocalList = localList.map((req: any) => {
              const reqId = req._id || req.id;
              if (reqId === id) {
                return {
                  ...req,
                  status: updated.status,
                  approvedBy: updated.approvedBy,
                  deliveryStatus: updated.deliveryStatus
                };
              }
              return req;
            });
            localStorage.setItem("purchase_requests", JSON.stringify(updatedLocalList));
          } catch (e) {
            console.error("Local storage sync error", e);
          }
        }

        toast.success("Purchase request successfully updated! 🎉");
      }
    } catch (err: any) {
      console.error("PR update failed:", err);
      toast.error(`Failed to update purchase request: ${err.response?.data?.message || err.message}`);
    }
  };

  // DELETE / CANCEL PURCHASE REQUEST
  const handleDeletePR = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel/remove this purchase request?")) {
      return;
    }

    try {
      const target = purchaseRequests.find(r => (r._id || r.id) === id);
      if (target && target._id) {
        await axios.delete(`${API_BASE_URL}/purchase-request/${target._id}`);
      }

      // Update state
      setPurchaseRequests(prev => prev.filter(r => (r._id || r.id) !== id));

      // Sync local storage
      const saved = localStorage.getItem("purchase_requests");
      if (saved) {
        try {
          const localList = JSON.parse(saved);
          const filtered = localList.filter((r: any) => (r._id || r.id) !== id);
          localStorage.setItem("purchase_requests", JSON.stringify(filtered));
        } catch (e) {
          console.error("Local storage remove error", e);
        }
      }

      toast.success("Purchase request deleted successfully! 🎉");
    } catch (err: any) {
      console.error("PR delete failed:", err);
      toast.error(`Failed to delete purchase request: ${err.message}`);
    }
  };

  // PRINT INVOICE GENERATOR FOR PR & PDF DOWNLOAD
  const handlePrintPR = (req: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popups blocked! Please allow popups for printing PO invoices.");
      return;
    }

    const reqId = req._id || req.id || "PR-TEMP";
    const name = req.vendor || req.vendorName || "Unknown Supplier";
    const dept = req.department || "IT";
    const reqBy = req.requestedBy || "Admin";
    const priority = req.priority || "Medium";
    const date = req.createdAt?.split("T")[0] || req.createdDate || new Date().toISOString().split("T")[0];
    const total = req.totalAmount || 0;
    const address = req.deliveryAddress || "Corporate Head Office";
    const notes = req.notes || req.specialInstructions || "N/A";
    
    const productsList = req.products || (req.product ? [{ name: req.product, quantity: req.quantity, price: req.price || 0 }] : []);

    const productsHtml = productsList.map((p: any, idx: number) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 500; color: #1e293b;">${idx + 1}</td>
        <td style="padding: 12px; color: #334155;">${p.name || p.productName}</td>
        <td style="padding: 12px; text-align: center; color: #334155;">${p.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #334155;">₹${(p.price || 0).toLocaleString()}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #4f46e5;">₹${((p.quantity || 1) * (p.price || 0)).toLocaleString()}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Order ${reqId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
            body { font-family: 'Outfit', sans-serif; margin: 40px; color: #1e293b; background: white; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 800; color: #4f46e5; }
            .title { font-size: 24px; font-weight: 800; color: #0f172a; text-align: right; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 35px; }
            .col { flex: 1; }
            .col-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 5px; letter-spacing: 0.05em; }
            .col-value { font-size: 14px; font-weight: 600; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
            th { background-color: #f8fafc; padding: 12px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .total-section { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .total-box { border-top: 2px solid #e2e8f0; padding-top: 15px; display: flex; gap: 40px; }
            .total-title { font-size: 16px; font-weight: 800; color: #0f172a; }
            .total-val { font-size: 20px; font-weight: 800; color: #4f46e5; }
            .footer { border-top: 1px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: 60px; }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">INVENTORY SYS</div>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Procurement & Supplier Center</p>
            </div>
            <div style="text-align: right;">
              <div class="title">PURCHASE ORDER</div>
              <p style="font-size: 13px; font-weight: 600; color: #64748b; margin: 4px 0 0 0;">ID: ${reqId}</p>
            </div>
          </div>

          <div style="display: flex; gap: 40px; margin-bottom: 30px;">
            <div class="col">
              <div class="col-title">Vendor Info</div>
              <div class="col-value">${name}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">Supplier Partner</div>
            </div>
            <div class="col" style="text-align: right;">
              <div class="col-title">Request Details</div>
              <div class="col-value">Department: ${dept}</div>
              <div style="font-size: 13px; color: #475569; margin-top: 2px;">Date: ${date}</div>
              <div style="font-size: 13px; color: #475569;">Initiated By: ${reqBy}</div>
              <div style="font-size: 13px; color: #475569;">Priority: ${priority}</div>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <div class="col-title">Delivery Destination</div>
            <div class="col-value" style="font-weight: 400; color: #334155;">${address}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Item Description</th>
                <th style="text-align: center; width: 100px;">Quantity</th>
                <th style="text-align: right; width: 150px;">Unit Price</th>
                <th style="text-align: right; width: 150px;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-title">Total PO Value:</div>
              <div class="total-val">₹${total.toLocaleString()}</div>
            </div>
          </div>

          ${notes && notes !== "N/A" ? `
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 40px;">
              <div class="col-title" style="margin-bottom: 6px;">Special Instructions / Notes</div>
              <div style="font-size: 12px; color: #334155; line-height: 1.5;">${notes}</div>
            </div>
          ` : ""}

          <div style="display: flex; justify-content: space-between; margin-top: 80px;">
            <div style="text-align: center; width: 200px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 12px; font-weight: 600; color: #475569;">
              Prepared By (${reqBy})
            </div>
            <div style="text-align: center; width: 200px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 12px; font-weight: 600; color: #475569;">
              Authorized Manager Sign
            </div>
          </div>

          <div class="footer">
            <span>Generated in Inventory Management System</span>
            <span>Date Printed: ${new Date().toLocaleDateString()}</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 space-y-6 bg-blue-50 min-h-screen">


      <div className="flex justify-between items-center">

        {/* Left Section */}
        <div>
          <h1 className="text-2xl font-black">
            Vendors Management
          </h1>
          <p className="text-xl text-gray-600">
            Manage suppliers and purchase requests
          </p>
        </div>

        {/* Right Section */}
        <div>
          <button
            onClick={() => setActiveTab("add-vendor")}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <UserPlus className="text-white" size={20} />

            <span>
              Add Vendors
            </span>
          </button>
        </div>

      </div>
      {/* Dashboard Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-vendors" value={activeTab} onValueChange={setActiveTab}>

        <TabsList className="bg-slate-300 text-black">

          <TabsTrigger value="all-vendors">
            All Vendors
          </TabsTrigger>

          <TabsTrigger value="add-vendor">
            Add Vendor
          </TabsTrigger>

          <TabsTrigger value="purchase-request">
            Purchase Requests
          </TabsTrigger>

          <TabsTrigger value="delivery-orders">
            Delivery Orders
          </TabsTrigger>

        </TabsList>

        {/* -------- All Vendors Tab -------- */}
        <TabsContent value="all-vendors" className="mt-6">
          <div className="min-h-screen p-4 space-y-6">
            {vendors.map((vendor) => {
              const vendorId = vendor._id || vendor.id?.toString() || "";

              const name = vendor.vendorName || vendor.name || "Unknown Supplier";
              const category = vendor.productType || vendor.category || "General Supplier";
              const contact = vendor.contactPerson || "Authorized Representative";
              const email = vendor.email || "N/A";
              const phone = vendor.phone || "N/A";
              const gst = vendor.gst || "N/A";
              const locationVal = vendor.primaryaddress || vendor.address || vendor.location || "N/A";
              const vendorStatus = vendor.status || "Active";
              const logo = name.split(" ").map(w => w.charAt(0)).join("").substring(0, 2).toUpperCase() || "V";

              return (
                <div key={vendorId} className={`max-w-3xl mx-auto bg-white rounded-2xl shadow-md border overflow-hidden transition-all duration-300 ${
                  editingVendorId === vendorId ? "ring-2 ring-amber-500 border-amber-500 scale-[1.01]" : ""
                }`}>
                  {editingVendorId === vendorId ? (
                    <form onSubmit={(e) => handleSaveEdit(e, vendorId)} className="p-0">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-lg shrink-0">
                            {logo}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">
                              Editing Vendor
                            </h2>
                            <p className="text-sm text-amber-50">
                              {name}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-white/20 text-white uppercase tracking-wider">
                          Edit Mode
                        </span>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        {/* Vendor Name */}
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">
                            Vendor Name *
                          </label>
                          <div className="relative">
                            <Building2 size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={editVendorName}
                              onChange={(e) => setEditVendorName(e.target.value)}
                              placeholder="Vendor Name"
                              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Contact Person */}
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">
                            Contact Person
                          </label>
                          <div className="relative">
                            <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                              type="text"
                              value={editContactPerson}
                              onChange={(e) => setEditContactPerson(e.target.value)}
                              placeholder="Contact Person"
                              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">
                            Email *
                          </label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                              type="email"
                              required
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="vendor@email.com"
                              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">
                            Phone *
                          </label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              placeholder="Phone Number"
                              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Product Type / Category */}
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">
                            Product Type *
                          </label>
                          <select
                            value={editProductType}
                            onChange={(e) => setEditProductType(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white transition"
                          >
                            <option value="">Select Category</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Keyboard">Keyboard</option>
                            <option value="Mouse">Mouse</option>
                            <option value="Printer">Printer</option>
                          </select>
                        </div>

                        {/* GST Number */}
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">
                            GST Number
                          </label>
                          <div className="relative">
                            <FileText size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                              type="text"
                              value={editGst}
                              onChange={(e) => setEditGst(e.target.value)}
                              placeholder="GST Number"
                              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Vendor Status */}
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-1 block">
                            Vendor Status
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white transition font-semibold"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-1 block">
                            Address *
                          </label>
                          <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                            <textarea
                              rows={3}
                              required
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              placeholder="Full Address"
                              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="border-t p-4 flex gap-3 justify-end bg-gray-50/80">
                        <button
                          type="button"
                          onClick={() => setEditingVendorId(null)}
                          className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition border border-gray-200 shadow-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                              {logo}
                            </div>

                            {/* Vendor Info */}
                            <div>
                              <h2 className="text-xl font-semibold">
                                {name}
                              </h2>
                              <p className="text-sm text-blue-100">
                                {category}
                              </p>
                            </div>
                          </div>

                          {/* Status */}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${
                            vendorStatus.toLowerCase() === "active"
                              ? "bg-emerald-500/20 text-white border-emerald-500"
                              : "bg-rose-500/20 text-white border-rose-500"
                          }`}>
                            {vendorStatus}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Contact</p>
                            <h3 className="text-sm font-medium">{contact}</h3>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Email</p>
                            <h3 className="text-sm font-medium">{email}</h3>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Address</p>
                            <h3 className="text-sm font-medium">{locationVal}</h3>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Phone</p>
                            <h3 className="text-sm font-medium">{phone}</h3>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">GST</p>
                            <h3 className="text-sm font-medium">{gst}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="border-t p-4 flex gap-3 justify-end bg-gray-50/80">
                        <button
                          onClick={() => handleStartEdit(vendor)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border border-amber-200 shadow-sm"
                        >
                          <Edit size={16} />
                          Edit
                        </button>

                        <button
                          onClick={() => setOpenVendorId(vendorId)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-300"
                        >
                          <FileText size={16} />
                          Create PO
                        </button>

                        <button 
                          onClick={() => handleDelete(vendorId)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border border-rose-100"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>

                      {/* Dynamic inline purchase request form */}
                      {openVendorId === vendorId && (
                        <div className="border-t p-6 bg-slate-50/50">
                          <PurchaseRequestForm
                            vendor={vendor}
                            onBack={() => setOpenVendorId(null)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* -------- Add Vendor Tab -------- */}
        <TabsContent value="add-vendor" className="mt-6">
          <div className="min-h-screen  p-4 md:p-8">

            {/* Main Card */}
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Add New Vendor
                </h1>
                <p className="text-sm md:text-base mt-2 text-blue-100">
                  Manage supplier details for your inventory system
                </p>
              </div>

              {/* Form Section */}
              <div className="p-6 md:p-8">
                <form onSubmit={handleAddVendor}>

                  {/* Grid Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Vendor Name */}
                    <div>
                      <label className="font-medium text-gray-700 mb-2 block">
                        Vendor Name *
                      </label>
                      <div className="relative">
                        <Building2
                          size={18}
                          className="absolute left-3 top-4 text-gray-400"
                        />
                        <input
                          type="text"
                          required
                          value={newVendorName}
                          onChange={(e) => setNewVendorName(e.target.value)}
                          placeholder="Dell Technologies"
                          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div>
                      <label className="font-medium text-gray-700 mb-2 block">
                        Contact Person
                      </label>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-4 text-gray-400"
                        />
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder="Rajesh Kumar"
                          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="font-medium text-gray-700 mb-2 block">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-4 text-gray-400"
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vendor@gmail.com"
                          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="font-medium text-gray-700 mb-2 block">
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-3 top-4 text-gray-400"
                        />
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Product Type */}
                    <div>
                      <label className="font-medium text-gray-700 mb-2 block">
                        Product Type *
                      </label>
                      <select 
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="">Select Category</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Keyboard">Keyboard</option>
                        <option value="Mouse">Mouse</option>
                        <option value="Printer">Printer</option>
                      </select>
                    </div>

                    {/* GST */}
                    <div>
                      <label className="font-medium text-gray-700 mb-2 block">
                        GST Number
                      </label>
                      <div className="relative">
                        <FileText
                          size={18}
                          className="absolute left-3 top-4 text-gray-400"
                        />
                        <input
                          type="text"
                          value={gst}
                          onChange={(e) => setGst(e.target.value)}
                          placeholder="29ABCDE1234F1Z5"
                          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Vendor Status */}
                    <div>
                      <label className="font-medium text-gray-700 mb-2 block">
                        Vendor Status
                      </label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mt-6">
                    <label className="font-medium text-gray-700 mb-2 block">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-3 top-4 text-gray-400"
                      />
                      <textarea
                        rows={4}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address"
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        setNewVendorName("");
                        setContactPerson("");
                        setEmail("");
                        setPhone("");
                        setProductType("");
                        setGst("");
                        setAddress("");
                        setStatus("Active");
                      }}
                      className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition font-semibold text-sm"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md font-semibold text-sm"
                    >
                      Save Vendor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* -------- Purchase Request Tab -------- */}
        <TabsContent value="purchase-request" className="mt-6">
          <div className="min-h-screen p-4 md:p-6 space-y-6">

            {/* Top Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
                  <FileText className="text-indigo-600" />
                  Purchase Requests Control Panel
                </h1>
                <p className="text-gray-500 text-sm">
                  Review procurement orders, approve vendor requests, and track shipping pipelines
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Orders</p>
                  <h3 className="text-2xl font-black text-slate-800">{purchaseRequests.length}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Approvals</p>
                  <h3 className="text-2xl font-black text-amber-600">
                    {purchaseRequests.filter(r => r.status === "Pending").length}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Check size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Approved Requests</p>
                  <h3 className="text-2xl font-black text-emerald-600">
                    {purchaseRequests.filter(r => r.status === "Approved").length}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <X size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rejected Requests</p>
                  <h3 className="text-2xl font-black text-rose-600">
                    {purchaseRequests.filter(r => r.status === "Rejected").length}
                  </h3>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="max-w-7xl mx-auto bg-white p-4 rounded-2xl shadow-sm border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={prSearchText}
                  onChange={(e) => setPrSearchText(e.target.value)}
                  placeholder="Search by ID, Vendor, or Product..."
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Status */}
              <div>
                <select
                  value={prStatusFilter}
                  onChange={(e) => setPrStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="All">All Approval Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Delivery */}
              <div>
                <select
                  value={prDeliveryFilter}
                  onChange={(e) => setPrDeliveryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="All">All Delivery Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <select
                  value={prPriorityFilter}
                  onChange={(e) => setPrPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="All">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* List / Table Area */}
            <div className="max-w-7xl mx-auto">
              {(() => {
                const filteredPRs = purchaseRequests.filter(req => {
                  const reqId = (req._id || req.id || "").toLowerCase();
                  const vendorName = (req.vendor || req.vendorName || "").toLowerCase();
                  const productName = (req.products?.[0]?.name || req.product || "").toLowerCase();
                  const matchesSearch = reqId.includes(prSearchText.toLowerCase()) || 
                                        vendorName.includes(prSearchText.toLowerCase()) || 
                                        productName.includes(prSearchText.toLowerCase());

                  const matchesStatus = prStatusFilter === "All" || req.status === prStatusFilter;
                  const matchesDelivery = prDeliveryFilter === "All" || req.deliveryStatus === prDeliveryFilter;
                  const matchesPriority = prPriorityFilter === "All" || req.priority === prPriorityFilter;

                  return matchesSearch && matchesStatus && matchesDelivery && matchesPriority;
                });

                return filteredPRs.length > 0 ? (
                  <>
                    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden hidden md:block">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 border-b text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Request ID</th>
                            <th className="p-4">Vendor</th>
                            <th className="p-4">Product Details</th>
                            <th className="p-4">Priority</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-center">Approval</th>
                            <th className="p-4 text-center">Delivery</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPRs.map((item) => {
                            const prId = item._id || item.id || "N/A";
                            const prProduct = item.product || (Array.isArray(item.products) && item.products.map((p: any) => `${p.name || p.productName} (${p.quantity})`).join(", ")) || "General Items";
                            const prVendor = item.vendor || item.vendorName || "Unknown Supplier";
                            const prStatus = item.status || "Pending";
                            const prDelStatus = item.deliveryStatus || "Pending";
                            const prAmount = item.totalAmount || 0;
                            const prPriority = item.priority || "Medium";

                            return (
                              <tr key={prId} className="border-b last:border-0 hover:bg-slate-50/40">
                                <td className="p-4 font-black text-indigo-600 text-xs" title={prId}>{prId}</td>
                                <td className="p-4 font-bold text-slate-800">{prVendor}</td>
                                <td className="p-4 text-slate-500 max-w-xs truncate" title={prProduct}>{prProduct}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    prPriority === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                    prPriority === "Low" ? "bg-green-50 text-green-600 border border-green-100" :
                                    "bg-amber-50 text-amber-600 border border-amber-100"
                                  }`}>
                                    {prPriority}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-extrabold text-slate-700">₹{prAmount.toLocaleString()}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    prStatus === "Approved" ? "bg-green-50 text-green-700 border border-green-200" :
                                    prStatus === "Rejected" ? "bg-red-50 text-red-700 border border-red-200" :
                                    "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                                  }`}>
                                    {prStatus}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    prDelStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                    prDelStatus === "Processing" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                    "bg-slate-50 text-slate-500 border border-slate-200"
                                  }`}>
                                    {prDelStatus}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => setViewingRequest(item)}
                                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    {prStatus === "Pending" && (
                                      <>
                                        <button
                                          onClick={() => handlePRStatusUpdate(prId, { status: "Approved" })}
                                          className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition"
                                          title="Approve"
                                        >
                                          <Check size={16} />
                                        </button>
                                        <button
                                          onClick={() => handlePRStatusUpdate(prId, { status: "Rejected" })}
                                          className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition"
                                          title="Reject"
                                        >
                                          <X size={16} />
                                        </button>
                                      </>
                                    )}
                                    {prStatus === "Approved" && prDelStatus === "Pending" && (
                                      <button
                                        onClick={() => handlePRStatusUpdate(prId, { deliveryStatus: "Processing" })}
                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition"
                                        title="Ship / Processing"
                                      >
                                        <Truck size={16} />
                                      </button>
                                    )}
                                    {prStatus === "Approved" && prDelStatus === "Processing" && (
                                      <button
                                        onClick={() => handlePRStatusUpdate(prId, { deliveryStatus: "Delivered" })}
                                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition"
                                        title="Mark Delivered"
                                      >
                                        <Check size={16} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handlePrintPR(item)}
                                      className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition"
                                      title="Print"
                                    >
                                      <Printer size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePR(prId)}
                                      className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition"
                                      title="Cancel/Remove"
                                    >
                                      <Ban size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card Layout for Table */}
                    <div className="space-y-4 md:hidden">
                      {filteredPRs.map((item) => {
                        const prId = item._id || item.id || "N/A";
                        const prProduct = item.product || (Array.isArray(item.products) && item.products[0]?.name) || "General Items";
                        const prVendor = item.vendor || item.vendorName || "Unknown Supplier";
                        const prStatus = item.status || "Pending";
                        const prDelStatus = item.deliveryStatus || "Pending";
                        const prAmount = item.totalAmount || 0;

                        return (
                          <div key={prId} className="bg-white rounded-2xl p-4 shadow-sm border space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-black text-indigo-500 block">{prId}</span>
                                <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{prVendor}</h4>
                                <span className="text-xs text-slate-400 font-semibold">{prProduct}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                prStatus === "Approved" ? "bg-green-50 text-green-700 border" :
                                prStatus === "Rejected" ? "bg-red-50 text-red-700 border" :
                                "bg-amber-50 text-amber-700 border animate-pulse"
                              }`}>
                                {prStatus}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs font-bold border-t pt-3">
                              <span className="text-slate-400">Total: <strong className="text-slate-800">₹{prAmount.toLocaleString()}</strong></span>
                              <span className="text-slate-400">Delivery: 
                                <strong className={`ml-1 px-2 py-0.5 rounded-full ${
                                  prDelStatus === "Delivered" ? "bg-green-50 text-green-600" :
                                  prDelStatus === "Processing" ? "bg-blue-50 text-blue-600" :
                                  "bg-slate-50 text-slate-500"
                                }`}>{prDelStatus}</strong>
                              </span>
                            </div>

                            {/* Mobile Buttons */}
                            <div className="flex justify-end gap-2 border-t pt-3">
                              <button
                                onClick={() => setViewingRequest(item)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition"
                              >
                                <Eye size={12} /> Details
                              </button>
                              {prStatus === "Pending" && (
                                <>
                                  <button
                                    onClick={() => handlePRStatusUpdate(prId, { status: "Approved" })}
                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handlePRStatusUpdate(prId, { status: "Rejected" })}
                                    className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[11px] font-bold transition"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {prStatus === "Approved" && prDelStatus === "Pending" && (
                                <button
                                  onClick={() => handlePRStatusUpdate(prId, { deliveryStatus: "Processing" })}
                                  className="px-3 py-1.5 bg-blue-500 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1"
                                >
                                  <Truck size={12} /> Ship
                                </button>
                              )}
                              {prStatus === "Approved" && prDelStatus === "Processing" && (
                                <button
                                  onClick={() => handlePRStatusUpdate(prId, { deliveryStatus: "Delivered" })}
                                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition"
                                >
                                  Deliver
                                </button>
                              )}
                              <button
                                onClick={() => handlePrintPR(item)}
                                className="p-1.5 bg-slate-50 border hover:bg-slate-100 rounded-xl text-slate-500 transition"
                              >
                                <Printer size={12} />
                              </button>
                              <button
                                onClick={() => handleDeletePR(prId)}
                                className="p-1.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 transition"
                              >
                                <Ban size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-gray-300 text-center max-w-xl mx-auto my-12 shadow-sm animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border shadow-inner">
                      <FileText size={28} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">No Matching Requests Found</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-2 max-w-sm leading-relaxed">
                      Adjust your search query or status filter to show purchase orders.
                    </p>
                  </div>
                );
              })()}
            </div>

          </div>
        </TabsContent>

        {/* -------- Delivery Orders Tab -------- */}
        <TabsContent value="delivery-orders" className="mt-6">
          <div className="min-h-screen p-4 md:p-6 space-y-6">

            {/* Top Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
                  <Truck className="text-blue-600" />
                  Product Deliveries Registry
                </h1>
                <p className="text-gray-500 text-sm">
                  Track dispatch shipments, manage fulfillment operations, and mark orders delivered
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Truck size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Shipping</p>
                  <h3 className="text-2xl font-black text-slate-800 font-bold">
                    {purchaseRequests.filter(r => r.status === "Approved").length}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Shipping</p>
                  <h3 className="text-2xl font-black text-amber-600">
                    {purchaseRequests.filter(r => r.status === "Approved" && r.deliveryStatus === "Pending").length}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Loader2 size={22} className="animate-spin" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">On The Way</p>
                  <h3 className="text-2xl font-black text-sky-600">
                    {purchaseRequests.filter(r => r.status === "Approved" && r.deliveryStatus === "Processing").length}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Check size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Successfully Delivered</p>
                  <h3 className="text-2xl font-black text-emerald-600">
                    {purchaseRequests.filter(r => r.status === "Approved" && r.deliveryStatus === "Delivered").length}
                  </h3>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="max-w-7xl mx-auto bg-white p-4 rounded-2xl shadow-sm border flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={delSearchText}
                  onChange={(e) => setDelSearchText(e.target.value)}
                  placeholder="Search deliveries by product name, vendor, ID..."
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="w-full sm:w-64">
                <select
                  value={delStatusFilter}
                  onChange={(e) => setDelStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="All">All Shipping States</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Grid layout of delivery request cards */}
            <div className="max-w-7xl mx-auto">
              {(() => {
                const filteredDeliveries = purchaseRequests.filter(req => {
                  if (req.status !== "Approved") return false;

                  const reqId = (req._id || req.id || "").toLowerCase();
                  const vendorName = (req.vendor || req.vendorName || "").toLowerCase();
                  const productName = (req.products?.[0]?.name || req.product || "").toLowerCase();
                  const matchesSearch = reqId.includes(delSearchText.toLowerCase()) || 
                                        vendorName.includes(delSearchText.toLowerCase()) || 
                                        productName.includes(delSearchText.toLowerCase());

                  const matchesStatus = delStatusFilter === "All" || req.deliveryStatus === delStatusFilter;

                  return matchesSearch && matchesStatus;
                });

                return filteredDeliveries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDeliveries.map((item) => {
                      const delId = item._id || item.id || "N/A";
                      const prProduct = item.product || (Array.isArray(item.products) && item.products[0]?.name) || "General Goods";
                      const prVendor = item.vendor || item.vendorName || "Unknown Supplier";
                      const prQty = item.quantity || item.totalQty || (Array.isArray(item.products) && item.products[0]?.quantity) || 0;
                      const prDate = item.expectedDate || item.createdDate || item.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0];
                      const prNotes = item.notes || item.specialInstructions || "Standard Delivery Package";
                      const prDelStatus = item.deliveryStatus || "Pending";

                      return (
                        <div key={delId} className="bg-white rounded-3xl shadow-sm border hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                          {/* Card Top */}
                          <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                  <Package size={22} />
                                </div>
                                <div>
                                  <h3 className="font-black text-slate-800 text-sm truncate max-w-[150px]" title={prProduct}>
                                    {prProduct}
                                  </h3>
                                  <span className="text-xs text-slate-400 font-bold leading-tight block truncate max-w-[150px]">
                                    {prVendor}
                                  </span>
                                </div>
                              </div>

                              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                prDelStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                prDelStatus === "Processing" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                              }`}>
                                {prDelStatus}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border font-semibold text-slate-500">
                              <div>
                                <span className="block text-slate-400 text-[10px]">QUANTITY</span>
                                <strong className="text-slate-800 font-extrabold">{prQty} units</strong>
                              </div>
                              <div>
                                <span className="block text-slate-400 text-[10px]">EXPECTED BY</span>
                                <strong className="text-slate-800 font-extrabold">{prDate}</strong>
                              </div>
                            </div>

                            <div>
                              <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Shipping Notes</span>
                              <p className="text-xs text-slate-600 font-semibold leading-relaxed line-clamp-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                {prNotes}
                              </p>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="bg-slate-50/70 border-t border-slate-100 p-4 flex gap-2 justify-end">
                            <button
                              onClick={() => setViewingRequest(item)}
                              className="p-2 bg-white hover:bg-slate-100 text-slate-600 border rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <Eye size={14} />
                            </button>
                            
                            {prDelStatus === "Pending" && (
                              <button
                                onClick={() => handlePRStatusUpdate(delId, { deliveryStatus: "Processing" })}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-100 hover:shadow-blue-200"
                              >
                                <Truck size={14} />
                                Ship / Transit
                              </button>
                            )}

                            {prDelStatus === "Processing" && (
                              <button
                                onClick={() => handlePRStatusUpdate(delId, { deliveryStatus: "Delivered" })}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-100 hover:shadow-emerald-200"
                              >
                                <Check size={14} />
                                Mark Delivered
                              </button>
                            )}

                            <button
                              onClick={() => handlePrintPR(item)}
                              className="p-2 bg-white hover:bg-slate-100 text-slate-500 border rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <Printer size={14} />
                            </button>

                            <button
                              onClick={() => handleDeletePR(delId)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-rose-100 shadow-sm"
                              title="Cancel Delivery Order"
                            >
                              <Ban size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-gray-300 text-center max-w-xl mx-auto my-12 shadow-sm animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border shadow-inner">
                      <Truck size={28} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">No Shipments or Deliveries Found</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-2 max-w-sm leading-relaxed">
                      Approved purchase orders needing transit or delivery will appear here automatically.
                    </p>
                  </div>
                );
              })()}
            </div>

          </div>
        </TabsContent>

      </Tabs>

      {/* Details overlay Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Request Detail
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 mt-1">
                  {viewingRequest._id || viewingRequest.id}
                </h2>
              </div>
              <button 
                onClick={() => setViewingRequest(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Metadata Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border text-xs font-semibold text-slate-500">
              <div>
                <span className="block text-slate-400 mb-1">VENDOR</span>
                <span className="text-slate-800 font-extrabold">{viewingRequest.vendor || viewingRequest.vendorName || "N/A"}</span>
              </div>
              <div>
                <span className="block text-slate-400 mb-1">DEPARTMENT</span>
                <span className="text-slate-800 font-extrabold">{viewingRequest.department || "IT"}</span>
              </div>
              <div>
                <span className="block text-slate-400 mb-1">INITIATED BY</span>
                <span className="text-slate-800 font-extrabold">{viewingRequest.requestedBy || "Admin"}</span>
              </div>
              <div>
                <span className="block text-slate-400 mb-1">PRIORITY</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block mt-0.5 ${
                  viewingRequest.priority === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                  viewingRequest.priority === "Low" ? "bg-green-50 text-green-600 border border-green-100" :
                  "bg-amber-50 text-amber-600 border border-amber-100"
                }`}>
                  {viewingRequest.priority || "Medium"}
                </span>
              </div>
            </div>

            {/* Status grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-2xl border flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">APPROVAL STATUS</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  viewingRequest.status === "Approved" ? "bg-green-100 text-green-800" :
                  viewingRequest.status === "Rejected" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {viewingRequest.status || "Pending"}
                </span>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">DELIVERY STATUS</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  viewingRequest.deliveryStatus === "Delivered" ? "bg-green-100 text-green-800" :
                  viewingRequest.deliveryStatus === "Processing" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {viewingRequest.deliveryStatus || "Pending"}
                </span>
              </div>
            </div>

            {/* Products Table */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Itemized Products</h3>
              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b">
                      <th className="p-3">#</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingRequest.products || (viewingRequest.product ? [{ name: viewingRequest.product, quantity: viewingRequest.quantity, price: viewingRequest.price || 0 }] : [])).map((p: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-800">{p.name || p.productName || "General Item"}</td>
                        <td className="p-3 text-center font-bold text-slate-700">{p.quantity}</td>
                        <td className="p-3 text-right font-semibold text-slate-700">₹{(p.price || 0).toLocaleString()}</td>
                        <td className="p-3 text-right font-black text-indigo-600">₹{((p.quantity || 1) * (p.price || 0)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-indigo-50 border border-indigo-100/50 p-4 rounded-2xl flex justify-between items-center text-sm font-black text-slate-800">
              <span className="text-slate-600">Total Purchase Value:</span>
              <span className="text-indigo-600 text-lg font-extrabold">₹{(viewingRequest.totalAmount || 0).toLocaleString()}</span>
            </div>

            {/* Destination Address */}
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-400 uppercase">Delivery Address</h4>
              <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border">
                {viewingRequest.deliveryAddress || "Corporate Head Office"}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-400 uppercase">Special Instructions / Notes</h4>
              <p className="text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border leading-relaxed">
                {viewingRequest.notes || viewingRequest.specialInstructions || "No special instructions provided."}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => handlePrintPR(viewingRequest)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold text-slate-600 transition flex items-center gap-1.5"
              >
                <Printer size={16} />
                Print Order
              </button>
              <button 
                onClick={() => setViewingRequest(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 rounded-xl text-xs sm:text-sm font-bold text-white transition"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;