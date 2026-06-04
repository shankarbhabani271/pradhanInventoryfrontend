import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";
import { getSavedSettings, getCurrencySymbol } from "../../utils/settingsHelper";
import {
  ArrowLeft,
  Building2,
  Package,
  Hash,
  IndianRupee,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  FileText,
  ShoppingCart,
  AlertCircle,
  MapPin,
  Phone,
  CheckCircle2,
  Circle,
  ChevronRight,
  Mail,
  FileSpreadsheet,
  Layers,
  Award,
  DollarSign,
} from "lucide-react";

/* ── Static Vendors Fallback ── */
const STATIC_VENDORS: any[] = [
  { name: "HP Solutions", category: "Laptops & Computers", contactPerson: "Alok Gupta", email: "alok@hpsolutions.com", phone: "+91-9988776655", gst: "07HP9012H3X7", location: "Delhi, India", address: "Okhla Phase 3, Delhi, India", rating: 4.5, deliveryDays: 5, unitPrice: 45000, onTimeRate: 94, totalOrders: 128, status: "Active" },
  { name: "Dell Technologies", category: "Computers & Servers", contactPerson: "Rajesh Kumar", email: "rajesh@dell.com", phone: "+91-8877665544", gst: "07DELL1234A1", location: "Bangalore, India", address: "Whitefield, Bangalore, India", rating: 4.8, deliveryDays: 3, unitPrice: 42000, onTimeRate: 98, totalOrders: 214, status: "Active" },
  { name: "Logitech India", category: "Peripherals & Accessories", contactPerson: "Sanjay Kumar", email: "sanjay@logitech.in", phone: "+91-7766554433", gst: "07LOGI5678B2", location: "Mumbai, India", address: "Andheri East, Mumbai, India", rating: 4.2, deliveryDays: 7, unitPrice: 850, onTimeRate: 89, totalOrders: 76, status: "Active" },
  { name: "Bhabani Traders", category: "Stationery & Office Supplies", contactPerson: "Bhabani Patra", email: "bhabani@traders.com", phone: "+91-9876543210", gst: "21BHAB8765C1Z9", location: "Bhubaneswar, Odisha", address: "Nayapalli, Bhubaneswar, Odisha", rating: 4.0, deliveryDays: 4, unitPrice: 1200, onTimeRate: 91, totalOrders: 52, status: "Active" }
];

/* ── Status badge helper ── */
const StatusBadge = ({ label, variant }: { label: string; variant: "success" | "warning" | "info" | "error" | "default" }) => {
  const colors = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    error: "bg-red-50 text-red-700 border-red-200",
    default: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const dots = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    error: "bg-red-500",
    default: "bg-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${colors[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />
      {label}
    </span>
  );
};

