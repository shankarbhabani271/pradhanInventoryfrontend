import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Printer, Download, Check, X, FileText, Calendar, AlertCircle, SlidersHorizontal, Edit, Truck, Award, Layers, Users, ChevronRight } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";
import { toast } from "sonner";
import { getSavedSettings, getCurrencySymbol, formatDate, buildLogoUrl } from "../../utils/settingsHelper";

interface VendorQuotation {
  vendorName: string;
  quotationAmount: number;
  quotationDate: string;
  vendorStatus: string;
  selectionStatus: "Pending" | "Selected" | "Rejected";
}

interface PurchaseRequestItem {
  id: string; // PR-2026-001 ERP serial ID
  _id?: string; // Mongo ObjectId
  vendorId: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  department: string;
  requestedBy: string;
  priority: string;
  items: { productName: string; qty: number; price: number }[];
  deliveryAddress: string;
  specialInstructions: string;
  totalQty: number;
  totalAmount: number;
  status: string;
  deliveryRequired?: string;
  deliveryStatus?: string;
  poNumber?: string;
  createdDate: string;
  // ── Procurement Traceability Fields ──
  rfqNumber?: string;
  vendorQuotationNumber?: string;
  procurementOfficer?: string;
  approvalDate?: string;
  procurementStage?: string;
  vendorQuotations?: VendorQuotation[];
  approvedVendorName?: string;
  approvedVendorAmount?: number;
  approvedVendorDate?: string;
}

const INITIAL_REQUESTS: PurchaseRequestItem[] = [];

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

