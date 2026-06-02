import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronRight,
  User,
  Building2,
  Package,
  Hash,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  X,
  AlertTriangle,
  Boxes,
  Warehouse,
  RefreshCcw,
  BadgeCheck,
  ShieldCheck,
  TrendingDown,
  BarChart3,
  ArrowRight,
  ArrowDown,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { API_BASE_URL } from "../../config/http";

const STATIC_VENDORS = [
  { name: "Dell Technologies", contact: "Dell Sales Team (+91-8877665544)", address: "Bangalore Tech Park, India" },
  { name: "HP Solutions", contact: "HP Enterprise Hub (+91-9988776655)", address: "Delhi Industrial Complex, India" },
  { name: "Logitech India", contact: "Logitech Logistics (+91-7766554433)", address: "Mumbai Peripherals Yard, India" },
  { name: "Bhabani Traders", contact: "Bhabani Procurement (+91-9876543210)", address: "Bhubaneswar Hub, Odisha" }
];


/* ================================================================
   TYPES
================================================================ */
interface MaterialRequest {
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

interface StockResult {
  found: boolean;
  stock: number;
  itemName: string;
  inventoryId: string;
  isAvailable: boolean;
  remaining: number;
}

type ApiStatus =
  | "Pending"
  | "Approved"
  | "Completed"
  | "Rejected"
  | "Procurement Required";

type TabSlug =
  | "pending"
  | "approved"
  | "completed"
  | "rejected"
  | "procurement-required";

type CountsMap = Record<ApiStatus, number>;

/* ================================================================
   TAB DEFINITIONS
================================================================ */
const TABS: {
  slug: TabSlug;
  label: string;
  apiStatus: ApiStatus;
  icon: React.ElementType;
  /* active pill */
  activeBg: string;
  activeText: string;
  activeShadow: string;
  /* inactive pill */
  inactiveBorder: string;
  inactiveText: string;
  inactiveHover: string;
  /* count badge */
  countBg: string;
  countText: string;
  countActiveBg: string;
  countActiveText: string;
}[] = [
  {
    slug: "pending",
    label: "Pending",
    apiStatus: "Pending",
    icon: Clock,
    activeBg: "bg-amber-400",
    activeText: "text-white",
    activeShadow: "shadow-amber-200",
    inactiveBorder: "border-amber-200",
    inactiveText: "text-amber-700",
    inactiveHover: "hover:bg-amber-50",
    countBg: "bg-amber-100",
    countText: "text-amber-800",
    countActiveBg: "bg-white/30",
    countActiveText: "text-white",
  },
  {
    slug: "approved",
    label: "Approved",
    apiStatus: "Approved",
    icon: CheckCircle,
    activeBg: "bg-emerald-500",
    activeText: "text-white",
    activeShadow: "shadow-emerald-200",
    inactiveBorder: "border-emerald-200",
    inactiveText: "text-emerald-700",
    inactiveHover: "hover:bg-emerald-50",
    countBg: "bg-emerald-100",
    countText: "text-emerald-800",
    countActiveBg: "bg-white/30",
    countActiveText: "text-white",
  },
  {
    slug: "completed",
    label: "Completed",
    apiStatus: "Completed",
    icon: BadgeCheck,
    activeBg: "bg-blue-500",
    activeText: "text-white",
    activeShadow: "shadow-blue-200",
    inactiveBorder: "border-blue-200",
    inactiveText: "text-blue-700",
    inactiveHover: "hover:bg-blue-50",
    countBg: "bg-blue-100",
    countText: "text-blue-800",
    countActiveBg: "bg-white/30",
    countActiveText: "text-white",
  },
  {
    slug: "rejected",
    label: "Rejected",
    apiStatus: "Rejected",
    icon: XCircle,
    activeBg: "bg-red-500",
    activeText: "text-white",
    activeShadow: "shadow-red-200",
    inactiveBorder: "border-red-200",
    inactiveText: "text-red-600",
    inactiveHover: "hover:bg-red-50",
    countBg: "bg-red-100",
    countText: "text-red-800",
    countActiveBg: "bg-white/30",
    countActiveText: "text-white",
  },
  {
    slug: "procurement-required",
    label: "Procurement",
    apiStatus: "Procurement Required",
    icon: AlertTriangle,
    activeBg: "bg-orange-500",
    activeText: "text-white",
    activeShadow: "shadow-orange-200",
    inactiveBorder: "border-orange-200",
    inactiveText: "text-orange-600",
    inactiveHover: "hover:bg-orange-50",
    countBg: "bg-orange-100",
    countText: "text-orange-800",
    countActiveBg: "bg-white/30",
    countActiveText: "text-white",
  },
];

/* ================================================================
   STATUS BADGE
================================================================ */
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Pending:                 { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  dot: "bg-amber-400"  },
  Approved:                { bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",dot: "bg-emerald-500"},
  "Ready For Issue":       { bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",dot: "bg-emerald-500"},
  Rejected:                { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-600",    dot: "bg-red-500"    },
  "Procurement Required":  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  "Vendor Selected":       { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  "PO Created":            { bg: "bg-cyan-50",   border: "border-cyan-200",   text: "text-cyan-700",   dot: "bg-cyan-500"   },
  "PO Approved":           { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-500" },
  Completed:               { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
  "Procurement Completed": { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
};

const StatusBadge = ({ status, isClickable = false }: { status: string; isClickable?: boolean }) => {
  const s = STATUS_STYLES[status] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${s.bg} ${s.border} ${s.text} ${isClickable ? "hover:bg-orange-100 hover:border-orange-300 hover:text-orange-700 cursor-pointer active:scale-95 shadow-sm" : ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

/* ================================================================
   PRIORITY BADGE
================================================================ */
const PRIORITY_STYLES: Record<string, string> = {
  High:   "bg-red-100  text-red-700  border-red-200",
  Urgent: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low:    "bg-green-100 text-green-700 border-green-200",
};

const PriorityBadge = ({ priority }: { priority: string }) => (
  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${PRIORITY_STYLES[priority] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
    {priority}
  </span>
);

/* ================================================================
   WORKFLOW STEPPER
================================================================ */
const WorkflowStepper = ({ status }: { status: string }) => {
  const steps = [
    { label: "Requested",   done: true },
    { label: "Pending",     done: true },
    { label: "Approved",    done: ["Approved", "Ready For Issue", "Completed", "Procurement Required", "Vendor Selected", "PO Created", "PO Approved", "Procurement Completed"].includes(status) },
    { label: "Stock Check", done: ["Ready For Issue", "Completed", "Procurement Required", "Vendor Selected", "PO Created", "PO Approved", "Procurement Completed"].includes(status) },
    { label: "Fulfilled",   done: ["Completed", "Procurement Completed"].includes(status) },
  ];

  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${step.done ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
              {step.done ? "✓" : i + 1}
            </div>
            <p className={`text-[9px] font-semibold mt-1.5 whitespace-nowrap ${step.done ? "text-slate-700" : "text-slate-400"}`}>
              {step.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 mb-4 rounded-full ${steps[i + 1].done ? "bg-blue-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

/* ================================================================
   WORKFLOW DIAGRAM (right sidebar)
================================================================ */
const WorkflowDiagram = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Approval Workflow</p>
    <div className="flex flex-col items-center gap-0 text-xs">
      {/* Material Request */}
      <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-center font-semibold text-slate-600">
        Material Request
      </div>
      <ArrowDown className="w-4 h-4 text-slate-400 my-1" />

      {/* Pending */}
      <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center font-bold text-amber-700">
        🟡 Pending
      </div>
      <ArrowDown className="w-4 h-4 text-slate-400 my-1" />

      {/* Approve / Reject */}
      <div className="w-full grid grid-cols-2 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center font-bold text-emerald-700 text-[11px]">
          ✅ Approve
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center font-bold text-red-600 text-[11px]">
          ❌ Reject
        </div>
      </div>

      {/* Arrow from Approve down */}
      <div className="w-full flex justify-start pl-[12%] mt-1 mb-0">
        <ArrowDown className="w-4 h-4 text-emerald-400" />
      </div>

      {/* Stock Check */}
      <div className="w-3/5 self-start ml-[5%] bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-center font-bold text-blue-700 text-[11px]">
        Stock Check
      </div>

      {/* Branch */}
      <div className="w-3/5 self-start ml-[5%] grid grid-cols-2 gap-2 mt-2">
        <div className="bg-blue-100 border border-blue-200 rounded-xl px-2 py-2 text-center font-bold text-blue-700 text-[10px]">
          🔵 Completed
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-2 py-2 text-center font-bold text-orange-700 text-[10px]">
          🟠 Procurement
        </div>
      </div>
    </div>
  </div>
);

/* ================================================================
   INVENTORY STOCK SUMMARY CARD
================================================================ */
const StockSummaryCard = ({
  result,
  requestedQty,
  onClose,
}: {
  result: StockResult;
  requestedQty: number;
  onClose: () => void;
}) => {
  const pct = result.stock > 0
    ? Math.max(0, Math.round(((result.stock - requestedQty) / result.stock) * 100))
    : 0;

  return (
    <div className="mt-5 rounded-2xl border overflow-hidden shadow-sm">
      <div className={`flex items-center justify-between px-5 py-4 ${result.isAvailable ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-orange-500 to-red-500"}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl"><Warehouse className="w-5 h-5 text-white" /></div>
          <div>
            <p className="text-white font-bold text-sm">Inventory Stock Summary</p>
            <p className="text-white/70 text-xs">{result.itemName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${result.isAvailable ? "bg-white text-emerald-700" : "bg-white text-red-600"}`}>
            {result.isAvailable ? "✓ Stock Available" : "✗ Not Available"}
          </span>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl leading-none ml-1">×</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-white divide-x divide-y sm:divide-y-0 divide-slate-100">
        {[
          { label: "Current Stock",   value: result.stock,                                 icon: Boxes,         color: "text-blue-600",    bg: "bg-blue-50",    num: true  },
          { label: "Requested Qty",   value: requestedQty,                                 icon: Hash,          color: "text-amber-600",   bg: "bg-amber-50",   num: true  },
          { label: "Remaining Stock", value: result.remaining,                              icon: TrendingDown,  color: result.remaining >= 0 ? "text-emerald-600" : "text-red-600", bg: result.remaining >= 0 ? "bg-emerald-50" : "bg-red-50", num: true },
          { label: "Stock Status",    value: result.isAvailable ? "Sufficient" : "Deficit", icon: result.isAvailable ? ShieldCheck : AlertTriangle, color: result.isAvailable ? "text-emerald-600" : "text-red-600", bg: result.isAvailable ? "bg-emerald-50" : "bg-red-50", num: false },
        ].map((s, i) => { const Icon = s.icon; return (
          <div key={i} className="p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}><Icon className={`w-4 h-4 ${s.color}`} /></div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-xl font-extrabold ${s.color}`}>{s.num ? Number(s.value).toLocaleString() : s.value}</p>
          </div>
        );})}
      </div>
      <div className="px-5 py-4 bg-white border-t border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Post-Fulfillment Stock</span>
          <span className="text-xs font-bold text-slate-600">{pct}% remaining</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${pct > 40 ? "bg-emerald-500" : pct > 15 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   HIGHLIGHT TEXT — highlights matching query in text
================================================================ */
const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

/* ================================================================
   LEFT LIST ITEM
================================================================ */
const ListItem = ({
  item, isSelected, onClick, onDeleteAction, searchQuery,
}: {
  item: MaterialRequest; isSelected: boolean; onClick: () => void; onDeleteAction?: () => void; searchQuery?: string;
}) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 group ${isSelected ? "bg-blue-50 border-blue-300 shadow-sm" : "bg-slate-50 border-transparent hover:border-slate-300 hover:bg-white hover:shadow-sm"}`}
  >
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="font-bold text-slate-800 text-sm">
            <HighlightText text={item.referenceId} query={searchQuery || ""} />
          </span>
          <PriorityBadge priority={item.priority} />
        </div>
        <p className="text-xs text-slate-500 truncate">
          <HighlightText text={item.requester} query={searchQuery || ""} />{" · "}
          <HighlightText text={item.department} query={searchQuery || ""} />
        </p>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          <HighlightText text={item.productDetails} query={searchQuery || ""} />
        </p>
        <div className="mt-2.5">
          <StatusBadge status={item.status} isClickable={false} />
        </div>
      </div>
      {onDeleteAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteAction();
          }}
          className="shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all mt-1 focus:outline-none"
          title="Delete Procurement Request"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      )}
    </div>
  </div>
);


/* ================================================================
   DETAILS PANEL
================================================================ */
interface DetailsPanelProps {
  item: MaterialRequest | null;
  stockResult: StockResult | null;
  stockMessage: { text: string; type: "success" | "error" } | null;
  loading: { approve: boolean; reject: boolean; stock: boolean; process: boolean };
  onApprove: () => void;
  onReject: () => void;
  onCheckStock: () => void;
  onProcess: () => void;
  onCloseStock: () => void;
  onProcure?: () => void;
  onIssueStock: () => void;
  onOpenVendorModal: () => void;
  onOpenPoModal: () => void;
}

const DetailsPanel = ({
  item, stockResult, stockMessage, loading,
  onApprove, onReject, onCheckStock, onProcess, onCloseStock, onProcure,
  onIssueStock, onOpenVendorModal, onOpenPoModal
}: DetailsPanelProps) => {
  if (!item) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[420px] text-slate-400 gap-3">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-slate-300" />
        </div>
        <p className="font-semibold text-sm">Select a request to view details</p>
        <p className="text-xs text-slate-300">Click any item from the list on the left</p>
      </div>
    );
  }

  const isPending     = item.status === "Pending";
  const isApproved    = item.status === "Approved";
  const isReadyForIssue = item.status === "Ready For Issue";
  const isCompleted   = item.status === "Completed" || item.status === "Procurement Completed";
  const isProcurement = item.status === "Procurement Required";
  const isVendorSelected = item.status === "Vendor Selected";
  const isPoCreated = item.status === "PO Created";
  const isPoApproved = item.status === "PO Approved";
  const isRejected    = item.status === "Rejected";
  const canAct        = isPending || isApproved || isReadyForIssue || isProcurement || isVendorSelected;
  const anyLoading    = loading.approve || loading.reject || loading.stock || loading.process;

  const resolvedBanner = item.status === "Completed"
    ? { bg: "bg-blue-50 border-blue-100", icon: <CheckCircle className="w-4 h-4 text-blue-600" />, iconBg: "bg-blue-100", title: "Request Completed", desc: "Stock was available and has been deducted from inventory.", textColor: "text-blue-700", descColor: "text-blue-600" }
    : item.status === "Procurement Completed"
    ? { bg: "bg-emerald-50 border-emerald-100", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, iconBg: "bg-emerald-100", title: "Procurement Completed", desc: "Purchase Order was completed and goods have been stocked.", textColor: "text-emerald-700", descColor: "text-emerald-600" }
    : isVendorSelected
    ? { bg: "bg-purple-50 border-purple-100", icon: <CheckCircle className="w-4 h-4 text-purple-600" />, iconBg: "bg-purple-100", title: "Vendor Assigned", desc: "Supplier assigned. Proceed below to generate the shortage Purchase Order.", textColor: "text-purple-700", descColor: "text-purple-600" }
    : isPoCreated
    ? { bg: "bg-cyan-50 border-cyan-100", icon: <CheckCircle className="w-4 h-4 text-cyan-600" />, iconBg: "bg-cyan-100", title: "PO Created", desc: "Purchase Order generated for shortage quantity. Awaiting fulfillment in Procurement module.", textColor: "text-cyan-700", descColor: "text-cyan-600" }
    : isPoApproved
    ? { bg: "bg-indigo-50 border-indigo-100", icon: <CheckCircle className="w-4 h-4 text-indigo-600" />, iconBg: "bg-indigo-100", title: "PO Approved", desc: "Purchase Order approved and issued to supplier.", textColor: "text-indigo-700", descColor: "text-indigo-600" }
    : (isReadyForIssue || (isApproved && stockResult?.isAvailable))
    ? { bg: "bg-emerald-50 border-emerald-100", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, iconBg: "bg-emerald-100", title: "Available In Stock", desc: "Inventory quantities verified. Safe to issue directly.", textColor: "text-emerald-700", descColor: "text-emerald-600" }
    : (isProcurement || (isApproved && stockResult && !stockResult.isAvailable))
    ? { bg: "bg-orange-50 border-orange-100", icon: <AlertTriangle className="w-4 h-4 text-orange-600" />, iconBg: "bg-orange-100", title: "Insufficient Stock", desc: "Inventory quantities insufficient. Assign vendor and create Purchase Order below.", textColor: "text-orange-700", descColor: "text-orange-600" }
    : isRejected
    ? { bg: "bg-red-50 border-red-100", icon: <XCircle className="w-4 h-4 text-red-600" />, iconBg: "bg-red-100", title: "Request Rejected", desc: "This material request was rejected by the admin.", textColor: "text-red-700", descColor: "text-red-600" }
    : null;

  // Retrieve assigned vendor details from localStorage
  const cachedMrVendors = localStorage.getItem("invenpro_mr_vendors");
  let assignedVendorName = "";
  let assignedVendorContact = "";
  let assignedVendorAddress = "";
  if (cachedMrVendors && item) {
    try {
      const map = JSON.parse(cachedMrVendors);
      const mapped = map[item._id];
      if (mapped) {
        assignedVendorName = mapped.vendorName;
        assignedVendorContact = mapped.vendorContact;
        assignedVendorAddress = mapped.vendorAddress;
      }
    } catch {}
  }

  // Retrieve associated PO number from localStorage invenpro_pos
  const cachedPos = localStorage.getItem("invenpro_pos");
  let linkedPoNumber = "";
  if (cachedPos && item) {
    try {
      const list = JSON.parse(cachedPos);
      const matchedPo = list.find((p: any) => p.materialRequestRef === item.referenceId);
      if (matchedPo) {
        linkedPoNumber = matchedPo.id;
      }
    } catch {}
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Dark header ── */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <BadgeCheck className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Material Request Detail</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{item.referenceId}</h2>
              <p className="text-slate-400 text-xs mt-1">Review request details and take action below.</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </div>

        {/* ── Stock message banner ── */}
        {stockMessage && (
          <div className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b ${stockMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
            {stockMessage.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            {stockMessage.text}
          </div>
        )}

        <div className="p-6 space-y-5">

          {/* ── Info cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Requester",         value: item.requester,        icon: User,      color: "text-blue-500",    bg: "bg-blue-50"    },
              { label: "Department",         value: item.department,       icon: Building2, color: "text-purple-500",  bg: "bg-purple-50"  },
              { label: "Product / Item",     value: item.productDetails,   icon: Package,   color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Requested Quantity", value: String(item.quantity), icon: Hash,      color: "text-orange-500",  bg: "bg-orange-50"  },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.bg}`}>
                    <Icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</p>
                    <p className="font-semibold text-slate-800 text-sm truncate">{f.value || "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Workflow stepper ── */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Workflow Progress</p>
            <WorkflowStepper status={item.status} />
          </div>

          {/* ── Stock check results (for Approved / Ready For Issue / Procurement Required / Vendor Selected / PO Created) ── */}
          {(isReadyForIssue || isProcurement || isVendorSelected || isPoCreated || (isApproved && stockResult)) && (
            <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Stock Check Result</span>
                {(isReadyForIssue || (isApproved && stockResult?.isAvailable)) ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Available In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                    Insufficient Stock
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Product Name</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{item.productDetails}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Available Quantity</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{stockResult ? stockResult.stock : 0} units</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Requested Quantity</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{item.quantity} units</p>
                </div>
                {!(isReadyForIssue || (isApproved && stockResult?.isAvailable)) && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Shortage Quantity</p>
                    <p className="font-bold text-red-600 mt-0.5">
                      {Math.max(0, item.quantity - (stockResult ? stockResult.stock : 0))} units
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Status & Metadata Details ── */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Material Request No.</p>
                <p className="font-semibold text-slate-700 mt-0.5">{item.referenceId}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Requested By</p>
                <p className="font-semibold text-slate-700 mt-0.5">{item.requester}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Department</p>
                <p className="font-semibold text-slate-700 mt-0.5">{item.department}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Request Date</p>
                <p className="font-semibold text-slate-700 mt-0.5">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                <div className="mt-0.5"><StatusBadge status={item.status} /></div>
              </div>
              {(assignedVendorName || isVendorSelected || isPoCreated) && (
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assigned Vendor</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{assignedVendorName || "—"}</p>
                </div>
              )}
              {linkedPoNumber && (
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">PO Reference</p>
                  <p className="font-extrabold text-blue-600 mt-0.5">{linkedPoNumber}</p>
                </div>
              )}
              {["Ready For Issue", "Procurement Required", "Vendor Selected", "PO Created", "Completed", "Procurement Completed"].includes(item.status) && (
                <>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Approved By</p>
                    <p className="font-semibold text-slate-700 mt-0.5">Manager Bhabani</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Approval Date & Time</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Resolved info banner ── */}
          {resolvedBanner && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${resolvedBanner.bg}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${resolvedBanner.iconBg}`}>
                {resolvedBanner.icon}
              </div>
              <div>
                <p className={`font-bold text-sm ${resolvedBanner.textColor}`}>{resolvedBanner.title}</p>
                <p className={`text-xs mt-0.5 ${resolvedBanner.descColor}`}>{resolvedBanner.desc}</p>
              </div>
            </div>
          )}

          {/* ── Action Buttons (Pending, Approved, Ready For Issue, Procurement Required & Vendor Selected) ── */}
          {canAct && (
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Actions</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isPending ? "bg-amber-50 text-amber-700 border border-amber-200" : isApproved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : isReadyForIssue ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : isProcurement ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                  {isPending ? "⏳ Awaiting Approval" : isApproved ? "✓ Approved — Awaiting Stock Check" : isReadyForIssue ? "✓ Stock Available — Ready for Issue" : isProcurement ? "🟠 Stock Deficit — Procurement Required" : "🤝 Vendor Selected — Awaiting PO"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Check Stock — both Pending & Approved */}
                {(isPending || isApproved) && (
                  <button
                    id="btn-check-stock"
                    onClick={onCheckStock}
                    disabled={anyLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.stock ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Check Stock
                  </button>
                )}

                {/* Reject — Pending only */}
                {isPending && (
                  <button
                    id="btn-reject"
                    onClick={onReject}
                    disabled={anyLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 border border-red-300 text-red-600 font-semibold text-sm hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.reject ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                )}

                {/* Approve — Pending only */}
                {isPending && (
                  <button
                    id="btn-approve"
                    onClick={onApprove}
                    disabled={anyLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.approve ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                )}

                {/* Process & Check Stock — Approved only (when stockResult not loaded yet) */}
                {isApproved && !stockResult && (
                  <button
                    id="btn-process"
                    onClick={onProcess}
                    disabled={anyLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.process ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Process & Check Stock
                  </button>
                )}

                {/* Issue Stock — Ready For Issue only (or Approved with stock available) */}
                {(isReadyForIssue || (isApproved && stockResult?.isAvailable)) && (
                  <button
                    id="btn-issue-stock"
                    onClick={onIssueStock}
                    disabled={anyLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.process ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                    Issue Stock
                  </button>
                )}

                {/* Procurement Required button — navigates to Vendor Management page */}
                {(isProcurement || (isApproved && stockResult && !stockResult.isAvailable)) && (
                  <button
                    id="btn-procurement-required"
                    onClick={onProcure}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all animate-pulse-slow"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Select Vendor &amp; Create PO
                  </button>
                )}

                {/* Create Purchase Order button — Vendor Selected only */}
                {isVendorSelected && (
                  <button
                    id="btn-create-po"
                    onClick={onOpenPoModal}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Create Purchase Order
                  </button>
                )}
              </div>

              {/* Workflow hint */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">How it works</p>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                  {isPending ? (
                    <>
                      <span className="font-semibold text-amber-600">Pending</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="font-semibold">Approve / Reject</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="font-semibold text-emerald-600">Approved</span>
                      <span className="text-slate-300 font-bold">/</span>
                      <span className="font-semibold text-red-600">Rejected</span>
                    </>
                  ) : isApproved ? (
                    <>
                      <span className="font-semibold text-emerald-600">Already Approved</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span>Process & Check Stock</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="font-semibold text-blue-600">Stock OK → Completed</span>
                      <span className="text-slate-300 font-bold">|</span>
                      <span className="font-semibold text-orange-600">No Stock → Procurement</span>
                    </>
                  ) : isReadyForIssue ? (
                    <>
                      <span className="font-semibold text-emerald-600">Ready For Issue</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span>Click Issue Stock</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="font-semibold text-blue-600">Stock Deducted & Completed</span>
                    </>
                  ) : isProcurement ? (
                    <>
                      <span className="font-semibold text-orange-600">Procurement Required</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span>Assign Vendor</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="font-semibold text-purple-600">Vendor Assigned</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-purple-600">Vendor Assigned</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span>Click Create PO (Shortage Qty)</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="font-semibold text-blue-600">PO Created in Draft</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock summary card */}
      {stockResult && (
        <StockSummaryCard result={stockResult} requestedQty={item.quantity} onClose={onCloseStock} />
      )}
    </div>
  );
};


/* ================================================================
   MAIN COMPONENT
================================================================ */
const PAGE_SIZE = 8;

const EMPTY_COUNTS: CountsMap = {
  Pending: 0,
  Approved: 0,
  Completed: 0,
  Rejected: 0,
  "Procurement Required": 0,
};

const Approvals = () => {
  const navigate = useNavigate();
  const [activeSlug,    setActiveSlug]    = useState<TabSlug>("pending");
  const [requests,      setRequests]      = useState<MaterialRequest[]>([]);
  const [allRequests,   setAllRequests]   = useState<MaterialRequest[]>([]);
  const [selected,      setSelected]      = useState<MaterialRequest | null>(null);
  const [counts,        setCounts]        = useState<CountsMap>(EMPTY_COUNTS);
  const [stockResult,   setStockResult]   = useState<StockResult | null>(null);
  const [stockMessage,  setStockMessage]  = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [search,        setSearch]        = useState("");
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState({ list: false, counts: false, approve: false, reject: false, stock: false, process: false });
  const [requestToDelete, setRequestToDelete] = useState<MaterialRequest | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Vendor & PO workflow states
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [showPoModal, setShowPoModal] = useState(false);
  const [poExpectedDate, setPoExpectedDate] = useState("");
  const [poPaymentTerms, setPoPaymentTerms] = useState("Net 30");
  const [poUnitPrice, setPoUnitPrice] = useState(1200);

  const activeTab = TABS.find((t) => t.slug === activeSlug)!;

  /* ── Fetch all tab counts in parallel ── */
  const fetchAllCounts = useCallback(async () => {
    setLoading((p) => ({ ...p, counts: true }));
    try {
      const statuses: string[] = ["Pending", "Approved", "Ready For Issue", "Completed", "Rejected", "Procurement Required", "Vendor Selected", "PO Created", "PO Approved", "Procurement Completed"];
      const results = await Promise.all(
        statuses.map((s) =>
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent(s)}`)
            .then((r) => r.json())
            .then((j) => ({ status: s, count: (j.data ?? []).length as number }))
            .catch(() => ({ status: s, count: 0 }))
        )
      );
      
      const map = { ...EMPTY_COUNTS };
      let completedCount = 0;
      let procurementCount = 0;
      let approvedCount = 0;
      results.forEach(({ status, count }) => {
        if (status === "Completed" || status === "Procurement Completed") {
          completedCount += count;
        } else if (status === "Procurement Required" || status === "Vendor Selected" || status === "PO Created" || status === "PO Approved") {
          procurementCount += count;
        } else if (status === "Approved" || status === "Ready For Issue") {
          approvedCount += count;
        } else if (status in map) {
          map[status as ApiStatus] = count;
        }
      });
      map["Completed"] = completedCount;
      map["Procurement Required"] = procurementCount;
      map["Approved"] = approvedCount;
      setCounts(map);
    } finally {
      setLoading((p) => ({ ...p, counts: false }));
    }
  }, []);

  /* ── Fetch requests for the active tab ── */
  const fetchRequests = useCallback(async (slug?: TabSlug) => {
    const tab = TABS.find((t) => t.slug === (slug ?? activeSlug))!;
    setLoading((p) => ({ ...p, list: true }));
    try {
      let list: MaterialRequest[] = [];
      if (tab.slug === "completed") {
        const [res1, res2] = await Promise.all([
          fetch(`${API_BASE_URL}/material?status=Completed`).then(r => r.json()),
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("Procurement Completed")}`).then(r => r.json())
        ]);
        list = [...(res1.data ?? []), ...(res2.data ?? [])];
      } else if (tab.slug === "approved") {
        const [res1, res2] = await Promise.all([
          fetch(`${API_BASE_URL}/material?status=Approved`).then(r => r.json()),
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("Ready For Issue")}`).then(r => r.json())
        ]);
        list = [...(res1.data ?? []), ...(res2.data ?? [])];
      } else if (tab.slug === "procurement-required") {
        const [res1, res2, res3, res4] = await Promise.all([
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("Procurement Required")}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("Vendor Selected")}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("PO Created")}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("PO Approved")}`).then(r => r.json())
        ]);
        list = [...(res1.data ?? []), ...(res2.data ?? []), ...(res3.data ?? []), ...(res4.data ?? [])];
      } else {
        const res  = await fetch(`${API_BASE_URL}/material?status=${encodeURIComponent(tab.apiStatus)}`);
        const json = await res.json();
        list = json.data ?? [];
      }
      setRequests(list);
      setSelected(list[0] ?? null);
      setStockResult(null);
      setStockMessage(null);
      setPage(1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading((p) => ({ ...p, list: false }));
    }
  }, [activeSlug]);

  /* ── Fetch ALL requests across every tab for global search ── */
  const fetchAllRequests = useCallback(async () => {
    setIsGlobalSearching(true);
    try {
      const allStatuses = [
        "Pending", "Approved", "Ready For Issue", "Completed",
        "Rejected", "Procurement Required", "Vendor Selected",
        "PO Created", "PO Approved", "Procurement Completed"
      ];
      const results = await Promise.all(
        allStatuses.map((s) =>
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent(s)}`)
            .then((r) => r.json())
            .then((j) => (j.data ?? []) as MaterialRequest[])
            .catch(() => [] as MaterialRequest[])
        )
      );
      const combined = results.flat();
      // Deduplicate by _id
      const seen = new Set<string>();
      const unique = combined.filter((r) => {
        if (seen.has(r._id)) return false;
        seen.add(r._id);
        return true;
      });
      setAllRequests(unique);
    } catch (err) {
      console.error("Global fetch error:", err);
    } finally {
      setIsGlobalSearching(false);
    }
  }, []);

  /* ── Switch tab (does NOT clear search anymore) ── */
  const switchTab = useCallback((slug: TabSlug) => {
    setActiveSlug(slug);
    setPage(1);
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    fetchRequests();
    fetchAllCounts();
  }, [activeSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Fetch all requests once on mount for global search pool ── */
  useEffect(() => {
    fetchAllRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Reset page on search ── */
  useEffect(() => { setPage(1); }, [search]);

  const handleSelect = async (item: MaterialRequest) => {
    setSelected(item);
    setStockResult(null);
    setStockMessage(null);
    
    // Silently check stock in the background for approved/procurement requests so details load instantly
    if (["Approved", "Ready For Issue", "Procurement Required", "Vendor Selected", "PO Created", "PO Approved", "Completed", "Procurement Completed"].includes(item.status)) {
      try {
        const res  = await fetch(`${API_BASE_URL}/inventory/check-stock/${encodeURIComponent(item.productDetails)}`);
        const json = await res.json();
        if (json.found) {
          const currentStock = json.stock ?? 0;
          const isAvailable = currentStock >= item.quantity;
          setStockResult({
            found: true,
            stock: currentStock,
            itemName: json.itemName ?? item.productDetails,
            inventoryId: json.data?._id ?? "",
            isAvailable,
            remaining: currentStock - item.quantity,
          });
          setStockMessage(
            isAvailable
              ? { text: "✓ Stock Available — sufficient quantity in inventory.", type: "success" }
              : { text: "✗ Stock Not Available — insufficient quantity for this request.", type: "error" }
          );
        } else {
          setStockMessage({ text: `"${item.productDetails}" not found in inventory.`, type: "error" });
        }
      } catch (err) {
        console.warn("Silent stock check failed", err);
      }
    }
  };

  /* ── Check Stock (standalone, no status change) ── */
  const handleCheckStock = async () => {
    if (!selected) return;
    setLoading((p) => ({ ...p, stock: true }));
    setStockResult(null);
    setStockMessage(null);
    try {
      const res  = await fetch(`${API_BASE_URL}/inventory/check-stock/${encodeURIComponent(selected.productDetails)}`);
      const json = await res.json();
      if (!json.found) {
        setStockMessage({ text: `"${selected.productDetails}" not found in inventory.`, type: "error" });
        return;
      }
      const currentStock: number = json.stock ?? 0;
      const isAvailable = currentStock >= selected.quantity;
      setStockResult({
        found:       true,
        stock:       currentStock,
        itemName:    json.itemName ?? selected.productDetails,
        inventoryId: json.data?._id ?? "",
        isAvailable,
        remaining:   currentStock - selected.quantity,
      });
      setStockMessage(
        isAvailable
          ? { text: "✓ Stock Available — sufficient quantity in inventory.", type: "success" }
          : { text: "✗ Stock Not Available — insufficient quantity for this request.", type: "error" }
      );
    } catch {
      setStockMessage({ text: "Failed to check stock. Please try again.", type: "error" });
    } finally {
      setLoading((p) => ({ ...p, stock: false }));
    }
  };

  /* ── Audit Log Helper ── */
  const addAuditLog = (action: string) => {
    const freshLogs = JSON.parse(localStorage.getItem("invenpro_audit_logs") || "[]");
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog = {
      id: "LOG-" + Math.floor(100000 + Math.random() * 900000),
      action,
      user: "Manager Bhabani",
      timestamp: `${todayStr} ${timeStr}`,
      role: "manager"
    };
    const updated = [newLog, ...freshLogs];
    localStorage.setItem("invenpro_audit_logs", JSON.stringify(updated));
  };

  /* ── Approve: silently runs stock check → Ready For Issue OR Procurement Required ── */
  const handleApprove = async () => {
    if (!selected) return;
    setLoading((p) => ({ ...p, approve: true }));
    setStockResult(null);
    setStockMessage(null);
    try {
      // 1. Silent stock validation against Masters -> Products (Inventory checkStock API)
      const stockRes  = await fetch(`${API_BASE_URL}/inventory/check-stock/${encodeURIComponent(selected.productDetails)}`);
      const stockJson = await stockRes.json();
      const currentStock: number = stockJson.stock ?? 0;
      const isAvailable = stockJson.found && currentStock >= selected.quantity;

      const result: StockResult = {
        found:       stockJson.found ?? false,
        stock:       currentStock,
        itemName:    stockJson.itemName ?? selected.productDetails,
        inventoryId: stockJson.data?._id ?? "",
        isAvailable,
        remaining:   currentStock - selected.quantity,
      };
      setStockResult(result);

      if (isAvailable) {
        // Stock Available -> Set status to "Ready For Issue"
        await fetch(`${API_BASE_URL}/material/${selected._id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Ready For Issue" }),
        });
        
        addAuditLog(`Material Request ${selected.referenceId} approved automatically with sufficient stock available. Status set to Ready For Issue.`);
        
        setStockMessage({ text: "✓ Request Approved: Sufficient stock available. Marked as Ready For Issue.", type: "success" });
        toast.success("Request approved and marked as Ready For Issue! 📦");
        
        await fetchAllCounts();
        switchTab("approved");
        await fetchRequests("approved");
      } else {
        // Stock Not Available -> Set status to "Procurement Required"
        await fetch(`${API_BASE_URL}/material/${selected._id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Procurement Required" }),
        });

        const available = stockJson.found ? currentStock : 0;
        const shortage = selected.quantity - available;
        addAuditLog(`Material Request ${selected.referenceId} approved with insufficient stock (Shortage: ${shortage} units). Status set to Procurement Required.`);
        
        setStockMessage({ text: `✗ Request Approved: Insufficient stock (Shortage: ${shortage} units). Status set to Procurement Required.`, type: "error" });
        toast.warning("Request approved. Insufficient stock, moved to Procurement Required!");
        
        await fetchAllCounts();
        switchTab("procurement-required");
        await fetchRequests("procurement-required");
      }
    } catch (err) {
      console.error("Approve error", err);
      setStockMessage({ text: "An error occurred during approval check. Please try again.", type: "error" });
      toast.error("Failed to approve material request.");
    } finally {
      setLoading((p) => ({ ...p, approve: false }));
    }
  };

  /* ── Reject: mark Rejected → move to Rejected tab ── */
  const handleReject = async () => {
    if (!selected) return;
    setLoading((p) => ({ ...p, reject: true }));
    setStockResult(null);
    setStockMessage(null);
    try {
      await fetch(`${API_BASE_URL}/material/${selected._id}/reject`, { method: "PUT" });
      setStockMessage({ text: "✗ Material Request Rejected.", type: "error" });
      addAuditLog(`Material Request ${selected.referenceId} rejected by Manager Bhabani.`);
      
      // Refresh counts + move to Rejected tab
      await fetchAllCounts();
      switchTab("rejected");
      await fetchRequests("rejected");
    } catch {
      console.error("Reject error");
    } finally {
      setLoading((p) => ({ ...p, reject: false }));
    }
  };

  /* ── Process (already-Approved): stock check → Complete or Procurement ── */
  const handleProcess = async () => {
    if (!selected) return;
    setLoading((p) => ({ ...p, process: true }));
    setStockResult(null);
    setStockMessage(null);
    try {
      const stockRes  = await fetch(`${API_BASE_URL}/inventory/check-stock/${encodeURIComponent(selected.productDetails)}`);
      const stockJson = await stockRes.json();
      const currentStock: number = stockJson.stock ?? 0;
      const isAvailable = stockJson.found && currentStock >= selected.quantity;

      const result: StockResult = {
        found:       stockJson.found ?? false,
        stock:       currentStock,
        itemName:    stockJson.itemName ?? selected.productDetails,
        inventoryId: stockJson.data?._id ?? "",
        isAvailable,
        remaining:   currentStock - selected.quantity,
      };
      setStockResult(result);

      if (isAvailable && result.inventoryId) {
        // Old Approved flow: transition to Ready For Issue so the user can issue it
        await fetch(`${API_BASE_URL}/material/${selected._id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Ready For Issue" }),
        });
        setStockMessage({ text: "✓ Stock Available — sufficient quantity. Request status set to Ready For Issue.", type: "success" });
        toast.success("Stock available! Request status set to Ready For Issue.");
        await fetchAllCounts();
        await fetchRequests("approved");
      } else {
        await fetch(`${API_BASE_URL}/material/${selected._id}/procurement-required`, { method: "PUT" });
        setStockMessage({ text: "✗ Stock Not Available — Moved to Procurement Required.", type: "error" });
        addAuditLog(`Material Request ${selected.referenceId} found to have insufficient stock on manual check. Status set to Procurement Required.`);
        toast.warning("Stock insufficient, moved to Procurement Required!");
        await fetchAllCounts();
        switchTab("procurement-required");
        await fetchRequests("procurement-required");
      }
    } catch {
      setStockMessage({ text: "An error occurred. Please try again.", type: "error" });
    } finally {
      setLoading((p) => ({ ...p, process: false }));
    }
  };

  /* ── Issue Stock: deducts stock from inventory and marks completed ── */
  const handleIssueStock = async () => {
    if (!selected) return;
    setLoading((p) => ({ ...p, process: true }));
    try {
      // 1. Double check stock
      const stockRes  = await fetch(`${API_BASE_URL}/inventory/check-stock/${encodeURIComponent(selected.productDetails)}`);
      const stockJson = await stockRes.json();
      const currentStock: number = stockJson.stock ?? 0;
      const isAvailable = stockJson.found && currentStock >= selected.quantity;

      if (!isAvailable || !stockJson.data?._id) {
        toast.error("Stock is no longer available in inventory to issue!");
        return;
      }

      // 2. Deduct stock from inventory
      await fetch(`${API_BASE_URL}/inventory/deduct-stock/${stockJson.data._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: selected.quantity }),
      });

      // 3. Mark request as Completed in DB
      await fetch(`${API_BASE_URL}/material/${selected._id}/complete`, { method: "PUT" });

      // 4. Log to Audit
      addAuditLog(`Issued ${selected.quantity} units of ${selected.productDetails} to ${selected.requester} from inventory. Material Request completed.`);
      
      toast.success("Inventory stock issued successfully! Request completed. 🚚");
      
      await fetchAllCounts();
      switchTab("completed");
      await fetchRequests("completed");
    } catch (err) {
      console.error("Issue stock error", err);
      toast.error("Failed to issue stock.");
    } finally {
      setLoading((p) => ({ ...p, process: false }));
    }
  };

  /* ── Assign Vendor ── */
  const handleAssignVendor = async () => {
    if (!selected || !selectedVendorName) {
      toast.error("Please select a vendor.");
      return;
    }

    const vendor = STATIC_VENDORS.find(v => v.name === selectedVendorName);
    if (!vendor) return;

    try {
      // 1. Save vendor assignment map to local storage `invenpro_mr_vendors`
      const cachedVendors = localStorage.getItem("invenpro_mr_vendors");
      let map: Record<string, any> = {};
      if (cachedVendors) {
        try {
          map = JSON.parse(cachedVendors);
        } catch {}
      }
      map[selected._id] = {
        vendorName: vendor.name,
        vendorContact: vendor.contact,
        vendorAddress: vendor.address,
        unitPrice: poUnitPrice
      };
      localStorage.setItem("invenpro_mr_vendors", JSON.stringify(map));

      // 2. Update DB status to "Vendor Selected"
      await fetch(`${API_BASE_URL}/material/${selected._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Vendor Selected" }),
      });

      // 3. Audit Log
      addAuditLog(`Assigned supplier ${vendor.name} to Material Request ${selected.referenceId}. Status updated to Vendor Selected.`);

      toast.success(`Vendor ${vendor.name} assigned successfully! 🤝`);
      setShowVendorModal(false);

      // 4. Refresh requests and update UI state
      await fetchAllCounts();
      await fetchRequests("procurement-required");
    } catch (err) {
      console.error("Assign vendor error", err);
      toast.error("Failed to assign vendor.");
    }
  };

  /* ── Confirm and Create Purchase Order (shortage only) ── */
  const handleConfirmCreatePO = async () => {
    if (!selected) return;

    // Check duplicate PO block: Scan invenpro_pos in localStorage
    const cachedPos = localStorage.getItem("invenpro_pos");
    let posList = [];
    if (cachedPos) {
      try {
        posList = JSON.parse(cachedPos);
      } catch {}
    }

    const alreadyExists = posList.some((p: any) => p.materialRequestRef === selected.referenceId);
    if (alreadyExists) {
      toast.error(`A Purchase Order already exists for Material Request ${selected.referenceId}!`);
      return;
    }

    // Retrieve vendor details from localStorage invenpro_mr_vendors
    const cachedMrVendors = localStorage.getItem("invenpro_mr_vendors");
    let vendorName = "HP Solutions";
    let vendorContact = "HP Sales Team (+91-9988776655)";
    let vendorAddress = "Delhi Industrial Complex, India";

    if (cachedMrVendors) {
      try {
        const map = JSON.parse(cachedMrVendors);
        const mapped = map[selected._id];
        if (mapped) {
          vendorName = mapped.vendorName;
          vendorContact = mapped.vendorContact;
          vendorAddress = mapped.vendorAddress;
        }
      } catch {}
    }

    try {
      const poNumber = "PO-2026-" + Math.floor(1000 + Math.random() * 9000);
      const todayStr = new Date().toISOString().split("T")[0];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Fetch inventory details for calculating the shortage quantity strictly!
      let availableQty = 0;
      try {
        const stockRes  = await fetch(`${API_BASE_URL}/inventory/check-stock/${encodeURIComponent(selected.productDetails)}`);
        const stockJson = await stockRes.json();
        if (stockJson.found) {
          availableQty = stockJson.stock ?? 0;
        }
      } catch (err) {
        console.warn("Failed to check inventory for PO quantity deduction:", err);
      }

      // Calculations: shortage quantity strictly!
      const shortageQty = Math.max(1, selected.quantity - availableQty);
      const subtotal = shortageQty * poUnitPrice;
      const taxPercent = 18;
      const taxAmount = Math.round(subtotal * (taxPercent / 100));
      const grandTotal = subtotal + taxAmount;

      const newPo = {
        id: poNumber,
        rfqId: "N/A",
        quotationId: "N/A",
        vendorName: vendorName,
        vendorContact: vendorContact,
        vendorAddress: vendorAddress,
        productName: selected.productDetails,
        quantity: shortageQty,
        unitPrice: poUnitPrice,
        taxPercent: taxPercent,
        discountPercent: 0,
        subtotal: subtotal,
        taxAmount: taxAmount,
        discountAmount: 0,
        shippingCost: 0,
        grandTotal: grandTotal,
        expectedDeliveryDate: poExpectedDate || todayStr,
        paymentTerms: poPaymentTerms || "COD",
        currency: "INR (₹)",
        status: "Draft",
        createdBy: "Bhabani",
        approvedBy: "",
        createdDate: todayStr,
        materialRequestRef: selected.referenceId
      };

      // 1. Add PO to invenpro_pos in localStorage
      posList.unshift(newPo);
      localStorage.setItem("invenpro_pos", JSON.stringify(posList));

      // 2. Update Material Request status in DB to "PO Created"
      await fetch(`${API_BASE_URL}/material/${selected._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PO Created" })
      });

      // 3. Add Audit Log
      addAuditLog(`Purchase Order ${poNumber} generated in Draft status for shortage quantity ${shortageQty} of request ${selected.referenceId} (Vendor: ${vendorName}).`);

      toast.success(`Purchase Order ${poNumber} created successfully for ${shortageQty} units shortage! 🛒`);
      setShowPoModal(false);

      // 4. Refresh requests and update UI state
      await fetchAllCounts();
      await fetchRequests("procurement-required");
    } catch (err) {
      console.error("Create PO error", err);
      toast.error("Failed to generate Purchase Order.");
    }
  };

  const handleMoveToProcurement = async (req: MaterialRequest) => {
    let toastId: any = null;
    try {
      toastId = toast.loading(`Initiating Vendor Selection for request ${req.referenceId}...`);
    } catch {
      toastId = toast.info ? toast.info(`Initiating Vendor Selection for request ${req.referenceId}...`) : toast(`Initiating Vendor Selection...`);
    }
    
    try {
      try {
        if (toastId && typeof toastId !== "object" && toast.success) {
          toast.success(`Redirecting to Vendor Management for ${req.referenceId}! 🚀`, { id: toastId });
        } else {
          toast.success(`Redirecting to Vendor Management for ${req.referenceId}! 🚀`);
        }
      } catch {
        toast.success(`Redirecting to Vendor Management for ${req.referenceId}! 🚀`);
      }

      // Navigate to Vendor page, passing the Material Request payload
      navigate("/procurement/vendor", {
        state: {
          selectVendorForMr: {
            _id: req._id,
            referenceId: req.referenceId,
            requester: req.requester,
            priority: req.priority,
            department: req.department,
            productDetails: req.productDetails,
            quantity: req.quantity,
            status: req.status,
            createdAt: req.createdAt
          }
        }
      });

    } catch (error) {
      console.error("Redirection to vendor management failed:", error);
      try {
        if (toastId && typeof toastId !== "object" && toast.error) {
          toast.error("Failed to redirect to Vendor Selection console.", { id: toastId });
        } else {
          toast.error("Failed to redirect to Vendor Selection console.");
        }
      } catch {
        toast.error("Failed to redirect to Vendor Selection console.");
      }
    }
  };

  const handleDeleteClick = (req: MaterialRequest) => {
    setRequestToDelete(req);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    let toastId: any = null;
    try {
      toastId = toast.loading(`Deleting Procurement Request ${requestToDelete.referenceId}...`);
    } catch {
      toastId = toast.info ? toast.info(`Deleting Procurement Request ${requestToDelete.referenceId}...`) : toast(`Deleting request ${requestToDelete.referenceId}...`);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/material/${requestToDelete._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        try {
          if (toastId && typeof toastId !== "object" && toast.success) {
            toast.success(`Request ${requestToDelete.referenceId} permanently deleted! 🗑️`, { id: toastId });
          } else {
            toast.success(`Request ${requestToDelete.referenceId} permanently deleted! 🗑️`);
          }
        } catch {
          toast.success(`Request ${requestToDelete.referenceId} permanently deleted! 🗑️`);
        }
        
        // Clean up local storage purchase_requests as well
        try {
          const saved = localStorage.getItem("purchase_requests");
          if (saved) {
            const list = JSON.parse(saved);
            const filteredList = list.filter((r: any) => r.materialRequestId !== requestToDelete._id);
            localStorage.setItem("purchase_requests", JSON.stringify(filteredList));
          }
        } catch (lsErr) {
          console.warn("Failed to clean up localStorage PRs:", lsErr);
        }

        setShowDeleteModal(false);
        setRequestToDelete(null);
        await fetchAllCounts();
        await fetchRequests();
      } else {
        try {
          if (toastId && typeof toastId !== "object" && toast.error) {
            toast.error(json.message || "Failed to delete request.", { id: toastId });
          } else {
            toast.error(json.message || "Failed to delete request.");
          }
        } catch {
          toast.error(json.message || "Failed to delete request.");
        }
      }
    } catch (err) {
      console.error("Delete request error:", err);
      try {
        if (toastId && typeof toastId !== "object" && toast.error) {
          toast.error("Failed to delete request due to server or network error.", { id: toastId });
        } else {
          toast.error("Failed to delete request due to server or network error.");
        }
      } catch {
        toast.error("Failed to delete request due to server or network error.");
      }
    }
  };


  /* ── Filtered + paginated list ── */
  const isSearchActive = search.trim().length > 0;

  const matchRecord = (r: MaterialRequest, q: string) =>
    r.referenceId.toLowerCase().includes(q)   ||
    r.requester.toLowerCase().includes(q)      ||
    r.department.toLowerCase().includes(q)     ||
    r.productDetails.toLowerCase().includes(q);

  const filtered = isSearchActive
    ? allRequests.filter((r) => matchRecord(r, search.toLowerCase()))
    : requests.filter((r) => matchRecord(r, search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Retrieve assigned vendor details from localStorage for modals
  const cachedMrVendors = localStorage.getItem("invenpro_mr_vendors");
  let assignedVendorName = "";
  let assignedVendorContact = "";
  let assignedVendorAddress = "";
  if (cachedMrVendors && selected) {
    try {
      const map = JSON.parse(cachedMrVendors);
      const mapped = map[selected._id];
      if (mapped) {
        assignedVendorName = mapped.vendorName;
        assignedVendorContact = mapped.vendorContact;
        assignedVendorAddress = mapped.vendorAddress;
      }
    } catch {}
  }

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Approval Management</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Material Request Approvals</h1>
            <p className="text-slate-500 text-sm mt-1">
              Review and process material requests. Approve triggers automatic stock check and inventory deduction.
            </p>
          </div>
          <button
            onClick={() => { fetchRequests(); fetchAllCounts(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            <RefreshCcw className={`w-4 h-4 ${loading.list || loading.counts ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ════ LEFT PANEL ════ */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">

          {/* Search bar */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              {isGlobalSearching ? (
                <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                id="approvals-search-input"
                placeholder="Search by ID, requester, product… (all tabs)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
              />
              {isSearchActive && (
                <button
                  id="approvals-search-clear"
                  onClick={() => {
                    setSearch("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-300 hover:bg-slate-400 text-white transition-all"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {isSearchActive && (
              <p className="text-[10px] text-blue-600 font-semibold mt-1.5 ml-1 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Searching across all tabs
                {isGlobalSearching && <span className="text-slate-400"> — loading…</span>}
              </p>
            )}
          </div>

          {/* ── Status Tab Buttons ── */}
          <div className="p-4 border-b border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Filter by Status</p>
            <div className="flex flex-col gap-2">
              {/* Top 3 */}
              <div className="grid grid-cols-3 gap-2">
                {TABS.slice(0, 3).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeSlug === tab.slug;
                  const count = counts[tab.apiStatus];
                  return (
                    <button
                      key={tab.slug}
                      onClick={() => switchTab(tab.slug)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isActive
                          ? `${tab.activeBg} ${tab.activeText} shadow-lg ${tab.activeShadow}`
                          : `bg-white border ${tab.inactiveBorder} ${tab.inactiveText} ${tab.inactiveHover}`
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate text-xs">{tab.label}</span>
                      <span className={`ml-auto text-[10px] font-extrabold min-w-[20px] text-center px-1.5 py-0.5 rounded-full ${
                        isActive ? `${tab.countActiveBg} ${tab.countActiveText}` : `${tab.countBg} ${tab.countText}`
                      }`}>
                        {loading.counts && count === 0 ? "…" : count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Bottom 2 */}
              <div className="grid grid-cols-2 gap-2">
                {TABS.slice(3).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeSlug === tab.slug;
                  const count = counts[tab.apiStatus];
                  return (
                    <button
                      key={tab.slug}
                      onClick={() => switchTab(tab.slug)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isActive
                          ? `${tab.activeBg} ${tab.activeText} shadow-lg ${tab.activeShadow}`
                          : `bg-white border ${tab.inactiveBorder} ${tab.inactiveText} ${tab.inactiveHover}`
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate text-xs">{tab.label}</span>
                      <span className={`ml-auto text-[10px] font-extrabold min-w-[20px] text-center px-1.5 py-0.5 rounded-full ${
                        isActive ? `${tab.countActiveBg} ${tab.countActiveText}` : `${tab.countBg} ${tab.countText}`
                      }`}>
                        {loading.counts && count === 0 ? "…" : count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Request List ── */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {isSearchActive ? "Search Results" : `${activeTab.label} Requests`}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSearchActive ? "bg-blue-100 text-blue-700" : `${activeTab.countBg} ${activeTab.countText}`}`}>
                {filtered.length} found
              </span>
            </div>

            {loading.list && !isSearchActive ? (
              <div className="flex justify-center items-center py-14">
                <RefreshCcw className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <Boxes className="w-9 h-9 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">
                  {isSearchActive ? "No matching records found." : `No ${activeTab.label.toLowerCase()} requests`}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isSearchActive ? `No results for "${search}" across any tab` : "All clear!"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {paginated.map((req) => (
                  <ListItem
                    key={req._id}
                    item={req}
                    isSelected={selected?._id === req._id}
                    onClick={() => handleSelect(req)}
                    onDeleteAction={activeSlug === "procurement-required" ? () => handleDeleteClick(req) : undefined}
                    searchQuery={isSearchActive ? search : ""}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {filtered.length > PAGE_SIZE && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-700">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</span>
                {" "}of{" "}
                <span className="font-bold text-slate-700">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold text-sm"
                >‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                      p === safePage
                        ? `${activeTab.activeBg} ${activeTab.activeText} shadow-sm`
                        : "border border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >{p}</button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold text-sm"
                >›</button>
              </div>
            </div>
          )}
        </div>

        {/* ── ════ RIGHT PANEL ════ ── */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <DetailsPanel
            item={selected}
            stockResult={stockResult}
            stockMessage={stockMessage}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
            onCheckStock={handleCheckStock}
            onProcess={handleProcess}
            onCloseStock={() => { setStockResult(null); setStockMessage(null); }}
            onProcure={() => selected && handleMoveToProcurement(selected)}
            onIssueStock={handleIssueStock}
            onOpenVendorModal={() => {
              setSelectedVendorName("");
              setPoUnitPrice(1200);
              setShowVendorModal(true);
            }}
            onOpenPoModal={() => {
              setPoExpectedDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
              setPoPaymentTerms("Net 30");
              setShowPoModal(true);
            }}
          />
          {/* Workflow diagram — shown when no item selected */}
          {!selected && <WorkflowDiagram />}
        </div>
      </div>

      {showVendorModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-lg w-full mx-4 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-800">Vendor Selection</h3>
                <p className="text-slate-400 text-xs mt-0.5">Assign a designated supplier for {selected.productDetails}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border p-3 rounded-xl text-xs space-y-1">
                <p><span className="font-bold text-slate-700">MR Reference:</span> {selected.referenceId}</p>
                <p><span className="font-bold text-slate-700">Shortage Quantity:</span> {Math.max(1, selected.quantity - (stockResult ? stockResult.stock : 0))} units</p>
                <p><span className="font-bold text-slate-700">Department:</span> {selected.department}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Supplier</label>
                <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1">
                  {STATIC_VENDORS.map((v) => (
                    <div
                      key={v.name}
                      onClick={() => {
                        setSelectedVendorName(v.name);
                        // default negotiated price per vendor or category
                        if (v.name.includes("Dell")) setPoUnitPrice(42000);
                        else if (v.name.includes("HP")) setPoUnitPrice(45000);
                        else if (v.name.includes("Logitech")) setPoUnitPrice(850);
                        else setPoUnitPrice(1200);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${selectedVendorName === v.name ? "bg-purple-50/50 border-purple-400 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs">{v.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{v.contact}</p>
                        <p className="text-[10px] text-slate-400 truncate">{v.address}</p>
                      </div>
                      {selectedVendorName === v.name && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Negotiated Unit Price (INR)</label>
                <input
                  type="number"
                  value={poUnitPrice}
                  onChange={(e) => setPoUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => { setShowVendorModal(false); setSelectedVendorName(""); }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignVendor}
                disabled={!selectedVendorName}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {showPoModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-lg w-full mx-4 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-800">Generate Purchase Order</h3>
                <p className="text-slate-400 text-xs mt-0.5">Generate a PO for the exact shortage quantity.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 border p-3 rounded-xl text-xs grid grid-cols-2 gap-2">
                <p><span className="font-bold text-slate-700">Linked Request:</span> {selected.referenceId}</p>
                <p><span className="font-bold text-slate-700">Supplier:</span> {assignedVendorName}</p>
                <p><span className="font-bold text-slate-700">Item:</span> {selected.productDetails}</p>
                <p><span className="font-bold text-slate-700">Shortage Qty:</span> <span className="font-bold text-red-600">{Math.max(1, selected.quantity - (stockResult ? stockResult.stock : 0))} units</span></p>
                <p><span className="font-bold text-slate-700">Unit Price:</span> ₹{poUnitPrice.toLocaleString()}</p>
                <p><span className="font-bold text-slate-700">Grand Total (+18% Tax):</span> <span className="font-extrabold text-blue-600">₹{Math.round(Math.max(1, selected.quantity - (stockResult ? stockResult.stock : 0)) * poUnitPrice * 1.18).toLocaleString()}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Delivery Date</label>
                <input
                  type="date"
                  value={poExpectedDate}
                  onChange={(e) => setPoExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Terms</label>
                <select
                  value={poPaymentTerms}
                  onChange={(e) => setPoPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                >
                  <option value="COD">Cash On Delivery (COD)</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPoModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreatePO}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-50"
              >
                Confirm & Create PO
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && requestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border p-6 max-w-md w-full mx-4 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce" />
              <h3 className="text-lg font-black tracking-tight">Delete Procurement Request</h3>
            </div>
            
            <div className="text-slate-600 text-sm space-y-2">
              <p>Are you sure you want to delete this Procurement Request?</p>
              <div className="bg-slate-50 border p-3 rounded-xl text-xs font-semibold text-slate-500">
                <span className="font-bold text-slate-700">Reference:</span> {requestToDelete.referenceId}<br/>
                <span className="font-bold text-slate-700">Product:</span> {requestToDelete.productDetails} ({requestToDelete.quantity} qty)<br/>
                <span className="font-bold text-slate-700">Department:</span> {requestToDelete.department}
              </div>
              <p className="text-red-500 font-bold text-xs mt-1">⚠️ This action cannot be undone.</p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => { setShowDeleteModal(false); setRequestToDelete(null); }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
