import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { API_BASE_URL } from "../../config/http";


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
  Pending:                { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  dot: "bg-amber-400"  },
  Approved:               { bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",dot: "bg-emerald-500"},
  Rejected:               { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-600",    dot: "bg-red-500"    },
  "Procurement Required": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  Completed:              { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
  "Procurement Completed": { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
  "PO Created":            { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
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
    { label: "Approved",    done: ["Approved", "Completed", "Procurement Required"].includes(status) },
    { label: "Stock Check", done: ["Completed", "Procurement Required"].includes(status) },
    { label: "Fulfilled",   done: status === "Completed" },
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
   LEFT LIST ITEM
================================================================ */
const ListItem = ({
  item, isSelected, onClick, onDeleteAction,
}: {
  item: MaterialRequest; isSelected: boolean; onClick: () => void; onDeleteAction?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 group ${isSelected ? "bg-blue-50 border-blue-300 shadow-sm" : "bg-slate-50 border-transparent hover:border-slate-300 hover:bg-white hover:shadow-sm"}`}
  >
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="font-bold text-slate-800 text-sm">{item.referenceId}</span>
          <PriorityBadge priority={item.priority} />
        </div>
        <p className="text-xs text-slate-500 truncate">{item.requester} · {item.department}</p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{item.productDetails}</p>
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
}

const DetailsPanel = ({
  item, stockResult, stockMessage, loading,
  onApprove, onReject, onCheckStock, onProcess, onCloseStock, onProcure,
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
  const isCompleted   = item.status === "Completed" || item.status === "Procurement Completed" || item.status === "PO Created";
  const isProcurement = item.status === "Procurement Required";
  const isRejected    = item.status === "Rejected";
  const canAct        = isPending || isApproved || isProcurement;
  const anyLoading    = loading.approve || loading.reject || loading.stock || loading.process;

  const resolvedBanner = item.status === "Completed"
    ? { bg: "bg-blue-50 border-blue-100", icon: <CheckCircle className="w-4 h-4 text-blue-600" />, iconBg: "bg-blue-100", title: "Request Completed", desc: "Stock was available and has been deducted from inventory.", textColor: "text-blue-700", descColor: "text-blue-600" }
    : item.status === "Procurement Completed" || item.status === "PO Created"
    ? { bg: "bg-blue-50 border-blue-100", icon: <CheckCircle className="w-4 h-4 text-blue-600" />, iconBg: "bg-blue-100", title: "Procurement Completed", desc: "Purchase Order was created and procurement has been successfully completed.", textColor: "text-blue-700", descColor: "text-blue-600" }
    : isProcurement
    ? { bg: "bg-orange-50 border-orange-100", icon: <AlertTriangle className="w-4 h-4 text-orange-600" />, iconBg: "bg-orange-100", title: "Procurement Required", desc: "Stock was insufficient. A purchase requisition must be raised.", textColor: "text-orange-700", descColor: "text-orange-600" }
    : isRejected
    ? { bg: "bg-red-50 border-red-100", icon: <XCircle className="w-4 h-4 text-red-600" />, iconBg: "bg-red-100", title: "Request Rejected", desc: "This material request was rejected by the admin.", textColor: "text-red-700", descColor: "text-red-600" }
    : null;

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

          {/* ── Action Buttons (Pending, Approved & Procurement Required) ── */}
          {canAct && (
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Actions</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isPending ? "bg-amber-50 text-amber-700 border border-amber-200" : isApproved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>
                  {isPending ? "⏳ Awaiting Approval" : isApproved ? "✓ Approved — Awaiting Stock Check" : "🟠 Procurement Required"}
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

                {/* Process & Check Stock — Approved only */}
                {isApproved && (
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

                {/* Procurement Required — Procurement Required only */}
                {isProcurement && onProcure && (
                  <button
                    id="btn-procure"
                    onClick={onProcure}
                    disabled={anyLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Procurement Required
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
                  ) : (
                    <>
                      <span className="font-semibold text-orange-600">Procurement Required</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span>Click Procurement Required Button</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="font-semibold text-blue-600">Create PO → Completed</span>
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
  const [selected,      setSelected]      = useState<MaterialRequest | null>(null);
  const [counts,        setCounts]        = useState<CountsMap>(EMPTY_COUNTS);
  const [stockResult,   setStockResult]   = useState<StockResult | null>(null);
  const [stockMessage,  setStockMessage]  = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [search,        setSearch]        = useState("");
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState({ list: false, counts: false, approve: false, reject: false, stock: false, process: false });
  const [requestToDelete, setRequestToDelete] = useState<MaterialRequest | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const activeTab = TABS.find((t) => t.slug === activeSlug)!;

  /* ── Fetch all tab counts in parallel ── */
  const fetchAllCounts = useCallback(async () => {
    setLoading((p) => ({ ...p, counts: true }));
    try {
      const statuses: string[] = ["Pending", "Approved", "Completed", "Rejected", "Procurement Required", "Procurement Completed", "PO Created"];
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
      results.forEach(({ status, count }) => {
        if (status === "Completed" || status === "Procurement Completed" || status === "PO Created") {
          completedCount += count;
        } else if (status in map) {
          map[status as ApiStatus] = count;
        }
      });
      map["Completed"] = completedCount;
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
      if (tab.apiStatus === "Completed") {
        const [res1, res2, res3] = await Promise.all([
          fetch(`${API_BASE_URL}/material?status=Completed`).then(r => r.json()),
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("Procurement Completed")}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("PO Created")}`).then(r => r.json())
        ]);
        list = [...(res1.data ?? []), ...(res2.data ?? []), ...(res3.data ?? [])];
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


  /* ── Switch tab + refresh ── */
  const switchTab = useCallback((slug: TabSlug) => {
    setActiveSlug(slug);
    setSearch("");
    setPage(1);
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    fetchRequests();
    fetchAllCounts();
  }, [activeSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Reset page on search ── */
  useEffect(() => { setPage(1); }, [search]);

  const handleSelect = (item: MaterialRequest) => {
    setSelected(item);
    setStockResult(null);
    setStockMessage(null);
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

  /* ── Approve: mark Approved and move to Approved tab ── */
  const handleApprove = async () => {
    if (!selected) return;
    setLoading((p) => ({ ...p, approve: true }));
    setStockResult(null);
    setStockMessage(null);
    try {
      // 1. Mark Approved
      await fetch(`${API_BASE_URL}/material/${selected._id}/approve`, { method: "PUT" });
      setStockMessage({ text: "✓ Material Request Approved successfully.", type: "success" });
      
      // 2. Refresh counts and switch tab
      await fetchAllCounts();
      switchTab("approved");
      await fetchRequests("approved");
    } catch {
      setStockMessage({ text: "An error occurred. Please try again.", type: "error" });
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
        await fetch(`${API_BASE_URL}/inventory/deduct-stock/${result.inventoryId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: selected.quantity }),
        });
        await fetch(`${API_BASE_URL}/material/${selected._id}/complete`, { method: "PUT" });
        setStockMessage({ text: `✓ Stock Available — Deducted ${selected.quantity} units. Request marked as Completed.`, type: "success" });
        await fetchAllCounts();
        switchTab("completed");
        await fetchRequests("completed");
      } else {
        await fetch(`${API_BASE_URL}/material/${selected._id}/procurement-required`, { method: "PUT" });
        setStockMessage({ text: "✗ Stock Not Available — Moved to Procurement Required.", type: "error" });
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

  const handleMoveToProcurement = async (req: MaterialRequest) => {
    const toastId = toast.loading(`Transferring ${req.referenceId} to Vendor module...`);
    try {
      // 1. Fetch available vendors to pick one
      let vendorName = "HP Solutions";
      try {
        const vendorRes = await fetch(`${API_BASE_URL}/vendor/get`);
        const vendorData = await vendorRes.json();
        let loadedVendors = [];
        if (Array.isArray(vendorData)) {
          loadedVendors = vendorData;
        } else if (vendorData && Array.isArray(vendorData.vendors)) {
          loadedVendors = vendorData.vendors;
        }
        if (loadedVendors.length > 0) {
          const matched = loadedVendors.find((v: any) => 
            (v.name || v.vendorName || "").toLowerCase().includes(req.department.toLowerCase()) ||
            (v.productType || v.category || "").toLowerCase().includes(req.productDetails.toLowerCase())
          );
          vendorName = matched ? (matched.name || matched.vendorName) : (loadedVendors[0].name || loadedVendors[0].vendorName);
        }
      } catch (err) {
        console.warn("Failed to fetch vendors, defaulting to HP Solutions", err);
      }

      // 2. Build purchase request payload
      const requestNumber = "PR-" + Math.floor(1000 + Math.random() * 9000);
      const todayStr = new Date().toISOString().split("T")[0];
      
      const prPayload = {
        department: req.department,
        vendor: vendorName,
        products: [{
          name: req.productDetails,
          quantity: req.quantity,
          price: 1200
        }],
        totalAmount: req.quantity * 1200,
        requestedBy: req.requester,
        status: "Pending",
        createdDate: todayStr,
        materialRequestId: req._id
      };

      const fullLocalPR = {
        ...prPayload,
        id: requestNumber,
        vendorId: "1",
        startDate: todayStr,
        endDate: todayStr,
        deliveryAddress: "Corporate Head Office",
        specialInstructions: `Generated automatically from Material Request ${req.referenceId}`,
        totalQty: req.quantity,
        materialRequestId: req._id
      };

      // 3. POST purchase request to database
      try {
        const createRes = await fetch(`${API_BASE_URL}/purchase-request/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prPayload)
        });
        const createJson = await createRes.json();
        if (createJson.success && createJson.data) {
          const dbPR = createJson.data;
          fullLocalPR.id = dbPR.id || "PR-" + dbPR._id.substring(dbPR._id.length - 4).toUpperCase();
        }
      } catch (err) {
        console.warn("Backend purchase request save failed, falling back to local storage only", err);
      }

      // 4. Save to local storage for dynamic sync in vendors module
      const saved = localStorage.getItem("purchase_requests");
      let requestsList = [];
      if (saved) {
        try {
          requestsList = JSON.parse(saved);
        } catch {
          requestsList = [];
        }
      }
      requestsList.unshift(fullLocalPR);
      localStorage.setItem("purchase_requests", JSON.stringify(requestsList));

      toast.success(`Request ${req.referenceId} successfully moved to Vendor module! 🎉`, { id: toastId });

      // 5. Refresh approvals state dynamically
      await fetchAllCounts();
      await fetchRequests();

      // 6. Navigate directly to Vendors page's Purchase Requests tab
      navigate("/procurement/vendor", { state: { activeTab: "purchase-request" } });

    } catch (error) {
      console.error("Move to procurement failed:", error);
      toast.error("Failed to transfer request to Vendor module.", { id: toastId });
    }
  };

  const handleDeleteClick = (req: MaterialRequest) => {
    setRequestToDelete(req);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    const toastId = toast.loading(`Deleting Procurement Request ${requestToDelete.referenceId}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/material/${requestToDelete._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Request ${requestToDelete.referenceId} permanently deleted! 🗑️`, { id: toastId });
        
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
        toast.error(json.message || "Failed to delete request.", { id: toastId });
      }
    } catch (err) {
      console.error("Delete request error:", err);
      toast.error("Failed to delete request due to server or network error.", { id: toastId });
    }
  };

  /* ── Filtered + paginated list ── */
  const filtered = requests.filter((r) => {

    const q = search.toLowerCase();
    return (
      r.referenceId.toLowerCase().includes(q)   ||
      r.requester.toLowerCase().includes(q)      ||
      r.department.toLowerCase().includes(q)     ||
      r.productDetails.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, requester, product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
              />
            </div>
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
                {activeTab.label} Requests
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab.countBg} ${activeTab.countText}`}>
                {filtered.length} found
              </span>
            </div>

            {loading.list ? (
              <div className="flex justify-center items-center py-14">
                <RefreshCcw className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <Boxes className="w-9 h-9 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No {activeTab.label.toLowerCase()} requests</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {search ? "Try a different search term" : "All clear!"}
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
          />
          {/* Workflow diagram — shown when no item selected */}
          {!selected && <WorkflowDiagram />}
        </div>
      </div>

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