/* ── Info card row ── */
const InfoRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-sm font-semibold ${highlight ? "text-indigo-700 font-black" : "text-slate-800"}`}>{value || "—"}</p>
  </div>
);

/* ── Section Card ── */
const Section = ({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className={`px-5 py-4 flex items-center gap-3 border-b border-slate-100 ${color}`}>
      <div className="p-2 bg-white/20 rounded-xl">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-white font-black text-sm">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ── Workflow timeline steps ── */
const WORKFLOW_STEPS = [
  { key: "Draft",             label: "Draft Created",            icon: FileText   },
  { key: "Pending Approval",  label: "Submitted for Approval",   icon: Clock      },
  { key: "Approved",          label: "Approved",                 icon: CheckCircle },
  { key: "PO Created",        label: "Purchase Order Created",   icon: ShoppingCart },
  { key: "Sent to Vendor",    label: "Sent to Vendor",           icon: Truck      },
  { key: "In Transit",        label: "Delivery In Progress",     icon: Truck      },
  { key: "Delivered",         label: "Delivered",                icon: Package    },
  { key: "Closed",            label: "Completed",                icon: CheckCircle2 },
];

const STATUS_ORDER = WORKFLOW_STEPS.map(s => s.key);

const WorkflowTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  return (
    <div className="relative">
      <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-slate-100" />
      <div className="space-y-0">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isActive = idx === currentIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center gap-4 py-3 relative">
              {/* Node */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                isDone
                  ? isActive
                    ? "bg-indigo-600 shadow-lg shadow-indigo-200 ring-4 ring-indigo-100"
                    : "bg-emerald-500"
                  : "bg-white border-2 border-slate-200"
              }`}>
                {isDone
                  ? <Icon className="w-4 h-4 text-white" />
                  : <Circle className="w-3 h-3 text-slate-300" />
                }
              </div>
              {/* Label */}
              <div className="flex-1">
                <p className={`text-xs font-bold ${isDone ? (isActive ? "text-indigo-700" : "text-slate-700") : "text-slate-400"}`}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">Current Status</p>
                )}
              </div>
              {isActive && (
                <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   VENDOR DETAILS PAGE
   Dynamic Component supporting PO workflows and Vendor Master Logs
   ══════════════════════════════════════════════════════════ */
export default function VendorDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const po: any = location.state?.po;
  const vendorContext: any = location.state?.vendor || location.state?.vendorName;

  const [settings] = useState(getSavedSettings());
  const currencySymbol = getCurrencySymbol(settings.currency);

  /* Vendor state variables */
  const [vendor, setVendor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeHistoryTab, setActiveHistoryTab] = useState("pr");

  /* Transaction histories state variables */
  const [prHistory, setPrHistory] = useState<any[]>([]);
  const [rfqHistory, setRfqHistory] = useState<any[]>([]);
  const [quoteHistory, setQuoteHistory] = useState<any[]>([]);
  const [poHistory, setPoHistory] = useState<any[]>([]);
  const [grnHistory, setGrnHistory] = useState<any[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<any[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!vendorContext) {
      setLoading(false);
      return;
    }

    const fetchVendorData = async () => {
      try {
        const vName = typeof vendorContext === "string" ? vendorContext : (vendorContext.name || vendorContext.vendorName || "");
        if (!vName) {
          setErrorMsg("Vendor details are unavailable for the selected record.");
          setLoading(false);
          return;
        }

        // 1. Check STATIC_VENDORS
        const staticMatch = STATIC_VENDORS.find(v => (v.name || v.vendorName || "").toLowerCase() === vName.toLowerCase());

        // 2. Fetch from DB
        let dbMatch = null;
        try {
          const res = await axios.get(`${API_BASE_URL}/vendor/get`);
          const loadedVendors = Array.isArray(res.data) ? res.data : (res.data?.vendors || []);
          dbMatch = loadedVendors.find((v: any) => (v.name || v.vendorName || "").toLowerCase() === vName.toLowerCase());
        } catch (e) {
          console.warn("Failed to fetch vendors from API", e);
        }

        const finalVendor = dbMatch || staticMatch || (typeof vendorContext === "object" ? vendorContext : null);

        if (finalVendor) {
          const vNameNormalized = finalVendor.name || finalVendor.vendorName || vName;
          const vNameLower = vNameNormalized.toLowerCase();

          setVendor({
            id: finalVendor.id || finalVendor._id || "VND-" + Math.floor(1000 + Math.random() * 9000),
            name: vNameNormalized,
            contactPerson: finalVendor.contactPerson || "N/A",
            email: finalVendor.email || "N/A",
            phone: finalVendor.phone || "N/A",
            gst: finalVendor.gst || "N/A",
            productType: finalVendor.productType || finalVendor.category || "N/A",
            status: finalVendor.status || "Active",
            address: finalVendor.primaryaddress || finalVendor.address || finalVendor.location || "N/A",
            rating: finalVendor.rating || 4.5,
            onTimeRate: finalVendor.onTimeRate || 95,
          });

          // ── Fetch Transaction Histories ──
          
          // 1. Purchase Request History
          let allPrs: any[] = [];
          try {
            const prRes = await axios.get(`${API_BASE_URL}/purchase-request/get`);
            if (Array.isArray(prRes.data)) allPrs = prRes.data;
          } catch {}
          const localPrsRaw = localStorage.getItem("purchase_requests");
          if (localPrsRaw) {
            try {
              const parsed = JSON.parse(localPrsRaw);
              parsed.forEach((p: any) => {
                if (!allPrs.some(existing => existing.id === p.id || existing._id === p._id)) {
                  allPrs.push(p);
                }
              });
            } catch {}
          }
          const filteredPrs = allPrs.filter(p => (p.vendor || p.vendorName || "").toLowerCase() === vNameLower);
          setPrHistory(filteredPrs);

          // 2. RFQ History
          const rfqsRaw = localStorage.getItem("invenpro_rfqs") || "[]";
          let allRfqs: any[] = [];
          try { allRfqs = JSON.parse(rfqsRaw); } catch {}
          const filteredRfqs = allRfqs.filter(r => 
            Array.isArray(r.selectedVendors) && r.selectedVendors.some((sv: string) => sv.toLowerCase() === vNameLower)
          );
          setRfqHistory(filteredRfqs);

          // 3. Quotation History
          const quotesRaw = localStorage.getItem("invenpro_quotes") || "[]";
          let allQuotes: any[] = [];
          try { allQuotes = JSON.parse(quotesRaw); } catch {}
          const filteredQuotes = allQuotes.filter(q => (q.vendorName || "").toLowerCase() === vNameLower);
          setQuoteHistory(filteredQuotes);

          // 4. Purchase Order History
          const posRaw = localStorage.getItem("invenpro_pos") || "[]";
          let allPos: any[] = [];
          try { allPos = JSON.parse(posRaw); } catch {}
          const filteredPos = allPos.filter(p => (p.vendorName || "").toLowerCase() === vNameLower);
          setPoHistory(filteredPos);

          // 5. GRN History
          const grnsRaw = localStorage.getItem("invenpro_grns") || "[]";
          let allGrns: any[] = [];
          try { allGrns = JSON.parse(grnsRaw); } catch {}
          const filteredGrns = allGrns.filter(g => (g.vendorName || "").toLowerCase() === vNameLower);
          setGrnHistory(filteredGrns);

          // 6. Delivery History
          const delRaw = localStorage.getItem("invenpro_delivery_orders") || "[]";
          let allDels: any[] = [];
          try { allDels = JSON.parse(delRaw); } catch {}
          const filteredDels = allDels.filter(d => (d.vendorName || d.vendor || "").toLowerCase() === vNameLower);
          
          const derivedDels = filteredPrs
            .filter(p => p.deliveryStatus && p.deliveryStatus !== "Pending")
            .map(p => ({
              id: "DEL-" + (p._id || p.id).slice(-6).toUpperCase(),
              poId: p.poRef || "PO-N/A",
              productName: p.product || p.productDetails || "General Items",
              quantity: p.quantity,
              status: p.deliveryStatus,
              createdDate: p.createdDate || p.createdAt || "N/A"
            }));
          
          setDeliveryHistory([...filteredDels, ...derivedDels]);

          // 7. Invoices History
          const invoicesRaw = localStorage.getItem("invenpro_invoices") || "[]";
          let allInvoices: any[] = [];
          try { allInvoices = JSON.parse(invoicesRaw); } catch {}
          const filteredInvoices = allInvoices.filter(inv => (inv.vendorName || "").toLowerCase() === vNameLower);
          setInvoiceHistory(filteredInvoices);

          // 8. Payments History
          const paymentsRaw = localStorage.getItem("invenpro_payments") || "[]";
          let allPayments: any[] = [];
          try { allPayments = JSON.parse(paymentsRaw); } catch {}
          const filteredPayments = allPayments.filter(pay => (pay.vendorName || "").toLowerCase() === vNameLower);
          setPaymentHistory(filteredPayments);

        } else {
          setErrorMsg("Vendor details are unavailable for the selected record.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Vendor details are unavailable for the selected record.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorContext]);

  // Loading indicator for API calls
  if (vendorContext && loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-slate-600 text-sm">Loading vendor record...</p>
        </div>
      </div>
    );
  }

  // Error alert screen
  if (vendorContext && errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md bg-white border rounded-3xl shadow-sm">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="font-black text-slate-800 text-lg">Details Unavailable</h2>
          <p className="text-slate-500 text-sm">{errorMsg}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Fallback: Associated PO not found screen
  if (!po && !vendorContext) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md bg-white border rounded-3xl shadow-sm">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="font-black text-slate-800 text-lg">Associated record not found.</h2>
          <p className="text-slate-500 text-sm">Please navigate using a valid document reference or action button.</p>
          <button
            onClick={() => navigate("/procurement")}
            className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100"
          >
            Back to Procurement
          </button>
        </div>
      </div>
    );
  }

  const statusVariant = (s: string): "success" | "warning" | "info" | "error" | "default" => {
    if (["Approved", "Delivered", "Closed"].includes(s)) return "success";
    if (["Draft", "Pending Approval"].includes(s)) return "warning";
    if (["Sent to Vendor", "In Transit", "PO Created"].includes(s)) return "info";
    if (["Rejected"].includes(s)) return "error";
    return "default";
  };

  /* ────────────────────────────────────────────────────────
     RENDER CASE 1: Vendor Master Overview (redesigned page)
     ──────────────────────────────────────────────────────── */
  if (vendor) {
    // Calculations
    const totalPOs = poHistory.length;
    const totalValue = poHistory.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
    const avgOrderVal = totalPOs ? totalValue / totalPOs : 0;
    const pendingPOs = poHistory.filter(p => p.status !== "Closed").length;
    const completedPOs = poHistory.filter(p => p.status === "Closed").length;

    const pendingDel = deliveryHistory.filter(d => d.status !== "Delivered").length;
    const completedDel = deliveryHistory.filter(d => d.status === "Delivered").length;
    const onTimeRate = vendor.onTimeRate || 95;

    const pendingInv = invoiceHistory.filter(i => i.status !== "Paid").length;
    const paidInv = invoiceHistory.filter(i => i.status === "Paid").length;
    const outstandingAmt = invoiceHistory.filter(i => i.status !== "Paid").reduce((sum, i) => sum + (i.amount || 0), 0);

    const rating = vendor.rating || 4.5;
    const deliveryScore = vendor.onTimeRate || 95;
    const qualityScore = 98;
    const procurementScore = 96;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Vendor Master Page</span>
                </div>
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  {vendor.name}
                  <StatusBadge label={vendor.status} variant={vendor.status.toLowerCase() === "active" ? "success" : "default"} />
                </h1>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
            <span>Procurement</span>
            <ChevronRight className="w-3 h-3" />
            <span>Vendors</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-black">{vendor.id}</span>
          </div>

          {/* Vendor Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Section icon={Building2} title="Vendor Profile & Contact Details" color="bg-gradient-to-r from-indigo-600 to-violet-600">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <InfoRow label="Vendor ID" value={vendor.id} highlight />
                  <InfoRow label="Contact Person" value={vendor.contactPerson} />
                  <InfoRow label="Product Type / Category" value={vendor.productType} />
                  <InfoRow label="Email Address" value={vendor.email} />
                  <InfoRow label="Phone Number" value={vendor.phone} />
                  <InfoRow label="GST Number" value={vendor.gst} />
                  <div className="sm:col-span-3">
                    <InfoRow label="Vendor Address" value={vendor.address} />
                  </div>
                </div>
              </Section>
            </div>
            
            {/* Vendor Performance Metrics */}
            <div className="lg:col-span-1">
              <Section icon={Award} title="Vendor Performance Metrics" color="bg-gradient-to-r from-amber-500 to-orange-500">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-500 font-semibold">Vendor Rating:</span>
                      <span className="font-extrabold text-slate-800">{rating} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${rating * 20}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-500 font-semibold">On-Time Delivery Score:</span>
                      <span className="font-extrabold text-slate-800">{deliveryScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${deliveryScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-500 font-semibold">Quality Score:</span>
                      <span className="font-extrabold text-slate-800">{qualityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${qualityScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-500 font-semibold">Procurement Performance Score:</span>
                      <span className="font-extrabold text-slate-800">{procurementScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${procurementScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </div>

          {/* Three-Column Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Purchase Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <ShoppingCart size={14} className="text-indigo-500" />
                Purchase Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total POs</p>
                  <p className="text-xl font-black text-slate-800">{totalPOs}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Value</p>
                  <p className="text-xl font-black text-indigo-600">₹{totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Avg Order Value</p>
                  <p className="text-sm font-extrabold text-slate-700">₹{Math.round(avgOrderVal).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending / Completed</p>
                  <p className="text-sm font-extrabold text-slate-700">{pendingPOs} / {completedPOs}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Delivery Information */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <Truck size={14} className="text-emerald-500" />
                Delivery Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Deliveries</p>
                  <p className="text-xl font-black text-slate-800">{pendingDel}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Completed Deliveries</p>
                  <p className="text-xl font-black text-emerald-600">{completedDel}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Delivery Performance %</p>
                  <p className="text-sm font-extrabold text-slate-700">{onTimeRate}% On-Time Delivery</p>
                </div>
              </div>
            </div>

            {/* Card 3: Financial Information */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <DollarSign size={14} className="text-blue-500" />
                Financial Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Invoices</p>
                  <p className="text-xl font-black text-slate-800">{pendingInv}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Paid Invoices</p>
                  <p className="text-xl font-black text-blue-600">{paidInv}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Outstanding Balance</p>
                  <p className="text-sm font-extrabold text-rose-600">₹{outstandingAmt.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic History Logs Tabs */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="border-b bg-slate-50/50 px-6 py-4 flex flex-wrap gap-2">
              {[
                { key: "pr", label: "Purchase Requests", count: prHistory.length },
                { key: "rfq", label: "RFQs", count: rfqHistory.length },
                { key: "quote", label: "Quotations", count: quoteHistory.length },
                { key: "po", label: "Purchase Orders", count: poHistory.length },
                { key: "grn", label: "GRNs", count: grnHistory.length },
                { key: "delivery", label: "Deliveries", count: deliveryHistory.length },
                { key: "invoice", label: "Invoices", count: invoiceHistory.length },
                { key: "payment", label: "Payments", count: paymentHistory.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveHistoryTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeHistoryTab === tab.key
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeHistoryTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Tab: Purchase Requests */}
              {activeHistoryTab === "pr" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3">Request ID</th>
                        <th className="p-3">Product Details</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {prHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">No Purchase Request records found.</td>
                        </tr>
                      ) : (
                        prHistory.map(r => (
                          <tr key={r.id || r._id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-bold text-indigo-600">{r.id || r._id}</td>
                            <td className="p-3 text-slate-700 font-bold">{r.product || r.productDetails}</td>
                            <td className="p-3 text-center text-slate-900 font-bold">{r.quantity}</td>
                            <td className="p-3 text-right font-extrabold text-slate-800">₹{r.totalAmount?.toLocaleString() || 0}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === "Approved" ? "bg-green-50 text-green-700" :
                                r.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                              }`}>{r.status}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] text-slate-500 font-semibold">{r.deliveryStatus || "Pending"}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: RFQs */}
              {activeHistoryTab === "rfq" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3">RFQ ID</th>
                        <th className="p-3">PR Reference</th>
                        <th className="p-3">Product Details</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {rfqHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">No RFQ records found.</td>
                        </tr>
                      ) : (
                        rfqHistory.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-bold text-slate-800">{r.id}</td>
                            <td className="p-3 text-blue-600 font-bold">{r.prId}</td>
                            <td className="p-3 text-slate-700 font-bold">{r.productDetails}</td>
                            <td className="p-3 text-center text-slate-900 font-bold">{r.quantity}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{r.status}</span>
                            </td>
                            <td className="p-3 text-slate-400">{r.createdDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Quotations */}
              {activeHistoryTab === "quote" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3">Quotation ID</th>
                        <th className="p-3">RFQ Reference</th>
                        <th className="p-3">Product Details</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Grand Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {quoteHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">No quotation logs found.</td>
                        </tr>
                      ) : (
                        quoteHistory.map(q => (
                          <tr key={q.id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-bold text-slate-800">{q.id}</td>
                            <td className="p-3 text-indigo-600 font-bold">{q.rfqId}</td>
                            <td className="p-3 text-slate-700 font-bold">{q.productDetails || "General Supplies"}</td>
                            <td className="p-3 text-right text-slate-900 font-bold">₹{q.unitPrice?.toLocaleString() || 0}</td>
                            <td className="p-3 text-right font-extrabold text-indigo-600">₹{(q.grandTotal || (q.unitPrice * (q.quantity || 1))).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Purchase Orders */}
              {activeHistoryTab === "po" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3">PO Number</th>
                        <th className="p-3">Product Details</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Grand Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Delivery Expected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {poHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">No Purchase Order records found.</td>
                        </tr>
                      ) : (
                        poHistory.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-bold text-indigo-700">{p.id}</td>
                            <td className="p-3 text-slate-700 font-bold">{p.productName}</td>
                            <td className="p-3 text-center text-slate-900 font-bold">{p.quantity}</td>
                            <td className="p-3 text-right font-black text-indigo-600">₹{p.grandTotal?.toLocaleString() || 0}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === "Closed" ? "bg-slate-100 text-slate-500" :
                                p.status === "Sent to Vendor" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                              }`}>{p.status}</span>
                            </td>
                            <td className="p-3 text-slate-400">{p.expectedDeliveryDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: GRNs */}
              {activeHistoryTab === "grn" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3">GRN No</th>
                        <th className="p-3">PO Reference</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Ordered</th>
                        <th className="p-3 text-center">Received</th>
                        <th className="p-3">QC Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {grnHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">No Goods Receipt Note (GRN) records found.</td>
                        </tr>
                      ) : (
                        grnHistory.map(g => (
                          <tr key={g.id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-bold text-slate-800">{g.id}</td>
                            <td className="p-3 text-indigo-600 font-bold">{g.poId}</td>
                            <td className="p-3 text-slate-700 font-bold">{g.productName}</td>
                            <td className="p-3 text-center text-slate-500">{g.orderedQty}</td>
                            <td className="p-3 text-center text-slate-900 font-bold">{g.receivedQty}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                g.status === "QC Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700 animate-pulse"
                              }`}>{g.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Deliveries */}
              {activeHistoryTab === "delivery" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3">Delivery ID</th>
                        <th className="p-3">PO ID</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {deliveryHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">No Delivery logs found.</td>
                        </tr>
                      ) : (
                        deliveryHistory.map(d => (
                          <tr key={d.id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-bold text-slate-800">{d.id}</td>
                            <td className="p-3 text-indigo-600 font-bold">{d.poId}</td>
                            <td className="p-3 text-slate-700 font-bold">{d.productName}</td>
                            <td className="p-3 text-center text-slate-900 font-bold">{d.quantity}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.status === "Delivered" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                              }`}>{d.status}</span>
                            </td>
                            <td className="p-3 text-slate-400">{d.createdDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Invoices */}
              {activeHistoryTab === "invoice" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3">Invoice Number</th>
                        <th className="p-3">PO Reference</th>
                        <th className="p-3">GRN Reference</th>
                        <th className="p-3">Invoice Date</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {invoiceHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">No Invoice records found.</td>
                        </tr>
                      ) : (
                        invoiceHistory.map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-bold text-indigo-700">{inv.id}</td>
                            <td className="p-3 text-slate-700 font-bold">{inv.poId}</td>
                            <td className="p-3 text-slate-700 font-bold">{inv.grnId || "—"}</td>
                            <td className="p-3 text-slate-500">{inv.invoiceDate}</td>
                            <td className="p-3 text-slate-500">{inv.dueDate}</td>
                            <td className="p-3 text-right font-extrabold text-slate-800">₹{inv.amount?.toLocaleString() || 0}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}>{inv.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Payments */}
              {activeHistoryTab === "payment" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3">Payment ID</th>
                        <th className="p-3">Invoice Reference</th>
                        <th className="p-3">PO Reference</th>
                        <th className="p-3">Payment Date</th>
                        <th className="p-3">Payment Mode</th>
                        <th className="p-3">Bank Reference</th>
                        <th className="p-3 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {paymentHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">No Payment records found.</td>
                        </tr>
                      ) : (
                        paymentHistory.map(pay => (
                          <tr key={pay.id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-bold text-indigo-700">{pay.id}</td>
                            <td className="p-3 text-slate-700 font-bold">{pay.invoiceId}</td>
                            <td className="p-3 text-slate-700 font-bold">{pay.poId || "—"}</td>
                            <td className="p-3 text-slate-500">{pay.paymentDate}</td>
                            <td className="p-3 text-slate-600 font-semibold">{pay.mode || "—"}</td>
                            <td className="p-3 text-slate-500">{pay.bankRef || "—"}</td>
                            <td className="p-3 text-right font-extrabold text-emerald-600">₹{pay.amount?.toLocaleString() || 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────
     RENDER CASE 2: Single Purchase Order Details (as before)
     ──────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ShoppingCart className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Vendor Details</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              {po.id}
              <StatusBadge label={po.status} variant={statusVariant(po.status)} />
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <span>Procurement</span>
          <ChevronRight className="w-3 h-3" />
          <span>Purchase Orders</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700 font-black">{po.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-5">

            {/* Purchase Request Information */}
            <Section icon={FileText} title="Purchase Request Information" color="bg-gradient-to-r from-indigo-600 to-violet-600">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <InfoRow label="PO Number" value={po.id} highlight />
                <InfoRow label="Material Ref" value={po.materialRequestRef || "—"} />
                <InfoRow label="Request Type" value="Purchase Order" />
                <InfoRow label="Vendor Name" value={po.vendorName} />
                <InfoRow label="Product Details" value={po.productName} />
                <InfoRow label="Quantity" value={`${po.quantity} units`} />
                <InfoRow label="Unit Price" value={`₹${po.unitPrice?.toLocaleString() ?? 0}`} />
                <InfoRow label="Subtotal" value={`₹${po.subtotal?.toLocaleString() ?? 0}`} />
                <InfoRow label="Total Amount" value={`₹${po.grandTotal?.toLocaleString() ?? 0}`} highlight />
                <InfoRow label="Requested By" value={po.createdBy || "—"} />
                <InfoRow label="Request Date" value={po.createdDate || "—"} />
                <InfoRow label="Payment Terms" value={po.paymentTerms || "—"} />
              </div>
            </Section>

            {/* Approval Information */}
            <Section icon={CheckCircle} title="Approval Information" color="bg-gradient-to-r from-emerald-500 to-teal-600">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <div className="sm:col-span-3 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approval Status</span>
                  <StatusBadge
                    label={po.status === "Approved" || po.status === "Sent to Vendor" || po.status === "Closed" ? "Approved" : po.status === "Rejected" ? "Rejected" : "Pending"}
                    variant={po.status === "Approved" || po.status === "Sent to Vendor" || po.status === "Closed" ? "success" : po.status === "Rejected" ? "error" : "warning"}
                  />
                </div>
                <InfoRow label="Approved By" value={po.approvedBy || "Awaiting Approval"} />
                <InfoRow label="Approval Date" value={po.approvedBy ? (po.createdDate || "—") : "—"} />
                <InfoRow label="Payment Terms" value={po.paymentTerms || "—"} />
                <div className="sm:col-span-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Approval Comments</p>
                  <p className="text-sm text-slate-700 font-semibold bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    {po.status === "Approved" ? "Purchase Order approved and ready for dispatch to vendor." :
                     po.status === "Rejected" ? "Purchase Order was rejected. Please review and resubmit." :
                     "Awaiting approval from Procurement Manager."}
                  </p>
                </div>
              </div>
            </Section>

            {/* Delivery Information */}
            <Section icon={Truck} title="Delivery Information" color="bg-gradient-to-r from-blue-500 to-indigo-600">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <div className="sm:col-span-3 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Status</span>
                  <StatusBadge
                    label={po.status === "Closed" ? "Delivered" : po.status === "Sent to Vendor" || po.status === "In Transit" ? "In Transit" : "Pending"}
                    variant={po.status === "Closed" ? "success" : po.status === "Sent to Vendor" ? "info" : "default"}
                  />
                </div>
                <InfoRow label="Expected Delivery" value={po.expectedDeliveryDate || "—"} />
                <InfoRow label="Actual Delivery" value={po.status === "Closed" ? (po.expectedDeliveryDate || "—") : "—"} />
                <InfoRow label="Currency" value={po.currency || "INR (₹)"} />
                <div className="sm:col-span-3">
                  <InfoRow label="Delivery Address / Tracking" value={po.vendorAddress || "Corporate Head Office, Mumbai"} />
                </div>
                <div className="sm:col-span-3">
                  <InfoRow label="Vendor Contact" value={po.vendorContact || "—"} />
                </div>
              </div>
            </Section>

            {/* Purchase Order Information */}
            <Section icon={ShoppingCart} title="Purchase Order Information" color="bg-gradient-to-r from-orange-500 to-amber-500">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <InfoRow label="PO Number" value={po.id} highlight />
                <InfoRow label="PO Status" value={po.status} />
                <InfoRow label="Created By" value={po.createdBy || "—"} />
                <InfoRow label="Vendor Name" value={po.vendorName} />
                <InfoRow label="Vendor Address" value={po.vendorAddress || "—"} />
                <InfoRow label="GST / Tax (18%)" value={`₹${po.taxAmount?.toLocaleString() ?? 0}`} />
                <InfoRow label="Discount" value={`₹${po.discountAmount?.toLocaleString() ?? 0}`} />
                <InfoRow label="Shipping Cost" value={`₹${po.shippingCost?.toLocaleString() ?? 0}`} />
                <InfoRow label="Grand Total" value={`₹${po.grandTotal?.toLocaleString() ?? 0}`} highlight />
              </div>
            </Section>

          </div>

          {/* RIGHT COLUMN: Workflow Timeline */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-5">

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-5 text-white shadow-lg">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">PO Summary</p>
                <div className="space-y-3">
                  {[
                    { label: "PO Number",    value: po.id,             color: "text-indigo-400" },
                    { label: "Vendor",       value: po.vendorName,     color: "text-white"      },
                    { label: "Product",      value: po.productName,    color: "text-white"      },
                    { label: "Grand Total",  value: `₹${po.grandTotal?.toLocaleString() ?? 0}`, color: "text-emerald-400" },
                    { label: "Status",       value: po.status,         color: "text-amber-400"  },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-start gap-2">
                      <span className="text-slate-400 text-[10px] font-semibold shrink-0">{item.label}</span>
                      <span className={`text-xs font-black text-right ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Tracking */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-700 to-slate-600">
                  <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Workflow Tracking</p>
                  <h3 className="text-white font-black text-sm mt-0.5">Procurement Lifecycle</h3>
                </div>
                <div className="p-5">
                  <WorkflowTimeline currentStatus={po.status} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
