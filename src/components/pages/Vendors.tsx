import  { useEffect, useState } from "react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
 
  const [activeTab, setActiveTab] = useState("all-vendors");

 
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

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !email || !phone || !address) {
      alert("❌ Please fill in all required fields marked with *");
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

      const response = await axios.post("http://localhost:8080/api/vendor/create", payload);
      
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

        alert("🎉 Vendor successfully created");
        
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
      alert(`❌ ${errMsg}`);
    }
  };
  // FETCH DATA
  useEffect(() => {
    fetchVendors();
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/purchase-request/get");
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
      const res = await axios.get("http://localhost:8080/api/vendor/get");

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
        await axios.delete(`http://localhost:8080/api/vendor/${vendorToDelete._id}`);
      }

      setVendors((prev) => prev.filter((vendor) => {
        const vendorId = vendor._id || vendor.id?.toString() || "";
        return vendorId !== id;
      }));

      alert("🎉 Vendor successfully deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("❌ Failed to delete vendor from the database.");
    }
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
            Purchase Request
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
                <div key={vendorId} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border overflow-hidden">
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
          <div className="min-h-screen p-4 md:p-6">

            {/* Top Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Purchase Requests
                </h1>
                <p className="text-gray-500">
                  Manage all procurement requests
                </p>
              </div>
            </div>

            {purchaseRequests.length > 0 ? (
              <>
                {/* Summary Cards */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                  <div className="bg-white p-5 rounded-2xl shadow-sm">
                    <p className="text-gray-500">Total Requests</p>
                    <h2 className="text-2xl font-bold">{purchaseRequests.length}</h2>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm">
                    <p className="text-gray-500">Pending Orders</p>
                    <h2 className="text-2xl font-bold text-yellow-600">
                      {purchaseRequests.filter((r) => r.status === "Pending").length}
                    </h2>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm">
                    <p className="text-gray-500">Delivered Orders</p>
                    <h2 className="text-2xl font-bold text-green-600">
                      {purchaseRequests.filter((r) => r.status === "Delivered" || r.status === "Approved").length}
                    </h2>
                  </div>
                </div>

                {/* Request Cards */}
                <div className="max-w-7xl mx-auto space-y-5">
                  {purchaseRequests.map((item) => {
                    const prProduct = item.product || (Array.isArray(item.products) && item.products[0]?.name) || "General Items";
                    const prVendor = item.vendor || item.vendorName || "Unknown Supplier";
                    const prQty = item.quantity || item.totalQty || (Array.isArray(item.products) && item.products[0]?.quantity) || 0;
                    const prDate = item.expectedDate || item.createdDate || item.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0];
                    const prNotes = item.notes || item.specialInstructions || "Standard Request";
                    const prStatus = item.status || "Pending";

                    return (
                      <div
                        key={item._id || item.id}
                        className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition duration-300 p-6"
                      >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between gap-4">

                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Package className="text-blue-600" />
                            </div>

                            <div>
                              <h2 className="text-xl font-bold text-gray-800">
                                {prProduct}
                              </h2>
                              <p className="text-gray-500">
                                Vendor: {prVendor}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-4 py-2 rounded-full text-sm font-medium h-fit ${
                              prStatus === "Pending"
                                ? "bg-yellow-100 text-yellow-750"
                                : prStatus === "Delivered" || prStatus === "Approved"
                                ? "bg-green-100 text-green-750"
                                : "bg-red-100 text-red-750"
                            }`}
                          >
                            {prStatus}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

                          <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                            <Package className="text-gray-500" size={18} />
                            <div>
                              <p className="text-gray-500 text-sm">Quantity</p>
                              <h3 className="font-semibold">{prQty} units</h3>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                            <CalendarDays className="text-gray-500" size={18} />
                            <div>
                              <p className="text-gray-500 text-sm">Expected Date</p>
                              <h3 className="font-semibold">
                                {prDate}
                              </h3>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                            <FileText className="text-gray-500" size={18} />
                            <div>
                              <p className="text-gray-500 text-sm">Notes</p>
                              <h3 className="font-semibold">
                                {prNotes}
                              </h3>
                            </div>
                          </div>
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
                <h3 className="text-lg font-black text-slate-800 tracking-tight">No Purchase Requests Found</h3>
                <p className="text-slate-400 text-xs font-semibold mt-2 max-w-sm leading-relaxed">
                  Create a new request to begin. Real-time requests will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default VendorsPage;