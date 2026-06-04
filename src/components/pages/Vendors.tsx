import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";
import { toast } from "sonner";
import { getSavedSettings, getCurrencySymbol, formatDate, buildLogoUrl } from "../../utils/settingsHelper";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
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
  Star,
  Zap,
  Award,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Save,
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
  // Extended fields for vendor selection
  rating?: number;           // 1–5
  deliveryDays?: number;     // typical delivery time
  unitPrice?: number;        // default unit price
  onTimeRate?: number;       // on-time delivery % (0–100)
  totalOrders?: number;
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
    logo: "HP",
    rating: 4.5,
    deliveryDays: 5,
    unitPrice: 45000,
    onTimeRate: 94,
    totalOrders: 128,
    status: "Active",
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
    logo: "DELL",
    rating: 4.8,
    deliveryDays: 3,
    unitPrice: 42000,
    onTimeRate: 98,
    totalOrders: 214,
    status: "Active",
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
    logo: "LOGI",
    rating: 4.2,
    deliveryDays: 7,
    unitPrice: 850,
    onTimeRate: 89,
    totalOrders: 76,
    status: "Active",
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
    logo: "BT",
    rating: 4.0,
    deliveryDays: 4,
    unitPrice: 1200,
    onTimeRate: 91,
    totalOrders: 52,
    status: "Active",
  },
  {
    id: 5,
    name: "Lenovo Enterprise",
    category: "Laptops & Computers",
    contactPerson: "Priya Sharma",
    email: "priya@lenovo-ent.in",
    phone: "+91-9900112233",
    gst: "07LENV3456C3",
    location: "Gurgaon, Haryana",
    address: "Cyber City, Gurgaon, Haryana",
    logo: "LEN",
    rating: 4.6,
    deliveryDays: 4,
    unitPrice: 38000,
    onTimeRate: 96,
    totalOrders: 167,
    status: "Active",
  },
  {
    id: 6,
    name: "Tata Office Solutions",
    category: "Office Furniture & Equipment",
    contactPerson: "Arun Mehta",
    email: "arun@tata-office.co.in",
    phone: "+91-9711223344",
    gst: "27TATA9876F1",
    location: "Mumbai, India",
    address: "BKC, Bandra, Mumbai",
    logo: "TATA",
    rating: 4.3,
    deliveryDays: 6,
    unitPrice: 15000,
    onTimeRate: 88,
    totalOrders: 43,
    status: "Active",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   VENDOR SELECTION PANEL — Shown when routed from Approvals (Procurement flow)
───────────────────────────────────────────────────────────────────────────── */
interface MRContext {
  _id: string;
  referenceId: string;
  requester: string;
  priority: string;
  department: string;
  productDetails: string;
  quantity: number;
  status: string;
  createdAt?: string;
}

type AutoAssignRule = "highest-rating" | "lowest-price" | "fastest-delivery";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${
          s <= Math.floor(rating)
            ? "text-amber-400 fill-amber-400"
            : s - rating < 1
            ? "text-amber-400 fill-amber-200"
            : "text-slate-200 fill-slate-200"
        }`}
      />
    ))}
    <span className="ml-1 text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
  </div>
);

const VendorSelectionPanel = ({
  mrContext,
  allVendors,
  onDismiss,
  onPOCreated,
}: {
  mrContext: MRContext;
  allVendors: Vendor[];
  onDismiss: () => void;
  onPOCreated: (poId: string, vendorName: string) => void;
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [autoRule, setAutoRule] = useState<AutoAssignRule>("highest-rating");
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [unitPrice, setUnitPrice] = useState(1200);
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [expectedDelivery, setExpectedDelivery] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [poCreated, setPoCreated] = useState<{ poId: string; vendorName: string } | null>(null);

  // Active (non-inactive) vendors only
  const activeVendors = allVendors.filter(
    (v) => (v.status || "Active").toLowerCase() !== "inactive"
  );

  // Filter by search and loosely by product category
  const productKeywords = mrContext.productDetails.toLowerCase().split(/[\s,&]+/).filter(Boolean);
  const filteredVendors = activeVendors.filter((v) => {
    const name = (v.name || v.vendorName || "").toLowerCase();
    const cat = (v.category || v.productType || "").toLowerCase();
    const searchLower = search.toLowerCase();
    if (search && !name.includes(searchLower) && !cat.includes(searchLower)) return false;
    return true;
  });

  // Category-matched vendors (shown with a badge)
  const isMatchedVendor = (v: Vendor) => {
    const cat = (v.category || v.productType || "").toLowerCase();
    return productKeywords.some((kw) => cat.includes(kw));
  };

  // Auto-select best vendor based on rule
  const getBestVendor = (rule: AutoAssignRule): Vendor | null => {
    if (filteredVendors.length === 0) return null;
    const sorted = [...filteredVendors];
    if (rule === "highest-rating") {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (rule === "lowest-price") {
      sorted.sort((a, b) => (a.unitPrice ?? Infinity) - (b.unitPrice ?? Infinity));
    } else if (rule === "fastest-delivery") {
      sorted.sort((a, b) => (a.deliveryDays ?? 999) - (b.deliveryDays ?? 999));
    }
    return sorted[0] ?? null;
  };

  const handleAutoAssign = () => {
    const best = getBestVendor(autoRule);
    if (best) {
      setSelectedVendor(best);
      setUnitPrice(best.unitPrice ?? 1200);
      toast.success(`Auto-assigned: ${best.name ?? best.vendorName} (${autoRule.replace(/-/g, " ")})`);
    } else {
      toast.error("No eligible vendors found.");
    }
  };

  // Calculate financials
  const shortageQty = mrContext.quantity;
  const subtotal = shortageQty * unitPrice;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + tax;

  const handleCreatePO = async () => {
    if (!selectedVendor) { toast.error("Please select a vendor first."); return; }
    setIsCreatingPO(true);
    try {
      const poId = "PO-" + Date.now();
      const today = new Date().toISOString().split("T")[0];
      const vendorName = selectedVendor.name ?? selectedVendor.vendorName ?? "Unknown";
      const vendorContact = `${selectedVendor.contactPerson ?? ""} (${selectedVendor.phone ?? ""})`;
      const vendorAddr = selectedVendor.primaryaddress ?? selectedVendor.address ?? selectedVendor.location ?? "";

      // ── 1. Save vendor map in localStorage
      const mrVendorsRaw = localStorage.getItem("invenpro_mr_vendors") || "{}";
      let mrVendorsMap: Record<string, any> = {};
      try { mrVendorsMap = JSON.parse(mrVendorsRaw); } catch {}
      mrVendorsMap[mrContext._id] = { vendorName, vendorContact, vendorAddress: vendorAddr, unitPrice };
      localStorage.setItem("invenpro_mr_vendors", JSON.stringify(mrVendorsMap));

      // ── 2. Update MR status in DB → "Vendor Selected"
      try {
        await axios.put(`${API_BASE_URL}/material/${mrContext._id}/status`, { status: "Vendor Selected" });
      } catch (e) { console.warn("Backend status update failed:", e); }

      // ── 3. Save PO in localStorage (invenpro_pos)
      const posRaw = localStorage.getItem("invenpro_pos") || "[]";
      let posList: any[] = [];
      try { posList = JSON.parse(posRaw); } catch {}
      const newPO = {
        id: poId,
        rfqId: "N/A",
        quotationId: "N/A",
        vendorName,
        vendorContact,
        vendorAddress: vendorAddr,
        productName: mrContext.productDetails,
        quantity: shortageQty,
        unitPrice,
        taxPercent: 18,
        discountPercent: 0,
        subtotal,
        taxAmount: tax,
        discountAmount: 0,
        shippingCost: 0,
        grandTotal,
        expectedDeliveryDate: expectedDelivery || today,
        paymentTerms,
        currency: "INR (₹)",
        status: "Draft",
        createdBy: "Manager Bhabani",
        approvedBy: "",
        createdDate: today,
        materialRequestRef: mrContext.referenceId,
      };
      posList.unshift(newPO);
      localStorage.setItem("invenpro_pos", JSON.stringify(posList));

      // ── 4. Update MR status → "PO Created"
      try {
        await axios.put(`${API_BASE_URL}/material/${mrContext._id}/status`, { status: "PO Created" });
      } catch (e) { console.warn("Backend PO Created status update failed:", e); }

      // ── 5. Audit log
      const logsRaw = localStorage.getItem("invenpro_audit_logs") || "[]";
      let logs: any[] = [];
      try { logs = JSON.parse(logsRaw); } catch {}
      const now = new Date();
      logs.unshift({
        id: "LOG-" + Math.floor(100000 + Math.random() * 900000),
        action: `Vendor ${vendorName} assigned and PO ${poId} created for MR ${mrContext.referenceId} (Qty: ${shortageQty}, Total: ₹${grandTotal.toLocaleString()})`,
        user: "Manager Bhabani",
        timestamp: `${today} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
        role: "procurement",
      });
      localStorage.setItem("invenpro_audit_logs", JSON.stringify(logs));

      // ── 6. Also try backend audit log API
      try {
        await axios.post(`${API_BASE_URL}/audit-log`, {
          userName: "Manager Bhabani",
          transactionId: poId,
          moduleName: "Purchase Order",
          actionPerformed: `Vendor ${vendorName} selected and PO ${poId} created for MR ${mrContext.referenceId}`,
          previousStatus: "Procurement Required",
          newStatus: "PO Created",
          materialRequestId: mrContext._id,
        });
      } catch {}

      setPoCreated({ poId, vendorName });
      toast.success(`Purchase Order ${poId} created successfully! 🎉`);
      onPOCreated(poId, vendorName);
    } catch (err: any) {
      toast.error(err.message || "Failed to create Purchase Order.");
    } finally {
      setIsCreatingPO(false);
    }
  };

  if (poCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black">Purchase Order Created!</h2>
            <p className="text-emerald-100 mt-1 text-sm">Vendor assigned and PO generated successfully</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "PO Number", value: poCreated.poId, color: "text-blue-700" },
                { label: "Vendor", value: poCreated.vendorName, color: "text-slate-800" },
                { label: "MR Reference", value: mrContext.referenceId, color: "text-slate-800" },
                { label: "Status", value: "PO Created → Draft", color: "text-orange-600" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className={`text-sm font-bold mt-0.5 ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Next step: Go to Procurement → Purchase Orders to approve the PO and track vendor delivery
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/procurement")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-blue-700 transition shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                View in Procurement
              </button>
              <button
                onClick={onDismiss}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Back to Vendors
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-amber-50/20 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onDismiss}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </button>
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Procurement Workflow</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Vendor Selection &amp; PO Creation</h1>
        </div>
      </div>

      {/* MR Context Banner */}
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg shadow-orange-100">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div>
            <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest">Material Request — Procurement Required</p>
            <h2 className="text-xl font-black mt-0.5">{mrContext.productDetails}</h2>
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              <span><span className="opacity-75">Ref:</span> <strong>{mrContext.referenceId}</strong></span>
              <span><span className="opacity-75">Qty:</span> <strong>{mrContext.quantity} units</strong></span>
              <span><span className="opacity-75">Dept:</span> <strong>{mrContext.department}</strong></span>
              <span><span className="opacity-75">Requester:</span> <strong>{mrContext.requester}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {mrContext.priority} Priority
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── LEFT: Vendor List ── */}
        <div className="lg:col-span-7 space-y-4">

          {/* Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vendor name or category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                />
              </div>
              <button
                onClick={() => setIsAutoMode((p) => !p)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition border ${
                  isAutoMode
                    ? "bg-violet-600 text-white border-violet-600 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                }`}
              >
                <Zap className="w-4 h-4" />
                Auto Assign
              </button>
            </div>

            {isAutoMode && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-violet-700">Assign by:</span>
                {(["highest-rating", "lowest-price", "fastest-delivery"] as AutoAssignRule[]).map((rule) => (
                  <button
                    key={rule}
                    onClick={() => setAutoRule(rule)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      autoRule === rule
                        ? "bg-violet-600 text-white shadow"
                        : "bg-white border border-violet-200 text-violet-600 hover:bg-violet-100"
                    }`}
                  >
                    {rule === "highest-rating" ? "⭐ Highest Rating" : rule === "lowest-price" ? "💰 Lowest Price" : "⚡ Fastest Delivery"}
                  </button>
                ))}
                <button
                  onClick={handleAutoAssign}
                  className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Apply
                </button>
              </div>
            )}

            <p className="text-[10px] text-slate-400 font-semibold">
              Showing <strong className="text-slate-600">{filteredVendors.length}</strong> active vendors
              {search && <> matching <strong className="text-orange-600">"{search}"</strong></>}
            </p>
          </div>

          {/* Vendor Cards */}
          <div className="space-y-3">
            {filteredVendors.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No vendors found</p>
                <p className="text-slate-400 text-xs mt-1">Try clearing the search filter</p>
              </div>
            )}
            {filteredVendors.map((vendor) => {
              const name = vendor.name ?? vendor.vendorName ?? "Unknown";
              const cat = vendor.category ?? vendor.productType ?? "General";
              const isSelected = selectedVendor && (selectedVendor.id === vendor.id || selectedVendor._id === vendor._id);
              const isMatched = isMatchedVendor(vendor);
              const initials = name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();
              const bgColors = ["from-blue-500 to-indigo-500", "from-violet-500 to-purple-600", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500", "from-rose-500 to-pink-500"];
              const bg = bgColors[((vendor.id ?? 1) - 1) % bgColors.length];

              return (
                <div
                  key={vendor._id ?? vendor.id}
                  onClick={() => { setSelectedVendor(vendor); setUnitPrice(vendor.unitPrice ?? 1200); }}
                  className={`bg-white rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "border-orange-400 shadow-lg shadow-orange-50 ring-2 ring-orange-300"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="p-4 flex gap-4">
                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bg} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-slate-800 text-sm">{name}</h3>
                            {isMatched && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                ✓ Category Match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{cat}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Stats row */}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <StarRating rating={vendor.rating ?? 4.0} />
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {vendor.deliveryDays ?? 7}d delivery
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {vendor.onTimeRate ?? 90}% on-time
                        </span>
                        <span className="text-xs font-bold text-indigo-700">
                          ₹{(vendor.unitPrice ?? 1200).toLocaleString()}/unit
                        </span>
                      </div>

                      {/* Contact */}
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" />{vendor.contactPerson ?? "Contact"}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{vendor.phone ?? "—"}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{vendor.location ?? (vendor.primaryaddress ?? vendor.address ?? "—")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: PO Builder Panel ── */}
        <div className="lg:col-span-5">
          <div className="sticky top-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 text-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-black text-base">Purchase Order Builder</h3>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">Review details and create PO</p>
            </div>

            <div className="p-4 space-y-4">
              {/* Selected Vendor */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selected Vendor</p>
                {selectedVendor ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                      {(selectedVendor.name ?? selectedVendor.vendorName ?? "V").split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{selectedVendor.name ?? selectedVendor.vendorName}</p>
                      <StarRating rating={selectedVendor.rating ?? 4.0} />
                    </div>
                    <button onClick={() => setSelectedVendor(null)} className="ml-auto text-slate-400 hover:text-red-500 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400">
                    <Building2 className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs font-semibold">Select a vendor from the list</p>
                  </div>
                )}
              </div>

              {/* PO Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
                  >
                    <option>COD</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 60</option>
                  </select>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PO Summary</p>
                <div className="flex justify-between"><span className="text-slate-500">Product</span><span className="font-semibold text-slate-700 text-right max-w-[60%] truncate">{mrContext.productDetails}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="font-bold text-slate-700">{shortageQty} units</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Unit Price</span><span className="font-bold text-slate-700">₹{unitPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold text-slate-700">₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span className="font-bold text-slate-700">₹{tax.toLocaleString()}</span></div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-bold text-slate-700">Grand Total</span>
                  <span className="font-black text-indigo-700 text-sm">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Create PO Button */}
              <button
                onClick={handleCreatePO}
                disabled={!selectedVendor || isCreatingPO}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-black shadow-md shadow-orange-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingPO ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Creating PO…</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" />Confirm Vendor &amp; Create Purchase Order</>
                )}
              </button>

              {/* Workflow Steps */}
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Workflow</p>
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                  {["Procurement Required", "Vendor Assigned", "PO Created", "Vendor Delivery", "GRN", "Inventory Update", "Ready For Issue", "Completed"].map((step, i, arr) => (
                    <span key={step} className="flex items-center gap-1">
                      <span className={`font-semibold ${
                        step === "Procurement Required" || step === "Vendor Assigned" || step === "PO Created"
                          ? "text-orange-600 font-bold"
                          : "text-slate-400"
                      }`}>{step}</span>
                      {i < arr.length - 1 && <span className="text-slate-300">›</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ---------------- Performance Data ---------------- */




const getFriendlyPrId = (item: any): string => {
  const originalId = item._id || item.id || "";
  if (!originalId) return "RQ-2026-000";
  
  if (/^RQ-\d{4}-\d{3}$/.test(originalId)) {
    return originalId;
  }
  
  const mappingKey = "invenpro_pr_id_mapping";
  let mapping: Record<string, string> = {};
  try {
    mapping = JSON.parse(localStorage.getItem(mappingKey) || "{}");
  } catch {}
  
  if (mapping[originalId]) {
    return mapping[originalId];
  }
  
  const currentYear = new Date().getFullYear();
  const existingValues = Object.values(mapping);
  let maxSeq = 0;
  existingValues.forEach((val) => {
    const match = val.match(/RQ-\d{4}-(\d{3})/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  
  const nextSeq = maxSeq + 1;
  const formattedSeq = String(nextSeq).padStart(3, "0");
  const newFriendlyId = `RQ-${currentYear}-${formattedSeq}`;
  
  mapping[originalId] = newFriendlyId;
  localStorage.setItem(mappingKey, JSON.stringify(mapping));
  return newFriendlyId;
};

/* ---------------- Page Component ---------------- */
const VendorsPage = () => {
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);
  const [settings, setSettings] = useState(getSavedSettings());
  const currencySymbol = getCurrencySymbol(settings.currency);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getSavedSettings());
    };
    window.addEventListener("invenpro_settings_updated", handleUpdate);
    return () => {
      window.removeEventListener("invenpro_settings_updated", handleUpdate);
    };
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || "all-vendors";
  });  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);

  // ── Centralized Vendor Dashboard States & Helpers ──
  const [selectedDashboardVendor, setSelectedDashboardVendor] = useState<Vendor | null>(null);
  const [selectedPoContext, setSelectedPoContext] = useState<any | null>(null);
  const [poVendorFilter, setPoVendorFilter] = useState<string | null>(null);

  const [showDashboardEditPoModal, setShowDashboardEditPoModal] = useState(false);
  const [dashboardEditingPo, setDashboardEditingPo] = useState<any | null>(null);
  const [dashboardEditPoForm, setDashboardEditPoForm] = useState({
    vendorName: "",
    productName: "",
    quantity: 1,
    unitPrice: 0,
    expectedDeliveryDate: "",
    status: "Draft" as any
  });

  const handleOpenDashboardEditPo = (po: any) => {
    setDashboardEditingPo(po);
    setDashboardEditPoForm({
      vendorName: po.vendorName,
      productName: po.productName,
      quantity: po.quantity,
      unitPrice: po.unitPrice,
      expectedDeliveryDate: po.expectedDeliveryDate,
      status: po.status
    });
    setShowDashboardEditPoModal(true);
  };

  const handleSaveDashboardEditPo = () => {
    if (!dashboardEditingPo) return;
    try {
      const posRaw = localStorage.getItem("invenpro_pos") || "[]";
      let posList = JSON.parse(posRaw);
      const subtotal = dashboardEditPoForm.quantity * dashboardEditPoForm.unitPrice;
      const tax = Math.round(subtotal * 0.18);
      const grandTotal = subtotal + tax;

      posList = posList.map((p: any) => {
        if (p.id === dashboardEditingPo.id) {
          return {
            ...p,
            ...dashboardEditPoForm,
            subtotal,
            taxAmount: tax,
            grandTotal
          };
        }
        return p;
      });

      localStorage.setItem("invenpro_pos", JSON.stringify(posList));
      toast.success(`Purchase Order ${dashboardEditingPo.id} updated successfully!`);
      setShowDashboardEditPoModal(false);
      setDashboardEditingPo(null);
      
      if (selectedPoContext && selectedPoContext.id === dashboardEditingPo.id) {
        setSelectedPoContext({
          ...selectedPoContext,
          ...dashboardEditPoForm,
          subtotal,
          taxAmount: tax,
          grandTotal
        });
      }
    } catch (e) {
      toast.error("Failed to edit Purchase Order.");
    }
  };

  const [showDashboardDeletePoConfirm, setShowDashboardDeletePoConfirm] = useState(false);
  const [dashboardDeletingPoId, setDashboardDeletingPoId] = useState<string | null>(null);

  const handleConfirmDashboardDeletePo = () => {
    if (!dashboardDeletingPoId) return;
    try {
      const posRaw = localStorage.getItem("invenpro_pos") || "[]";
      let posList = JSON.parse(posRaw);
      posList = posList.filter((p: any) => p.id !== dashboardDeletingPoId);
      localStorage.setItem("invenpro_pos", JSON.stringify(posList));
      toast.success(`Purchase Order ${dashboardDeletingPoId} has been deleted.`);
      
      if (selectedPoContext && selectedPoContext.id === dashboardDeletingPoId) {
        setSelectedPoContext(null);
      }
      
      setShowDashboardDeletePoConfirm(false);
      setDashboardDeletingPoId(null);
    } catch (e) {
      toast.error("Failed to delete Purchase Order.");
    }
  };

  const getRelatedPos = (vendorName: string) => {
    try {
      const posRaw = localStorage.getItem("invenpro_pos") || "[]";
      const allPos = JSON.parse(posRaw);
      return allPos.filter((po: any) => (po.vendorName || "").toLowerCase() === vendorName.toLowerCase());
    } catch {
      return [];
    }
  };

  const [selectVendorForMr, setSelectVendorForMr] = useState<any | null>(null);
  const [selectedVendorForMr, setSelectedVendorForMr] = useState<Vendor | null>(null);
  const [poUnitPrice, setPoUnitPrice] = useState<number>(1200);
  // ✅ MR context from Approvals routing
  const [mrContext, setMrContext] = useState<MRContext | null>(
    location.state?.selectVendorForMr ?? null
  );

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

  // Sync activeTab, selectVendorForMr, and location.state.po when location state changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.selectVendorForMr) {
      // ✅ New: set MR context for VendorSelectionPanel
      setMrContext(location.state.selectVendorForMr);
      setSelectVendorForMr(location.state.selectVendorForMr);
      // Pre-select the first vendor if available
      if (vendors.length > 0) {
        setSelectedVendorForMr(vendors[0]);
      } else if (STATIC_VENDORS.length > 0) {
        setSelectedVendorForMr(STATIC_VENDORS[0]);
      }
      // Clean up location state to avoid reopen
      window.history.replaceState({}, document.title);
    }
    if (location.state?.po) {
      const poObj = location.state.po;
      setSelectedPoContext(poObj);
      
      const vName = (poObj.vendorName || "").toLowerCase();
      setPoVendorFilter(poObj.vendorName);
      setActiveTab("all-vendors");
      
      // Select related request if exists or create dummy
      const matchingPr = purchaseRequests.find(pr => (pr.vendor || pr.vendorName || "").toLowerCase() === vName) || {
        id: poObj.materialRequestRef || "PR-2026-901",
        vendor: poObj.vendorName,
        vendorName: poObj.vendorName,
        product: poObj.productName,
        productDetails: poObj.productName,
        quantity: poObj.quantity,
        price: poObj.unitPrice,
        unitPrice: poObj.unitPrice,
        totalAmount: poObj.grandTotal,
        priority: "High",
        status: poObj.status === "Draft" ? "Pending" : "Approved",
        deliveryStatus: poObj.status === "Closed" ? "Delivered" : "Pending",
        createdDate: poObj.createdDate,
        createdAt: poObj.createdDate
      };
      setViewingRequest(matchingPr);

      // Clean up location state to avoid reopen
      window.history.replaceState({}, document.title);
    }
  }, [location.state, vendors, purchaseRequests]);


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

  const handleConfirmVendorForMr = async () => {
    if (!selectVendorForMr) return;
    if (!selectedVendorForMr) {
      toast.error("Please select a vendor first.");
      return;
    }

    let toastId: any = null;
    const vendorNameStr = selectedVendorForMr.vendorName || selectedVendorForMr.name || "Unknown Vendor";
    try {
      toastId = toast.loading ? toast.loading(`Assigning Vendor ${vendorNameStr} to request ${selectVendorForMr.referenceId}...`) : null;
    } catch {
      toastId = toast(`Assigning Vendor ${vendorNameStr}...`);
    }

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Get logged in user
      let createdBy = "Bhabani";
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const claims = JSON.parse(atob(token.split(".")[1]));
          if (claims && claims.username) {
            createdBy = claims.username;
          } else if (claims && claims.name) {
            createdBy = claims.name;
          }
        } catch {}
      }

      // 1. Save MR -> Vendor mapping in localStorage under "invenpro_mr_vendors"
      const cachedMrVendors = localStorage.getItem("invenpro_mr_vendors");
      let mrVendorsMap: Record<string, any> = {};
      if (cachedMrVendors) {
        try {
          mrVendorsMap = JSON.parse(cachedMrVendors);
        } catch {
          mrVendorsMap = {};
        }
      }
      
      const qty = Number(selectVendorForMr.quantity) || 1;
      const price = Number(poUnitPrice) || 1200;

      mrVendorsMap[selectVendorForMr._id] = {
        vendorName: vendorNameStr,
        vendorContact: `${selectedVendorForMr.contactPerson || "Contact Person"} (${selectedVendorForMr.phone || "Phone"})`,
        vendorAddress: selectedVendorForMr.primaryaddress || selectedVendorForMr.address || selectedVendorForMr.location || "Vendor Address",
        unitPrice: price,
        qty: qty
      };
      localStorage.setItem("invenpro_mr_vendors", JSON.stringify(mrVendorsMap));

      // 2. Update request status in MongoDB to "Vendor Selected" using the new general PUT status route
      try {
        await axios.put(`${API_BASE_URL}/material/${selectVendorForMr._id}/status`, { status: "Vendor Selected" });
      } catch (err) {
        console.warn("Backend status update failed, saving status in localStorage", err);
      }

      // 3. Append Audit Log in `invenpro_audit_logs`
      const cachedLogs = localStorage.getItem("invenpro_audit_logs");
      let logsList = [];
      if (cachedLogs) {
        try {
          logsList = JSON.parse(cachedLogs);
        } catch {
          logsList = [];
        }
      }
      const newAuditLog = {
        id: "LOG-" + Math.floor(100000 + Math.random() * 900000),
        action: `Vendor ${vendorNameStr} selected manually for Material Request ${selectVendorForMr.referenceId}. Status advanced to 'Vendor Selected'.`,
        user: createdBy,
        timestamp: `${todayStr} ${timeStr}`,
        role: "procurement"
      };
      logsList.unshift(newAuditLog);
      localStorage.setItem("invenpro_audit_logs", JSON.stringify(logsList));

      // 4. Show success Toast
      try {
        if (toastId && typeof toastId !== "object" && toast.success) {
          toast.success(`Vendor ${vendorNameStr} assigned successfully! Status is now 'Vendor Selected'. 👍`, { id: toastId });
        } else {
          toast.success(`Vendor ${vendorNameStr} assigned successfully! Status is now 'Vendor Selected'. 👍`);
        }
      } catch {
        toast.success(`Vendor ${vendorNameStr} assigned successfully! Status is now 'Vendor Selected'. 👍`);
      }

      // 5. Clear modal state
      setSelectVendorForMr(null);

      // 6. Refresh purchase requests lists so it updates instantly in the view
      fetchPurchaseRequests();

    } catch (error: any) {
      console.error("Vendor selection assignment failed:", error);
      const errMsg = error.message || "Failed to assign vendor.";
      try {
        if (toastId && typeof toastId !== "object" && toast.error) {
          toast.error(errMsg, { id: toastId });
        } else {
          toast.error(errMsg);
        }
      } catch {
        toast.error(errMsg);
      }
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
    const settingsObj = getSavedSettings();
    const curSymbol = getCurrencySymbol(settingsObj.currency);
    const formattedD = formatDate(req.createdAt?.split("T")[0] || req.createdDate || new Date().toISOString().split("T")[0], settingsObj.dateFormat);

    const logoSrc = buildLogoUrl(settingsObj.logoUrl, settingsObj.logoVersion ?? 0, API_BASE_URL);
    const logoHtml = logoSrc 
      ? `<img src="${logoSrc}" alt="${settingsObj.orgName}" style="max-height: 50px; max-width: 150px; object-fit: contain; margin-bottom: 10px;" />`
      : `<div style="height: 40px; width: 40px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; margin-bottom: 10px;">📦</div>`;

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
    const total = req.totalAmount || 0;
    const address = req.deliveryAddress || "Corporate Head Office";
    const notes = req.notes || req.specialInstructions || "N/A";
    
    const productsList = req.products || (req.product ? [{ name: req.product, quantity: req.quantity, price: req.price || 0 }] : []);

    const productsHtml = productsList.map((p: any, idx: number) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 500; color: #1e293b;">${idx + 1}</td>
        <td style="padding: 12px; color: #334155;">${p.name || p.productName}</td>
        <td style="padding: 12px; text-align: center; color: #334155;">${p.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #334155;">${curSymbol}${(p.price || 0).toLocaleString()}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #4f46e5;">${curSymbol}${((p.quantity || 1) * (p.price || 0)).toLocaleString()}</td>
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
              ${logoHtml}
              <div class="logo">${settingsObj.orgName}</div>
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
              <div style="font-size: 13px; color: #475569; margin-top: 2px;">Date: ${formattedD}</div>
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
                <th style="text-align: right; width: 150px;">Unit Price (${curSymbol})</th>
                <th style="text-align: right; width: 150px;">Total Amount (${curSymbol})</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-title">Total PO Value:</div>
              <div class="total-val">${curSymbol}${total.toLocaleString()}</div>
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

  // ✅ Merge STATIC_VENDORS + DB vendors for the panel (ensuring no duplicates by name)
  const allVendorsForPanel: Vendor[] = [...STATIC_VENDORS];
  vendors.forEach((v) => {
    const vName = (v.name || v.vendorName || "").toLowerCase();
    const exists = allVendorsForPanel.some(
      (s) => (s.name || s.vendorName || "").toLowerCase() === vName
    );
    if (!exists) allVendorsForPanel.push(v);
  });

  // ✅ If MR context is present, show the Vendor Selection Panel
  if (mrContext) {
    return (
      <VendorSelectionPanel
        mrContext={mrContext}
        allVendors={allVendorsForPanel}
        onDismiss={() => setMrContext(null)}
        onPOCreated={(_poId, _vendorName) => {
          // Panel will show success screen; nothing extra needed here
        }}
      />
    );
  }

  if (selectedDashboardVendor) {
    const vendor = selectedDashboardVendor;
    const vendorRequests = purchaseRequests.filter(req => {
      const prVendor = (req.vendor || req.vendorName || "").toLowerCase();
      const vName = (vendor.name || vendor.vendorName || "").toLowerCase();
      return prVendor === vName;
    });

    const relatedPos = getRelatedPos(vendor.name || vendor.vendorName || "");

    // Summary Cards Calculations
    const totalRequests = vendorRequests.length;
    const pendingApprovals = vendorRequests.filter(r => r.status === "Pending").length;
    const approvedRequests = vendorRequests.filter(r => r.status === "Approved").length;
    const rejectedRequests = vendorRequests.filter(r => r.status === "Rejected").length;
    const deliveredRequests = vendorRequests.filter(r => r.deliveryStatus === "Delivered").length;

    // Timeline calculation based on viewingRequest and selectedPoContext
    const activeTimelineStatus = (() => {
      if (selectedPoContext) {
        const poStatus = selectedPoContext.status;
        if (poStatus === "Closed") return "Completed";
        if (poStatus === "Sent to Vendor") return "Sent to Vendor";
        if (poStatus === "Approved") return "Purchase Order Created";
        if (poStatus === "Draft") return "Purchase Order Created";
      }
      if (viewingRequest) {
        const prStatus = viewingRequest.status;
        const prDelStatus = viewingRequest.deliveryStatus;
        if (prDelStatus === "Delivered") return "Delivered";
        if (prDelStatus === "Processing") return "Delivery In Progress";
        if (prStatus === "Approved") return "Approved / Rejected";
        if (prStatus === "Rejected") return "Approved / Rejected";
        if (prStatus === "Pending") return "Under Review";
      }
      return "Draft Created";
    })();

    // Timeline rendering helper
    const TIMELINE_STEPS = [
      { key: "Draft Created", label: "Draft Created", desc: "Requisition initiated" },
      { key: "Request Submitted", label: "Request Submitted", desc: "Awaiting review" },
      { key: "Under Review", label: "Under Review", desc: "Manager assessment" },
      { key: "Approved / Rejected", label: "Approved / Rejected", desc: "Approval decision" },
      { key: "Purchase Order Created", label: "Purchase Order Created", desc: "PO generated" },
      { key: "Sent to Vendor", label: "Sent to Vendor", desc: "Dispatched to supplier" },
      { key: "Delivery In Progress", label: "Delivery In Progress", desc: "Shipment in transit" },
      { key: "Delivered", label: "Delivered", desc: "Received at warehouse" },
      { key: "Completed", label: "Completed", desc: "Fulfillment finalized" }
    ];

    const timelineOrder = TIMELINE_STEPS.map(s => s.key);
    const activeStepIdx = timelineOrder.indexOf(activeTimelineStatus);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Procurement</span>
              <span className="text-slate-300">/</span>
              <span>Vendors</span>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-600 font-extrabold">Dashboard</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              {vendor.name || vendor.vendorName}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {vendor.status || "Active"}
              </span>
            </h1>
          </div>
          <button
            onClick={() => { setSelectedDashboardVendor(null); setSelectedPoContext(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm self-start sm:self-center"
          >
            <ArrowLeft size={14} />
            Back to Vendor List
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT PANEL: Vendor Info & Procurement Timeline */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Vendor Information Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <Building2 size={14} className="text-indigo-500" />
                Vendor Information
              </h3>
              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vendor ID</span>
                  <span className="text-slate-800 font-black text-xs">VND-{vendor.id || "00" + String(vendor._id || "").slice(-4).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vendor Name</span>
                  <span className="text-slate-800 font-extrabold text-sm">{vendor.name || vendor.vendorName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Person</span>
                  <span className="text-slate-700 font-semibold">{vendor.contactPerson || "Authorized Agent"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="text-slate-700 font-semibold">{vendor.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="text-slate-700 font-semibold">{vendor.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GST Number</span>
                  <span className="text-slate-700 font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit block">{vendor.gst || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Address</span>
                  <span className="text-slate-700 font-semibold leading-relaxed">{vendor.primaryaddress || vendor.address || vendor.location}</span>
                </div>
              </div>
            </div>

            {/* Procurement Timeline Stepper Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <Clock size={14} className="text-indigo-500" />
                Procurement Timeline
              </h3>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-2.5 bottom-2 w-0.5 bg-slate-100" />
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = idx <= activeStepIdx;
                  const isActive = idx === activeStepIdx;
                  return (
                    <div key={step.key} className="relative flex flex-col gap-0.5">
                      {/* Stepper Dot */}
                      <span className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 transition ${
                        isDone
                          ? isActive
                            ? "bg-indigo-600 border-indigo-600 ring-4 ring-indigo-100"
                            : "bg-emerald-500 border-emerald-500"
                          : "bg-white border-slate-200"
                      }`} />
                      <p className={`text-xs font-bold ${isDone ? (isActive ? "text-indigo-700" : "text-slate-700") : "text-slate-400"}`}>
                        {step.label}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: PR Control Panel, Details, and Related POs */}
          <div className="lg:col-span-8 space-y-6">

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Requests", value: totalRequests, color: "text-slate-800", bg: "bg-indigo-50 text-indigo-600" },
                { label: "Pending Approvals", value: pendingApprovals, color: "text-amber-600", bg: "bg-amber-50 text-amber-600" },
                { label: "Approved Requests", value: approvedRequests, color: "text-emerald-600", bg: "bg-emerald-50 text-emerald-600" },
                { label: "Rejected Requests", value: rejectedRequests, color: "text-rose-600", bg: "bg-rose-50 text-rose-600" },
                { label: "Delivered Requests", value: deliveredRequests, color: "text-blue-600", bg: "bg-blue-50 text-blue-600" }
              ].map(card => (
                <div key={card.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{card.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-xl font-black ${card.color}`}>{card.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Purchase Request Control Panel */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-800">Purchase Requests Control Panel</h3>
                  <p className="text-xs text-slate-400 font-semibold">Vendor specific purchase requests & statuses</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-3">Request ID</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total Amount</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Approval</th>
                      <th className="p-3">Delivery</th>
                      <th className="p-3">Linked POs</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {vendorRequests.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">No purchase requests for this vendor.</td>
                      </tr>
                    ) : (
                      vendorRequests.map(req => {
                        const prId = req._id || req.id;
                        const prProduct = req.product || (Array.isArray(req.products) && req.products[0]?.name) || "General Items";
                        const prStatus = req.status || "Pending";
                        const prDelStatus = req.deliveryStatus || "Pending";
                        const prAmount = req.totalAmount || 0;
                        const prPriority = req.priority || "Medium";

                        const linkedPos = relatedPos.filter((po: any) => {
                          const ref = (po.materialRequestRef || "").toLowerCase();
                          const prRefId = (req.referenceId || "").toLowerCase();
                          const pId = (req.id || req._id || "").toLowerCase();
                          return ref && (ref === prRefId || ref === pId || ref === pId.replace("pr-", ""));
                        });

                        return (
                          <tr
                            key={prId}
                            onClick={() => {
                              setViewingRequest(req);
                              const matchedPo = relatedPos.find((po: any) => po.materialRequestRef === req.referenceId || po.materialRequestRef === req.id || po.productName === req.productDetails);
                              if (matchedPo) {
                                setSelectedPoContext(matchedPo);
                              }
                            }}
                            className={`hover:bg-slate-50/50 cursor-pointer transition ${viewingRequest?.id === req.id ? "bg-indigo-50/40" : ""}`}
                          >
                            <td className="p-3">
                              <span className="font-black text-indigo-700 text-[10px] tracking-tight bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{prId}</span>
                            </td>
                            <td className="p-3 font-bold text-slate-800 truncate max-w-[120px]" title={prProduct}>{prProduct}</td>
                            <td className="p-3 text-center font-bold text-slate-900">{req.quantity || req.totalQty || 1}</td>
                            <td className="p-3 text-right font-black text-slate-700">{currencySymbol}{prAmount.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                                prPriority === "High" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                prPriority === "Low" ? "bg-green-50 text-green-700 border-green-100" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                              }`}>{prPriority}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                prStatus === "Approved" ? "bg-green-50 text-green-700 border-green-200" :
                                prStatus === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>{prStatus}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                prDelStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                prDelStatus === "Processing" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-slate-50 text-slate-500 border-slate-200"
                              }`}>{prDelStatus}</span>
                            </td>
                            <td className="p-3">
                              {linkedPos.length === 0 ? (
                                <span className="text-[10px] text-slate-400 font-semibold italic">Direct Request (No PO)</span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {linkedPos.map((po: any) => (
                                    <span
                                      key={po.id}
                                      className="font-black text-violet-700 text-[9px] bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100"
                                      title={`Status: ${po.status}`}
                                    >
                                      {po.id}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => setViewingRequest(req)}
                                  className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg border"
                                  title="View Request"
                                >
                                  <Eye size={12} />
                                </button>
                                <button
                                  onClick={() => handlePrintPR(req)}
                                  className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg border"
                                  title="Print Request"
                                >
                                  <Printer size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purchase Orders Section (All created Purchase Orders for this vendor) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-800">Purchase Orders Section</h3>
                  <p className="text-xs text-slate-400 font-semibold">All created Purchase Orders for the selected vendor</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Request ID</th>
                      <th className="p-3">Vendor Name</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Product Details</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total Amount</th>
                      <th className="p-3">Created Date</th>
                      <th className="p-3">Created By</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {relatedPos.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400 font-bold">No purchase orders found for this vendor.</td>
                      </tr>
                    ) : (
                      relatedPos.map((po: any) => {
                        return (
                          <tr
                            key={po.id}
                            className="hover:bg-slate-50/50 transition cursor-pointer"
                            onClick={() => setSelectedPoContext(po)}
                          >
                            <td className="p-3">
                              <span className="font-black text-indigo-700 text-[10px] tracking-tight bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{po.id}</span>
                            </td>
                            <td className="p-3">
                              {po.materialRequestRef && po.materialRequestRef !== "N/A" ? (
                                <span className="font-black text-violet-700 text-[10px] tracking-tight bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">{po.materialRequestRef}</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold italic">Direct PO</span>
                              )}
                            </td>
                            <td className="p-3 font-bold text-slate-800 truncate max-w-[120px]">{po.vendorName}</td>
                            <td className="p-3 font-bold text-slate-700 truncate max-w-[120px]">{po.productName || "General Items"}</td>
                            <td className="p-3 text-slate-600 truncate max-w-[120px]">{po.productName || po.productDetails || "General Details"}</td>
                            <td className="p-3 text-center font-bold text-slate-900">{po.quantity}</td>
                            <td className="p-3 text-right font-black text-indigo-600">{currencySymbol}{po.grandTotal.toLocaleString()}</td>
                            <td className="p-3 text-slate-500">{po.createdDate || "—"}</td>
                            <td className="p-3 text-slate-600">{po.createdBy || "—"}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                po.status === "Closed" ? "bg-slate-100 text-slate-500 border-slate-200" :
                                po.status === "Sent to Vendor" ? "bg-blue-100 text-blue-700 border-blue-200" :
                                po.status === "Approved" ? "bg-green-100 text-green-700 border-green-200" :
                                po.status === "Draft" ? "bg-violet-100 text-violet-700 border-violet-200" :
                                "bg-amber-100 text-amber-700 border-amber-200"
                              }`}>{po.status}</span>
                            </td>
                            <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenDashboardEditPo(po)}
                                  className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg border"
                                  title="Edit PO"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => { setDashboardDeletingPoId(po.id); setShowDashboardDeletePoConfirm(true); }}
                                  className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg border"
                                  title="Delete PO"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nest Request Details and Related POs in parallel or sequence */}
            {viewingRequest && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Request Details View Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                    <FileText size={14} className="text-indigo-500" />
                    Request Details View
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="bg-slate-50 border rounded-2xl p-3 space-y-2 font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Request ID</span>
                        <span className="font-extrabold text-indigo-700">{viewingRequest._id || viewingRequest.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Product Details</span>
                        <span className="font-bold text-slate-800 truncate max-w-[150px]">{viewingRequest.product || (Array.isArray(viewingRequest.products) && viewingRequest.products[0]?.name) || "General Items"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Quantity</span>
                        <span className="font-extrabold text-slate-800">{viewingRequest.quantity || viewingRequest.totalQty || 1} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Unit Price</span>
                        <span className="font-extrabold text-slate-800">{currencySymbol}{(viewingRequest.price || viewingRequest.products?.[0]?.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2 font-bold text-slate-800">
                        <span>Total Amount</span>
                        <span className="text-indigo-600 font-black">{currencySymbol}{(viewingRequest.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-3 space-y-2">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Approval Status</h4>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500 font-semibold">Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          viewingRequest.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" :
                          viewingRequest.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>{viewingRequest.status || "Pending"}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Approved By:</span>
                        <span className="font-bold text-slate-700">{viewingRequest.approvedBy || "—"}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Approval Date:</span>
                        <span className="font-bold text-slate-700">{viewingRequest.approvedBy ? (viewingRequest.createdDate || "—") : "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1 font-semibold">Comments:</span>
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border italic">
                          {viewingRequest.status === "Approved" ? "Requisition approved and processed for RFQ/PO release." :
                           viewingRequest.status === "Rejected" ? "Requisition rejected due to pricing or necessity constraints." :
                           "Awaiting initial procurement review."}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-3 space-y-2">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Delivery Tracking</h4>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500">Delivery:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          viewingRequest.deliveryStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          viewingRequest.deliveryStatus === "Processing" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>{viewingRequest.deliveryStatus || "Pending"}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Expected Delivery:</span>
                        <span className="font-bold text-slate-700">{viewingRequest.endDate || "7 Days after approval"}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Actual Date:</span>
                        <span className="font-bold text-slate-700">{viewingRequest.deliveryStatus === "Delivered" ? (viewingRequest.endDate || "—") : "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1 font-semibold">Tracking Number:</span>
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border font-mono">
                          {viewingRequest.deliveryStatus === "Pending" ? "Awaiting dispatch ref" : "TRK-" + (viewingRequest._id || viewingRequest.id).slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Purchase Orders Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                    <ShoppingCart size={14} className="text-indigo-500" />
                    Related Purchase Orders
                  </h3>

                  <div className="space-y-4">
                    {relatedPos.length === 0 ? (
                      <div className="border border-dashed p-6 text-center text-slate-400 rounded-2xl text-xs">
                        No purchase orders linked to this vendor.
                      </div>
                    ) : (
                      relatedPos.map((po: any) => (
                        <div key={po.id} className="bg-slate-50 border rounded-2xl p-4 space-y-3 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded-lg border">{po.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              po.status === "Closed" ? "bg-slate-100 text-slate-500" :
                              po.status === "Sent to Vendor" ? "bg-blue-100 text-blue-700" :
                              po.status === "Approved" ? "bg-green-100 text-green-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>{po.status}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold">
                            <div>
                              <span className="text-[9px] text-slate-400 block">Product</span>
                              <span className="text-slate-800 font-bold truncate block max-w-[120px]">{po.productName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">Quantity</span>
                              <span className="text-slate-800 font-bold">{po.quantity} units</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">Total Amount</span>
                              <span className="text-indigo-600 font-extrabold">{currencySymbol}{po.grandTotal.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">Created By</span>
                              <span className="text-slate-700 font-semibold">{po.createdBy}</span>
                            </div>
                          </div>

                          <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-200/50">
                            <button
                              onClick={() => handleOpenDashboardEditPo(po)}
                              className="px-2.5 py-1.5 bg-white border hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <Edit size={10} /> Edit PO
                            </button>
                            <button
                              onClick={() => { setDashboardDeletingPoId(po.id); setShowDashboardDeletePoConfirm(true); }}
                              className="px-2.5 py-1.5 bg-white border hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <Trash2 size={10} /> Delete PO
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Edit PO Modal for Dashboard */}
        {showDashboardEditPoModal && dashboardEditingPo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden scale-in animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Edit Purchase Order</p>
                  <h3 className="text-white font-black text-lg">{dashboardEditingPo.id}</h3>
                </div>
                <button onClick={() => { setShowDashboardEditPoModal(false); setDashboardEditingPo(null); }}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Vendor Name</label>
                    <input
                      type="text"
                      value={dashboardEditPoForm.vendorName}
                      onChange={e => setDashboardEditPoForm(f => ({ ...f, vendorName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Product Details</label>
                    <input
                      type="text"
                      value={dashboardEditPoForm.productName}
                      onChange={e => setDashboardEditPoForm(f => ({ ...f, productName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={dashboardEditPoForm.quantity}
                      onChange={e => setDashboardEditPoForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Unit Price ({currencySymbol})</label>
                    <input
                      type="number"
                      min={0}
                      value={dashboardEditPoForm.unitPrice}
                      onChange={e => setDashboardEditPoForm(f => ({ ...f, unitPrice: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Expected Delivery</label>
                    <input
                      type="date"
                      value={dashboardEditPoForm.expectedDeliveryDate}
                      onChange={e => setDashboardEditPoForm(f => ({ ...f, expectedDeliveryDate: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Status</label>
                    <select
                      value={dashboardEditPoForm.status}
                      onChange={e => setDashboardEditPoForm(f => ({ ...f, status: e.target.value as any }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Sent to Vendor">Sent to Vendor</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Estimated Total (with 18% GST)</span>
                  <span className="text-indigo-700 font-black text-sm">
                    {currencySymbol}{(dashboardEditPoForm.quantity * dashboardEditPoForm.unitPrice * 1.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button onClick={() => { setShowDashboardEditPoModal(false); setDashboardEditingPo(null); }}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleSaveDashboardEditPo}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-blue-100 flex items-center gap-1.5">
                    <Save size={12} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete PO Confirmation for Dashboard */}
        {showDashboardDeletePoConfirm && dashboardDeletingPoId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden scale-in animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">Confirm Deletion</p>
                  <h3 className="text-white font-black text-base">Delete Purchase Order</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-slate-700 font-semibold text-sm">
                  Are you sure you want to permanently delete <span className="font-black text-red-600">{dashboardDeletingPoId}</span>?
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-xs font-semibold">
                    This action cannot be undone. The Purchase Order will be permanently removed from the list.
                  </p>
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button onClick={() => { setShowDashboardDeletePoConfirm(false); setDashboardDeletingPoId(null); }}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleConfirmDashboardDeletePo}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-red-100 flex items-center gap-1.5">
                    <Trash2 size={12} />
                    Yes, Delete PO
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

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
            {poVendorFilter && (
              <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center text-amber-800 font-semibold text-sm shadow-sm mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Showing vendor for Purchase Order: <strong className="text-amber-900">{poVendorFilter}</strong></span>
                </div>
                <button
                  onClick={() => setPoVendorFilter(null)}
                  className="px-3 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filter
                </button>
              </div>
            )}
            {vendors
              .filter((vendor) => {
                if (!poVendorFilter) return true;
                const name = (vendor.vendorName || vendor.name || "").toLowerCase();
                return name === poVendorFilter.toLowerCase();
              })
              .map((vendor) => {
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
                          onClick={() => {
                            setSelectedDashboardVendor(vendor);
                            const nameStr = vendor.vendorName || vendor.name || "";
                            const match = purchaseRequests.find(pr => (pr.vendor || pr.vendorName || "").toLowerCase() === nameStr.toLowerCase());
                            if (match) {
                              setViewingRequest(match);
                              const matchedPo = getRelatedPos(vendor.name || vendor.vendorName || "").find((po: any) => po.materialRequestRef === match.referenceId || po.materialRequestRef === match.id || po.productName === match.productDetails);
                              if (matchedPo) {
                                setSelectedPoContext(matchedPo);
                              }
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border border-indigo-200 shadow-sm"
                        >
                          <TrendingUp size={16} />
                          View Dashboard
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
                            <th className="p-4">Vendor Name</th>
                            <th className="p-4">Product Details</th>
                            <th className="p-4">Priority</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-center">Approval Status</th>
                            <th className="p-4 text-center">Delivery Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPRs.map((item) => {
                            const prId = item._id || item.id || "N/A";
                            const friendlyPrId = getFriendlyPrId(item);
                            const prProduct = item.product || (Array.isArray(item.products) && item.products.map((p: any) => `${p.name || p.productName} (${p.quantity})`).join(", ")) || "General Items";
                            const prVendor = item.vendor || item.vendorName || "Unknown Supplier";
                            const prStatus = item.status || "Pending";
                            const prDelStatus = item.deliveryStatus || "Pending";
                            const prAmount = item.totalAmount || 0;
                            const prPriority = item.priority || "Medium";

                            return (
                              <tr key={prId} className="border-b last:border-0 hover:bg-slate-50/40">
                                <td className="p-4 font-black text-indigo-600 text-xs" title={friendlyPrId}>{friendlyPrId}</td>
                                <td className="p-4 font-bold text-slate-800">{prVendor}</td>
                                <td className="p-4 text-slate-500 max-w-xs truncate" title={prProduct}>{prProduct}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    prPriority === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                    prPriority === "Low" ? "bg-green-50 text-green-600 border border-green-100" :
                                    "bg-amber-50 text-amber-600 border border-amber-100"
                                  }`}>{prPriority}</span>
                                </td>
                                <td className="p-4 text-right font-extrabold text-slate-700">₹{prAmount.toLocaleString()}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    prStatus === "Approved" ? "bg-green-50 text-green-700 border border-green-200" :
                                    prStatus === "Rejected" ? "bg-red-50 text-red-700 border border-red-200" :
                                    "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                                  }`}>{prStatus}</span>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    prDelStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                    prDelStatus === "Processing" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    "bg-slate-50 text-slate-500 border-slate-200"
                                  }`}>{prDelStatus}</span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end items-center">
                                    <button
                                      onClick={() => {
                                        setViewingRequest(item);
                                        toast.info(`Viewing Purchase Request ${friendlyPrId}`);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white transition shadow-sm"
                                      title="View Details"
                                    >
                                      <Eye size={12} /> View
                                    </button>
                                    <button
                                      onClick={() => {
                                        toast.info(`Edit mode initiated for ${friendlyPrId}`);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:text-amber-600 hover:border-amber-200 bg-white transition shadow-sm"
                                      title="Edit Request"
                                    >
                                      <Edit size={12} /> Edit
                                    </button>
                                    <div className="relative inline-block text-left" onClick={e => e.stopPropagation()}>
                                      <button
                                        onClick={() => setOpenActionDropdownId(openActionDropdownId === prId ? null : prId)}
                                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[10px] transition"
                                      >
                                        ⋮ More
                                      </button>
                                      {openActionDropdownId === prId && (
                                        <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
                                          <button
                                            onClick={() => {
                                              handlePrintPR(item);
                                              setOpenActionDropdownId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                          >
                                            <Printer size={12} /> Print
                                          </button>
                                          {prStatus === "Pending" && (
                                            <>
                                              <button
                                                onClick={() => {
                                                  handlePRStatusUpdate(prId, { status: "Approved" });
                                                  setOpenActionDropdownId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                              >
                                                <Check size={12} /> Approve
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handlePRStatusUpdate(prId, { status: "Rejected" });
                                                  setOpenActionDropdownId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                              >
                                                <X size={12} /> Reject
                                              </button>
                                            </>
                                          )}
                                          <button
                                            onClick={() => {
                                              handleDeletePR(prId);
                                              setOpenActionDropdownId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-700 text-red-600 text-xs font-semibold flex items-center gap-2"
                                          >
                                            <Ban size={12} /> Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
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
                                onClick={() => navigate("/procurement/vendor-details", { state: { vendorName: prVendor } })}
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
                              onClick={() => navigate("/procurement/vendor-details", { state: { vendorName: item.vendor || item.vendorName } })}
                              className="p-2 bg-white hover:bg-slate-100 text-slate-600 border rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                              title="View Vendor Details"
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
              <span className="text-indigo-600 text-lg font-extrabold">{currencySymbol}{(viewingRequest.totalAmount || 0).toLocaleString()}</span>
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

      {/* ── HIGH FIDELITY VENDOR SELECTION MODAL ── */}
      {selectVendorForMr && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col scale-in animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  Supplier Selection Console
                </h3>
                <p className="text-[10px] text-indigo-200 mt-0.5 font-semibold">
                  Source Material Request: {selectVendorForMr.referenceId}
                </p>
              </div>
              <button
                onClick={() => setSelectVendorForMr(null)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50">
              
              {/* Left Panel: MR details */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-orange-100 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    Material Request Details
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">Request Ref</span>
                      <span className="font-bold text-slate-800">{selectVendorForMr.referenceId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Requester</span>
                      <span className="font-bold text-slate-800">{selectVendorForMr.requester}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Department</span>
                      <span className="font-bold text-slate-800">{selectVendorForMr.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Priority</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wide mt-0.5 ${
                        selectVendorForMr.priority === "High" || selectVendorForMr.priority === "Urgent" 
                          ? "bg-red-100 text-red-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {selectVendorForMr.priority}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-orange-100 pt-3 space-y-2">
                    <div>
                      <span className="text-slate-400 block text-xs font-semibold">Items Requested</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 leading-snug">
                        {selectVendorForMr.productDetails}
                      </p>
                    </div>
                    <div className="flex justify-between items-center bg-white rounded-xl p-3 border border-orange-100/50">
                      <span className="text-xs text-slate-500 font-bold">Quantity Required:</span>
                      <span className="text-sm font-black text-orange-600">{selectVendorForMr.quantity} units</span>
                    </div>
                  </div>
                </div>

                {/* Price Config */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    PO Unit Price Settings
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Negotiated Price (Per Unit)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">{currencySymbol}</span>
                      <input
                        type="number"
                        min="1"
                        value={poUnitPrice}
                        onChange={(e) => setPoUnitPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      GST tax of 18% will be automatically calculated on top of this subtotal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel: Vendor selection list */}
              <div className="md:col-span-7 space-y-4 flex flex-col">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex-1 flex flex-col space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Select Corporate Supplier
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Choose the vendor that will supply these items. Contact details will be verified automatically.
                    </p>
                  </div>

                  {/* Vendor Cards List */}
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {vendors.map((v) => {
                      const vId = v._id || v.id?.toString() || "";
                      const isSelected = selectedVendorForMr && (selectedVendorForMr._id === v._id || selectedVendorForMr.id === v.id);
                      return (
                        <div
                          key={vId}
                          onClick={() => setSelectedVendorForMr(v)}
                          className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? "bg-indigo-50/50 border-indigo-500 shadow-md shadow-indigo-100/50"
                              : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition ${
                              isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                            }`}>
                              {v.logo || (v.vendorName || v.name || "V").substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-slate-800">
                                {v.vendorName || v.name}
                              </h5>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {v.contactPerson} • {v.phone}
                              </p>
                            </div>
                          </div>

                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? "border-indigo-600 bg-indigo-600 text-white scale-110" : "border-slate-200 bg-white"
                          }`}>
                            {isSelected && <Check size={10} className="stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Vendor Detailed Card */}
                  {selectedVendorForMr && (
                    <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                          Final Supplier Contact Card
                        </span>
                        {selectedVendorForMr.gst && (
                          <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded-md">
                            GSTIN: {selectedVendorForMr.gst}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Contact Person</span>
                            <span className="font-bold text-slate-700">{selectedVendorForMr.contactPerson}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Email Address</span>
                            <span className="font-bold text-slate-700">{selectedVendorForMr.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Phone Line</span>
                            <span className="font-bold text-slate-700">{selectedVendorForMr.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Operational Address</span>
                            <span className="font-bold text-slate-700">{selectedVendorForMr.primaryaddress || selectedVendorForMr.address || selectedVendorForMr.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Footer Summary & Actions */}
            <div className="bg-slate-100 p-5 border-t border-slate-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Financial Quick Breakdown */}
              {selectedVendorForMr && (
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-4 text-slate-500 font-bold">
                    <span>Subtotal: {currencySymbol}{((selectVendorForMr.quantity || 1) * (poUnitPrice || 1200)).toLocaleString()}</span>
                    <span>GST (18%): {currencySymbol}{Math.round(((selectVendorForMr.quantity || 1) * (poUnitPrice || 1200)) * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2.5 mt-2.5 font-bold">
                    <span>Grand Total:</span>
                    <span className="text-indigo-600 font-extrabold text-base">
                      {currencySymbol}{(Math.round(((selectVendorForMr.quantity || 1) * (poUnitPrice || 1200)) * 1.18)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end shrink-0">
                <button
                  onClick={() => setSelectVendorForMr(null)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold text-slate-600 transition flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmVendorForMr}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 cursor-pointer"
                >
                  <ShoppingCart size={15} />
                  Assign Vendor & Set Status
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;