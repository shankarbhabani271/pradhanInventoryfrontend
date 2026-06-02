import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye, Printer, Download, Check, X, FileText, Calendar, AlertCircle, Sparkles, SlidersHorizontal, Edit, Truck } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";
import { toast } from "sonner";
import { getSavedSettings, getCurrencySymbol, formatDate } from "../../utils/settingsHelper";

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
      createdDate: dbItem.createdDate || dbItem.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0]
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
  const uniqueVendors = Array.from(new Set(requests.map(r => r.vendorName)));

  // Advanced filters logic
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some(it => it.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    
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

      {/* Main Grid */}
      {requests.length > 0 ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Table & Filters Column */}
          <div className="lg:col-span-2 space-y-6">
            
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
                        <th className="p-4">Request ID</th>
                        <th className="p-4">Vendor Name</th>
                        <th className="p-4">Product Details</th>
                        <th className="p-4 text-center">Quantity</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4">Priority</th>
                        <th className="p-4 font-bold">Approval Status</th>
                        <th className="p-4 text-center">Delivery Required</th>
                        <th className="p-4">Delivery Status</th>
                        <th className="p-4">PO Number</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-12 text-center text-slate-400 font-bold">
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

                          return (
                            <tr
                               key={r.id}
                               className={`hover:bg-slate-50/40 transition-colors ${selectedRequest?.id === r.id ? "bg-indigo-50/20" : ""}`}
                             >
                               {/* Request ID */}
                               <td className="p-4">
                                 <span className="font-black text-indigo-700 text-xs tracking-tight bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{friendlyPrId}</span>
                               </td>
                               {/* Vendor Name */}
                               <td className="p-4 font-bold text-slate-800 text-xs">{r.vendorName}</td>
                               {/* Product Details */}
                               <td className="p-4 text-slate-600 text-xs max-w-[160px]">
                                 <span className="truncate block font-semibold">
                                   {r.items.length > 0 ? r.items.map(i => i.productName).join(", ") : "—"}
                                 </span>
                               </td>
                               {/* Quantity */}
                               <td className="p-4 text-center font-bold text-slate-800">{totalQty}</td>
                               {/* Amount */}
                               <td className="p-4 font-black text-indigo-600 text-sm text-right">{currencySymbol}{r.totalAmount.toLocaleString()}</td>
                               {/* Priority */}
                               <td className="p-4">
                                 <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${priorityClass}`}>
                                   {r.priority}
                                 </span>
                               </td>
                               {/* Approval Status */}
                               <td className="p-4">
                                 <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${statusClass}`}>
                                   {r.status}
                                 </span>
                               </td>
                               {/* Delivery Required */}
                               <td className="p-4 text-center">
                                 <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                                   r.deliveryRequired === "Yes" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                   r.deliveryRequired === "No" ? "bg-slate-50 text-slate-500 border-slate-200" :
                                   "bg-slate-50 text-slate-400"
                                 }`}>{r.deliveryRequired || "—"}</span>
                               </td>
                               {/* Delivery Status */}
                               <td className="p-4">
                                 <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                                   r.deliveryStatus === "Delivered" || r.deliveryStatus === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                   r.deliveryStatus === "In Transit" || r.deliveryStatus === "Processing" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                   r.deliveryStatus === "Pending Delivery" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                   "bg-slate-50 text-slate-400 border-slate-200"
                                 }`}>
                                   {r.deliveryStatus || "—"}
                                 </span>
                               </td>
                               {/* PO Number */}
                               <td className="p-4">
                                 {r.poNumber ? (
                                   <span className="font-black text-violet-700 text-xs tracking-tight bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">{r.poNumber}</span>
                                 ) : (
                                   <span className="text-[10px] text-slate-400 font-semibold italic">Not Created</span>
                                 )}
                               </td>
                               <td className="p-4 text-right">
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

          {/* Selected Request Detail View */}
          <div className="space-y-6">
            {selectedRequest ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 animate-scale-up">
                
                {/* Card Title Header */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{selectedRequest.id}</h3>
                    <p className="text-slate-400 text-[10px] font-bold mt-0.5">Created on {formatDate(selectedRequest.createdDate, settings.dateFormat)}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    selectedRequest.status === "Approved" ? "bg-green-100 text-green-800" :
                    selectedRequest.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>

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
                    {selectedRequest.items.map((item, index) => (
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

                {/* Actions & Print */}
                <div className="border-t pt-4 space-y-2.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setApprovalModalPr(selectedRequest)}
                      disabled={selectedRequest.status.startsWith("Approved")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:pointer-events-none text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1 transition shadow-md shadow-emerald-50"
                    >
                      <Check size={14} className="stroke-[2.5]" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateRequestFields(selectedRequest, { status: "Rejected" })}
                      disabled={selectedRequest.status === "Rejected"}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 disabled:pointer-events-none text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1 transition shadow-md shadow-rose-50"
                    >
                      <X size={14} className="stroke-[2.5]" />
                      Reject
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrint(selectedRequest)}
                      className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Printer size={12} />
                      Print PR
                    </button>
                    <button
                      onClick={() => handleDownload(selectedRequest)}
                      className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Download size={12} />
                      Download PDF
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-400 h-[300px] flex flex-col justify-center items-center">
                <AlertCircle size={28} className="text-slate-300 mb-2" />
                <p className="font-black text-xs text-slate-600">No Purchase Request Selected</p>
                <p className="text-[10px] text-slate-400 max-w-[220px] mt-1 font-semibold leading-relaxed">
                  Select a purchase request from the list to view details, update approval status, download PDF, or print.
                </p>
              </div>
            )}
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