export default function PurchaseRequestList() {
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);
  const navigate = useNavigate();
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

  const [requests, setRequests] = useState<PurchaseRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequestItem | null>(null);

  // Map backend MongoDB data structure to match local structure
  const mapDbToLocal = (dbItem: any): PurchaseRequestItem => {
    return {
      // requestId = ERP serial "PR-2026-001" set by backend counter.
      // Never use dbItem.id — Mongoose serialises it as the full ObjectId string.
      id: dbItem.requestId || ("PR-" + String(dbItem._id).slice(-4).toUpperCase()),
      _id: dbItem._id,
      vendorId: dbItem.vendorId || "1",
      vendorName: dbItem.vendor || dbItem.vendorName || "Unknown Supplier",
      startDate: dbItem.startDate || dbItem.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
      endDate: dbItem.endDate || dbItem.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
      department: dbItem.department || "IT",
      requestedBy: dbItem.requestedBy || "Admin",
      priority: dbItem.priority || "Medium",
      items: Array.isArray(dbItem.products)
        ? dbItem.products.map((p: any) => ({ productName: p.name || p.productName, qty: p.quantity || p.qty, price: p.price }))
        : (Array.isArray(dbItem.items) ? dbItem.items : []),
      deliveryAddress: dbItem.deliveryAddress || "Corporate Head Office",
      specialInstructions: dbItem.specialInstructions || "",
      totalQty: dbItem.totalQty || (Array.isArray(dbItem.products) ? dbItem.products.reduce((acc: number, cur: any) => acc + (cur.quantity || 0), 0) : 0),
      totalAmount: dbItem.totalAmount || 0,
      status: dbItem.status || "Pending",
      deliveryStatus: dbItem.deliveryStatus || "Pending",
      poNumber: dbItem.poNumber || "",
      createdDate: dbItem.createdDate || dbItem.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
      // ── Procurement Traceability ──
      rfqNumber: dbItem.rfqNumber || "",
      vendorQuotationNumber: dbItem.vendorQuotationNumber || "",
      procurementOfficer: dbItem.procurementOfficer || "",
      approvalDate: dbItem.approvalDate ? new Date(dbItem.approvalDate).toISOString().split("T")[0] : "",
      procurementStage: dbItem.procurementStage || "",
      vendorQuotations: Array.isArray(dbItem.vendorQuotations) ? dbItem.vendorQuotations : [],
      approvedVendorName: dbItem.approvedVendorName || "",
      approvedVendorAmount: dbItem.approvedVendorAmount || 0,
      approvedVendorDate: dbItem.approvedVendorDate ? new Date(dbItem.approvedVendorDate).toISOString().split("T")[0] : "",
    };
  };

  // Sync data from database + local storage
  const syncRequestsData = async () => {
    setLoading(true);
    let dbItems: PurchaseRequestItem[] = [];

    // 1. Fetch from Mongo database API
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-request/get`);
      if (Array.isArray(response.data)) {
        dbItems = response.data.map(mapDbToLocal);
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch from Mongo database backend. Falling back to local storage.", err);
    }

    // 2. Fetch from local storage
    const savedLocal = localStorage.getItem("purchase_requests");
    let localItems: PurchaseRequestItem[] = [];
    if (savedLocal) {
      try {
        localItems = JSON.parse(savedLocal);
      } catch (err) {
        localItems = [];
      }
    } else {
      localStorage.setItem("purchase_requests", JSON.stringify(INITIAL_REQUESTS));
      localItems = INITIAL_REQUESTS;
    }

    // 3. Smart Merge: combine database items and local storage items uniquely
    const merged = [...dbItems];
    localItems.forEach(localIt => {
      const exists = merged.some(m => m.id === localIt.id || (m._id && localIt._id && m._id === localIt._id));
      if (!exists) {
        merged.push(localIt);
      }
    });

    // Sort by Date DESC
    merged.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    setRequests(merged);
    setLoading(false);
  };

  useEffect(() => {
    syncRequestsData();
  }, []);

  const [approvalModalPr, setApprovalModalPr] = useState<PurchaseRequestItem | null>(null);

  const handleUpdateRequestFields = async (item: PurchaseRequestItem, fields: Partial<PurchaseRequestItem>) => {
    try {
      // 1. If item has database MongoDB ID, update status/fields in database
      if (item._id) {
        await axios.put(`${API_BASE_URL}/purchase-request/status/${item._id}`, fields);
      }
    } catch (err) {
      console.error("Failed to update fields on Mongo database.", err);
    }

    // 2. Update locally (both state and local storage)
    const updated = requests.map(r => r.id === item.id ? { ...r, ...fields } : r);
    localStorage.setItem("purchase_requests", JSON.stringify(updated));
    setRequests(updated);

    if (selectedRequest && selectedRequest.id === item.id) {
      setSelectedRequest({ ...selectedRequest, ...fields });
    }
  };

  const handlePrint = (request: PurchaseRequestItem) => {
    const logoSrc = buildLogoUrl(settings.logoUrl, settings.logoVersion ?? 0, API_BASE_URL);
    const logoHtml = logoSrc 
      ? `<img src="${logoSrc}" alt="${settings.orgName}" style="max-height: 50px; max-width: 150px; object-fit: contain; margin-bottom: 10px;" />`
      : `<div style="height: 40px; width: 40px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; margin-bottom: 10px;">📦</div>`;

    const printContent = `
      <html>
        <head>
          <title>Purchase Order ${request.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .title h1 { color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; }
            .title p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
            .meta-card h3 { color: #0f172a; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f1f5f9; color: #0f172a; font-weight: 700; font-size: 13px; text-transform: uppercase; }
            td { font-size: 14px; color: #334155; }
            .total-section { display: flex; justify-content: flex-end; margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
            .total-box { text-align: right; }
            .total-box span { color: #64748b; font-size: 14px; font-weight: 600; }
            .total-box h2 { color: #4f46e5; margin: 5px 0 0 0; font-size: 24px; font-weight: 800; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">
              ${logoHtml}
              <h1>${settings.orgName}</h1>
              <p>ID: ${request.id}</p>
            </div>
            <div style="text-align: right;">
              <span style="background: #fef3c7; color: #d97706; padding: 6px 12px; font-weight: bold; border-radius: 20px; font-size: 12px;">${request.status}</span>
            </div>
          </div>
          
          <div class="meta-grid">
            <div class="meta-card">
              <h3>Vendor Details</h3>
              <strong>${request.vendorName}</strong><br>
              <span style="color: #64748b; font-size: 13px;">Delivery Address: ${request.deliveryAddress || "N/A"}</span>
            </div>
            <div class="meta-card">
              <h3>Order Details</h3>
              Date Created: ${formatDate(request.createdDate, settings.dateFormat)}<br>
              Priority: ${request.priority}<br>
              Department: ${request.department}<br>
              Requested By: ${request.requestedBy}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price (${currencySymbol})</th>
                <th>Subtotal (${currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              ${request.items.map(item => `
                <tr>
                  <td><strong>${item.productName || "General Item"}</strong></td>
                  <td>${item.qty} units</td>
                  <td>${currencySymbol}${item.price.toLocaleString()}</td>
                  <td style="color: #4f46e5; font-weight: bold;">${currencySymbol}${(item.qty * item.price).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <span>Total Amount:</span>
              <h2>${currencySymbol}${request.totalAmount.toLocaleString()}</h2>
            </div>
          </div>

          <div class="footer">
            Generated by ${settings.orgName} Purchase Management System on ${formatDate(new Date(), settings.dateFormat)}
          </div>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  const handleDownload = (request: PurchaseRequestItem) => {
    toast.success(`📥 PDF for ${request.id} prepared for download!`, {
      description: `Vendor: ${request.vendorName} | Amount: ${currencySymbol}${request.totalAmount.toLocaleString()}`,
    });
  };

  // Get unique vendors list for filtering
  const uniqueVendors = Array.from(new Set(requests.map(r => r.vendorName || "")));

  // Advanced filters logic
  const filteredRequests = requests.filter(r => {
    const searchLower = (searchQuery || "").toLowerCase();
    const matchesSearch = 
      (r.vendorName || "").toLowerCase().includes(searchLower) || 
      (r.id || "").toLowerCase().includes(searchLower) ||
      (r.requestedBy || "").toLowerCase().includes(searchLower) ||
      (r.items || []).some(it => (it.productName || "").toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || r.priority === priorityFilter;
    const matchesVendor = vendorFilter === "All" || r.vendorName === vendorFilter;
    const matchesDate = !dateFilter || r.createdDate === dateFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesVendor && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-50/20 p-4 md:p-8">
      {/* Top Welcome Section */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-1">
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
            Procurement Flow
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 mt-1">
            Purchase Requests List
          </h1>
          <p className="text-slate-500 text-sm font-semibold">
            Review, filter, approve, and download generated purchase requisitions.
          </p>
        </div>
      </div>

      {/* Main Container */}
      {requests.length > 0 ? (
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="space-y-6">
            
            {/* Filters Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                  <SlidersHorizontal size={16} className="text-indigo-600" />
                  <span>Filters & Search</span>
                </div>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                    setPriorityFilter("All");
                    setVendorFilter("All");
                    setDateFilter("");
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition"
                >
                  Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative md:col-span-2">
                  <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Request / item / requester..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 pl-10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-800 bg-white"
                  />
                </div>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 p-2.5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Priority */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-slate-200 p-2.5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                {/* Vendor */}
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="border border-slate-200 p-2.5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="All">All Vendors</option>
                  {uniqueVendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>
              
              {/* Date filter row */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter by Date:</span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-slate-200 px-3 py-1 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* List Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-16 text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-slate-400 text-xs font-bold">Loading purchase requests...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                     <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-4 whitespace-nowrap">Request Info</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Vendor</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Items Ordered</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Amount</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Delivery</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">
                            No purchase requests found matching the search/filters.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map(r => {
                          const friendlyPrId = getFriendlyPrId(r);
                          const totalQty = r.totalQty || r.items?.reduce((acc: number, cur: any) => acc + (cur.qty || cur.quantity || 0), 0) || 1;
                          let priorityClass = "";
                          if (r.priority === "High") priorityClass = "bg-rose-50 text-rose-700 border-rose-100";
                          else if (r.priority === "Medium") priorityClass = "bg-amber-50 text-amber-700 border-amber-100";
                          else priorityClass = "bg-emerald-50 text-emerald-700 border-emerald-100";

                          let statusClass = "";
                          if (r.status.startsWith("Approved")) statusClass = "bg-green-500/10 text-green-700 border border-green-200/50";
                          else if (r.status === "Rejected") statusClass = "bg-rose-500/10 text-rose-700 border border-rose-200/50";
                          else statusClass = "bg-amber-500/10 text-amber-700 border border-amber-200/50";

                          // Consolidated items description
                          const itemsSummary = r.items && r.items.length > 0 
                            ? r.items.map(i => `${i.qty || i.quantity || 0} × ${i.productName}`).join(", ") 
                            : `${totalQty} × Items`;

                          return (
                            <tr
                               key={r.id}
                               onClick={() => setSelectedRequest(r)}
                               className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${selectedRequest?.id === r.id ? "bg-indigo-50/30" : ""}`}
                             >
                               {/* Request Info (ID & PO Badge) */}
                               <td className="py-3.5 px-4 whitespace-nowrap">
                                 <div className="flex flex-col gap-1">
                                   <span className="font-black text-indigo-700 text-xs tracking-tight bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 w-fit">{friendlyPrId}</span>
                                   {r.poNumber && (
                                     <span className="font-bold text-violet-700 text-[9px] tracking-tight bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100 w-fit">PO: {r.poNumber}</span>
                                   )}
                                 </div>
                               </td>

                               {/* Vendor Name */}
                               <td className="py-3.5 px-4 font-bold text-slate-800 text-xs whitespace-nowrap">{r.vendorName}</td>

                               {/* Items Ordered */}
                               <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap font-semibold max-w-[180px] truncate" title={itemsSummary}>
                                 {itemsSummary}
                               </td>

                               {/* Amount */}
                               <td className="py-3.5 px-4 font-black text-indigo-600 text-sm text-right whitespace-nowrap">{currencySymbol}{r.totalAmount.toLocaleString()}</td>

                               {/* Status & Priority */}
                               <td className="py-3.5 px-4 whitespace-nowrap">
                                 <div className="flex flex-col gap-1">
                                   <span className={`px-2.5 py-0.5 rounded-xl text-[9px] font-black w-fit ${statusClass}`}>
                                     {r.status}
                                   </span>
                                   <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border w-fit ${priorityClass}`}>
                                     {r.priority} Priority
                                   </span>
                                 </div>
                               </td>

                               {/* Delivery Status */}
                               <td className="py-3.5 px-4 whitespace-nowrap">
                                 <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black border ${
                                   r.deliveryRequired === "No" ? "bg-slate-50 text-slate-400 border-slate-200" :
                                   r.deliveryStatus === "Delivered" || r.deliveryStatus === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                   r.deliveryStatus === "In Transit" || r.deliveryStatus === "Processing" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                   r.deliveryStatus === "Pending Delivery" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                   "bg-slate-50 text-slate-400 border-slate-200"
                                 }`}>
                                   {r.deliveryRequired === "No" ? "No Delivery" : r.deliveryStatus || "Pending"}
                                 </span>
                               </td>
                               <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                 <div className="flex gap-2 justify-end items-center" onClick={e => e.stopPropagation()}>
                                   <button
                                     onClick={() => {
                                       setSelectedRequest(r);
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
                                   <div className="relative inline-block text-left">
                                     <button
                                       onClick={() => setOpenActionDropdownId(openActionDropdownId === r.id ? null : r.id)}
                                       className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[10px] transition"
                                     >
                                       ⋮ More
                                     </button>
                                     {openActionDropdownId === r.id && (
                                       <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
                                         <button
                                           onClick={() => {
                                             handlePrint(r);
                                             setOpenActionDropdownId(null);
                                           }}
                                           className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                         >
                                           <Printer size={12} /> Print
                                         </button>
                                         <button
                                           onClick={() => {
                                             handleDownload(r);
                                             setOpenActionDropdownId(null);
                                           }}
                                           className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                         >
                                           <Download size={12} /> Download PDF
                                         </button>
                                         
                                         {/* Pending Request actions */}
                                         {r.status === "Pending" && (
                                           <>
                                             <button
                                               onClick={() => {
                                                 setApprovalModalPr(r);
                                                 setOpenActionDropdownId(null);
                                               }}
                                               className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                             >
                                               <Check size={12} /> Approve
                                             </button>
                                             <button
                                               onClick={() => {
                                                 handleUpdateRequestFields(r, { status: "Rejected" });
                                                 setOpenActionDropdownId(null);
                                               }}
                                               className="w-full text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                             >
                                               <X size={12} /> Reject
                                             </button>
                                           </>
                                         )}

                                         {/* Approved Request actions */}
                                         {(r.status.startsWith("Approved") || r.status === "Approved - No Delivery Required") && !r.poNumber && (
                                           <button
                                             onClick={() => {
                                               const generatedPoNum = "PO-2026-" + String(Math.floor(100 + Math.random() * 900));
                                               handleUpdateRequestFields(r, { poNumber: generatedPoNum });
                                               toast.success(`Purchase Order ${generatedPoNum} created successfully!`);
                                               setOpenActionDropdownId(null);
                                             }}
                                             className="w-full text-left px-4 py-2 hover:bg-violet-50 hover:text-violet-700 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                           >
                                             <Check size={12} /> Create PO
                                           </button>
                                         )}

                                         {/* Approved + Delivery Required = Yes actions */}
                                         {r.deliveryRequired === "Yes" && (r.deliveryStatus === "Pending Delivery" || !r.deliveryStatus) && (
                                           <button
                                             onClick={() => {
                                               handleUpdateRequestFields(r, { deliveryStatus: "In Transit" });
                                               toast.success(`Delivery Order created! Status updated to In Transit.`);
                                               setOpenActionDropdownId(null);
                                             }}
                                             className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                           >
                                             <Truck size={12} /> Create Delivery Order
                                           </button>
                                         )}

                                         {/* Delivery progression when In Transit */}
                                         {r.deliveryRequired === "Yes" && r.deliveryStatus === "In Transit" && (
                                           <button
                                             onClick={() => {
                                               handleUpdateRequestFields(r, { deliveryStatus: "Delivered" });
                                               toast.success(`Status updated to Delivered.`);
                                               setOpenActionDropdownId(null);
                                             }}
                                             className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                           >
                                             <Check size={12} /> Mark Delivered
                                           </button>
                                         )}

                                         {/* Delivery progression when Delivered */}
                                         {r.deliveryRequired === "Yes" && r.deliveryStatus === "Delivered" && (
                                           <button
                                             onClick={() => {
                                               handleUpdateRequestFields(r, { deliveryStatus: "Completed" });
                                               toast.success(`Fulfillment finalized. Status updated to Completed.`);
                                               setOpenActionDropdownId(null);
                                             }}
                                             className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                           >
                                             <Check size={12} /> Mark Completed
                                           </button>
                                         )}

                                         <button
                                           onClick={() => {
                                             if (window.confirm("Are you sure you want to delete this purchase request?")) {
                                               const updated = requests.filter(item => item.id !== r.id);
                                               localStorage.setItem("purchase_requests", JSON.stringify(updated));
                                               setRequests(updated);
                                               if (selectedRequest?.id === r.id) setSelectedRequest(null);
                                               toast.success("Purchase request deleted successfully.");
                                             }
                                             setOpenActionDropdownId(null);
                                           }}
                                           className="w-full text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-700 text-red-600 text-xs font-semibold flex items-center gap-2"
                                         >
                                           <X size={12} /> Delete
                                         </button>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               </td>
                             </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Slide-over Drawer for Details */}
          <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${selectedRequest ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setSelectedRequest(null)}
            />
            {/* Drawer Panel */}
            <div className={`absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl border-l border-slate-100 flex flex-col transition-transform duration-300 ease-out transform ${selectedRequest ? "translate-x-0" : "translate-x-full"}`}>
              {selectedRequest && (
                <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
                  {/* Drawer Header */}
                  <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        {getFriendlyPrId(selectedRequest)}
                      </h3>
                      <p className="text-slate-400 text-[10px] font-bold mt-0.5">Created on {formatDate(selectedRequest.createdDate, settings.dateFormat)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        selectedRequest.status.startsWith("Approved") ? "bg-green-100 text-green-800" :
                        selectedRequest.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {selectedRequest.status}
                      </span>
                      <button 
                        onClick={() => setSelectedRequest(null)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Meta information */}
                    <div className="space-y-3 text-xs font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vendor:</span>
                        <span className="font-black text-slate-800">{selectedRequest.vendorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Requested By:</span>
                        <span className="text-slate-800 font-bold">{selectedRequest.requestedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Department:</span>
                        <span className="text-slate-800 font-bold">{selectedRequest.department}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Priority:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          selectedRequest.priority === "High" ? "bg-red-50 border-red-100 text-red-700" :
                          selectedRequest.priority === "Medium" ? "bg-yellow-50 border-yellow-100 text-yellow-700" : "bg-green-50 border-green-100 text-green-700"
                        }`}>
                          {selectedRequest.priority}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      <h4 className="font-black text-xs text-slate-800 border-b pb-1.5 flex gap-1 items-center">
                        <FileText size={14} className="text-indigo-600" />
                        <span>Items Ordered</span>
                      </h4>
                      <div className="bg-slate-50/70 rounded-2xl p-3.5 divide-y divide-slate-100 text-xs">
                        {(selectedRequest.items || []).map((item, index) => (
                          <div key={index} className="py-2.5 first:pt-0 last:pb-0 flex justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-800">{item.productName || "General Item"}</p>
                              <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Qty: {item.qty} × {currencySymbol}{item.price.toLocaleString()}</p>
                            </div>
                            <span className="font-black text-indigo-600">{currencySymbol}{(item.qty * item.price).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div className="space-y-3">
                      <h4 className="font-black text-xs text-slate-800 border-b pb-1.5 flex gap-1 items-center">
                        <Calendar size={14} className="text-indigo-600" />
                        <span>Delivery Details</span>
                      </h4>
                      <div className="text-[11px] font-semibold text-slate-600 space-y-1.5">
                        <p><span className="text-slate-400">Address:</span> {selectedRequest.deliveryAddress || "N/A"}</p>
                        <p><span className="text-slate-400">Expected range:</span> {selectedRequest.startDate} to {selectedRequest.endDate}</p>
                        {selectedRequest.specialInstructions && (
                          <p><span className="text-slate-400">Special Notes:</span> {selectedRequest.specialInstructions}</p>
                        )}
                      </div>
                    </div>

                    {/* ── Procurement Traceability Chain ── */}
                    <div className="space-y-2 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3">
                      <h4 className="font-black text-[10px] text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                        <Layers size={12} /> Procurement Chain
                      </h4>
                      <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg">{selectedRequest.id}</span>
                        <ChevronRight size={10} className="text-slate-400" />
                        {selectedRequest.rfqNumber ? (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg">{selectedRequest.rfqNumber}</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg italic">RFQ Pending</span>
                        )}
                        <ChevronRight size={10} className="text-slate-400" />
                        {selectedRequest.vendorQuotationNumber ? (
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg">{selectedRequest.vendorQuotationNumber}</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg italic">No Quotation</span>
                        )}
                        <ChevronRight size={10} className="text-slate-400" />
                        {selectedRequest.approvedVendorName ? (
                          <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-lg">{selectedRequest.approvedVendorName}</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg italic">Vendor TBD</span>
                        )}
                        <ChevronRight size={10} className="text-slate-400" />
                        {selectedRequest.poNumber ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg font-black">{selectedRequest.poNumber}</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg italic">PO Pending</span>
                        )}
                      </div>
                      {selectedRequest.procurementStage && (
                        <p className="text-[9px] text-indigo-600 font-black uppercase tracking-wider mt-1">
                          Current Stage: {selectedRequest.procurementStage}
                        </p>
                      )}
                    </div>

                    {/* ── Vendor Quotations Table ── */}
                    {selectedRequest.vendorQuotations && selectedRequest.vendorQuotations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-black text-xs text-slate-800 border-b pb-1.5 flex gap-1.5 items-center">
                          <Users size={13} className="text-indigo-600" />
                          <span>Vendor Quotations</span>
                          <span className="ml-auto bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                            {selectedRequest.vendorQuotations.length} Vendors
                          </span>
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full text-[10px] border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                                <th className="px-2 py-2 text-left">Vendor</th>
                                <th className="px-2 py-2 text-right">Amount</th>
                                <th className="px-2 py-2 text-center">Date</th>
                                <th className="px-2 py-2 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {selectedRequest.vendorQuotations.map((vq, idx) => {
                                const isApproved = vq.selectionStatus === "Selected";
                                return (
                                  <tr
                                    key={idx}
                                    className={`transition ${
                                      isApproved
                                        ? "bg-emerald-50 border-l-2 border-l-emerald-500"
                                        : vq.selectionStatus === "Rejected"
                                        ? "bg-rose-50/30 opacity-60"
                                        : "bg-white"
                                    }`}
                                  >
                                    <td className="px-2 py-2">
                                      <div className="flex items-center gap-1">
                                        {isApproved && <Award size={10} className="text-emerald-600 shrink-0" />}
                                        <span className={`font-bold truncate max-w-[80px] ${
                                          isApproved ? "text-emerald-800" : "text-slate-700"
                                        }`}>{vq.vendorName}</span>
                                      </div>
                                    </td>
                                    <td className={`px-2 py-2 text-right font-black ${
                                      isApproved ? "text-emerald-700" : "text-slate-600"
                                    }`}>
                                      {currencySymbol}{vq.quotationAmount.toLocaleString()}
                                    </td>
                                    <td className="px-2 py-2 text-center text-slate-400 font-semibold">
                                      {vq.quotationDate || "—"}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                      <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black border ${
                                        isApproved
                                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                          : vq.selectionStatus === "Rejected"
                                          ? "bg-rose-100 text-rose-650 border-rose-200"
                                          : "bg-amber-50 text-amber-600 border-amber-200"
                                      }`}>
                                        {isApproved ? "✓ Selected" : vq.selectionStatus === "Rejected" ? "Rejected" : "Pending"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Approved Vendor Summary */}
                        {selectedRequest.approvedVendorName && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-1.5">
                            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                              <Award size={11} /> Approved Vendor
                            </p>
                            <div className="text-[11px] font-semibold space-y-1">
                              <div className="flex justify-between">
                                <span className="text-emerald-600">Vendor:</span>
                                <span className="font-black text-emerald-800">{selectedRequest.approvedVendorName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-emerald-600">Amount:</span>
                                <span className="font-black text-emerald-800">{currencySymbol}{selectedRequest.approvedVendorAmount?.toLocaleString()}</span>
                              </div>
                              {selectedRequest.approvedVendorDate && (
                                <div className="flex justify-between">
                                  <span className="text-emerald-650">Approval Date:</span>
                                  <span className="font-black text-emerald-800">{formatDate(selectedRequest.approvedVendorDate, settings.dateFormat)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Linked PO Number Banner */}
                    {selectedRequest.poNumber && (
                      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Linked Purchase Order</p>
                          <p className="text-base font-black text-violet-750 mt-0.5">{selectedRequest.poNumber}</p>
                        </div>
                        <button
                          onClick={() => navigate("/po")}
                          className="bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition"
                        >
                          View PO
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer Actions (STICKY AT BOTTOM) */}
                  <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-2.5 sticky bottom-0 z-10">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApprovalModalPr(selectedRequest)}
                        disabled={selectedRequest.status.startsWith("Approved")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:pointer-events-none text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1 transition shadow-md shadow-emerald-50 cursor-pointer"
                      >
                        <Check size={14} className="stroke-[2.5]" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateRequestFields(selectedRequest, { status: "Rejected" })}
                        disabled={selectedRequest.status === "Rejected"}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 disabled:pointer-events-none text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1 transition shadow-md shadow-rose-50 cursor-pointer"
                      >
                        <X size={14} className="stroke-[2.5]" />
                        Reject
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrint(selectedRequest)}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 bg-white text-slate-600 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Printer size={12} />
                        Print PR
                      </button>
                      <button
                        onClick={() => handleDownload(selectedRequest)}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 bg-white text-slate-655 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Download size={12} />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center max-w-xl mx-auto my-12 shadow-sm animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border shadow-inner">
            <FileText size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">No Purchase Requests Found</h3>
          <p className="text-slate-500 text-xs font-semibold mt-2 max-w-sm leading-relaxed">
            Create a new request to begin. Real-time requests will appear here automatically.
          </p>
        </div>
      )}
      {approvalModalPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden scale-in animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Workflow Step</p>
                <h3 className="text-white font-black text-base">Is Delivery Required?</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-700 font-semibold text-sm">
                For request <span className="font-black text-indigo-600">{getFriendlyPrId(approvalModalPr)}</span>, please specify if physical delivery tracking is required:
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-slate-600 font-semibold">
                <p><strong className="text-indigo-700 font-bold">Yes</strong>: Enables delivery tracking order, shifts request to Delivery Management.</p>
                <p><strong className="text-slate-700 font-bold">No</strong>: Workflow ends, status becomes "Approved - No Delivery Required".</p>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  onClick={() => setApprovalModalPr(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateRequestFields(approvalModalPr, {
                      status: "Approved - No Delivery Required",
                      deliveryRequired: "No",
                      deliveryStatus: "—"
                    });
                    toast.success("Request approved (No delivery required).");
                    setApprovalModalPr(null);
                  }}
                  className="px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  No, Delivery Not Required
                </button>
                <button
                  onClick={() => {
                    handleUpdateRequestFields(approvalModalPr, {
                      status: "Approved",
                      deliveryRequired: "Yes",
                      deliveryStatus: "Pending Delivery"
                    });
                    toast.success("Request approved (Delivery required).");
                    setApprovalModalPr(null);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-indigo-100 flex items-center gap-1.5"
                >
                  <Check size={12} />
                  Yes, Delivery Required
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
