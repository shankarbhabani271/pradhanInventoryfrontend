import { useState, useEffect } from "react";
import { Search, Filter, Eye, Printer, Download, Check, X, FileText, Calendar, AlertCircle } from "lucide-react";

interface PurchaseRequestItem {
  id: string; // PR-1001 etc.
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
  status: "Pending" | "Approved" | "Rejected";
  createdDate: string;
}

// Initial mock requests if localStorage is empty
const INITIAL_REQUESTS: PurchaseRequestItem[] = [
  {
    id: "PR-1001",
    vendorId: "1",
    vendorName: "HP Solutions",
    startDate: "2026-05-26",
    endDate: "2026-06-05",
    department: "IT",
    requestedBy: "Amit Sharma",
    priority: "High",
    items: [{ productName: "HP ProBook", qty: 5, price: 65000 }],
    deliveryAddress: "Okhla Phase 3, Delhi",
    specialInstructions: "Handle with care",
    totalQty: 5,
    totalAmount: 325000,
    status: "Pending",
    createdDate: "2026-05-25"
  },
  {
    id: "PR-1002",
    vendorId: "2",
    vendorName: "Dell Technologies",
    startDate: "2026-05-28",
    endDate: "2026-06-10",
    department: "Finance",
    requestedBy: "Neha Gupta",
    priority: "Medium",
    items: [{ productName: "Dell Monitor 24", qty: 10, price: 12000 }],
    deliveryAddress: "Whitefield, Bangalore",
    specialInstructions: "Deliver during office hours",
    totalQty: 10,
    totalAmount: 120000,
    status: "Approved",
    createdDate: "2026-05-24"
  },
  {
    id: "PR-1003",
    vendorId: "3",
    vendorName: "Logitech India",
    startDate: "2026-06-01",
    endDate: "2026-06-05",
    department: "HR",
    requestedBy: "Sanjay Kumar",
    priority: "Low",
    items: [{ productName: "Logitech Wireless Mouse", qty: 25, price: 1200 }],
    deliveryAddress: "Andheri East, Mumbai",
    specialInstructions: "",
    totalQty: 25,
    totalAmount: 30000,
    status: "Pending",
    createdDate: "2026-05-23"
  }
];

export default function PurchaseRequestList() {
  const [requests, setRequests] = useState<PurchaseRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequestItem | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("purchase_requests");
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (err) {
        setRequests(INITIAL_REQUESTS);
      }
    } else {
      localStorage.setItem("purchase_requests", JSON.stringify(INITIAL_REQUESTS));
      setRequests(INITIAL_REQUESTS);
    }
  }, []);

  const saveToStorage = (updatedList: PurchaseRequestItem[]) => {
    localStorage.setItem("purchase_requests", JSON.stringify(updatedList));
    setRequests(updatedList);
  };

  const handleUpdateStatus = (id: string, newStatus: "Approved" | "Rejected") => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveToStorage(updated);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const handlePrint = (request: PurchaseRequestItem) => {
    const printContent = `
      <html>
        <head>
          <title>Purchase Order ${request.id}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background-color: #f9fafb; }
            .total { text-align: right; font-weight: bold; font-size: 1.2em; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Purchase Order - ${request.id}</h1>
          <div class="meta">
            <div>
              <h3>Vendor Details:</h3>
              <strong>${request.vendorName}</strong><br>
              Delivery Address: ${request.deliveryAddress || "N/A"}
            </div>
            <div>
              <h3>Order Details:</h3>
              Date Created: ${request.createdDate}<br>
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
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${request.items.map(item => `
                <tr>
                  <td>${item.productName || "General Item"}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.qty * item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total Amount: ₹${request.totalAmount}</div>
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
    alert(`📥 PDF format for ${request.id} prepared for download!`);
  };

  // Get unique vendors list for filtering
  const uniqueVendors = Array.from(new Set(requests.map(r => r.vendorName)));

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || r.priority === priorityFilter;
    const matchesVendor = vendorFilter === "All" || r.vendorName === vendorFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesVendor;
  });

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 md:p-8">
      {/* Top Welcome Section */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Purchase Requests List
          </h1>
          <p className="text-slate-500 mt-1">
            Review, filter, approve, and download generated purchase requisitions.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table & Filters Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <Filter size={18} className="text-indigo-600" />
              <span>Filter Requests</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search PR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-800 bg-white"
                />
              </div>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-800 bg-white"
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
                className="border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-800 bg-white"
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
                className="border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-800 bg-white"
              >
                <option value="All">All Vendors</option>
                {uniqueVendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List Table Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-xs">
                    <th className="p-4">Request ID</th>
                    <th className="p-4">Vendor Name</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No purchase requests found matching the search/filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(r => {
                      let priorityClass = "";
                      if (r.priority === "High") priorityClass = "bg-red-50 text-red-700 border-red-100";
                      else if (r.priority === "Medium") priorityClass = "bg-yellow-50 text-yellow-700 border-yellow-100";
                      else priorityClass = "bg-green-50 text-green-700 border-green-100";

                      let statusClass = "";
                      if (r.status === "Approved") statusClass = "bg-green-100 text-green-800";
                      else if (r.status === "Rejected") statusClass = "bg-rose-100 text-rose-800";
                      else statusClass = "bg-amber-100 text-amber-800";

                      return (
                        <tr 
                          key={r.id} 
                          className={`hover:bg-slate-50/50 transition-colors ${selectedRequest?.id === r.id ? "bg-indigo-50/30" : ""}`}
                        >
                          <td className="p-4 font-semibold text-slate-800">{r.id}</td>
                          <td className="p-4">{r.vendorName}</td>
                          <td className="p-4 font-bold text-slate-900">₹{r.totalAmount.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityClass}`}>
                              {r.priority}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusClass}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedRequest(r)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white transition shadow-sm"
                            >
                              <Eye size={12} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Request Detail View */}
        <div className="space-y-6">
          {selectedRequest ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              
              {/* Card Title Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">{selectedRequest.id}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Created on {selectedRequest.createdDate}</p>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  selectedRequest.status === "Approved" ? "bg-green-100 text-green-800" :
                  selectedRequest.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {selectedRequest.status}
                </span>
              </div>

              {/* Meta information */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-semibold">Vendor:</span>
                  <span className="font-bold text-slate-800">{selectedRequest.vendorName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-semibold">Requested By:</span>
                  <span className="text-slate-800 font-medium">{selectedRequest.requestedBy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-semibold">Department:</span>
                  <span className="text-slate-800 font-medium">{selectedRequest.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-semibold">Priority:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    selectedRequest.priority === "High" ? "bg-red-50 border-red-100 text-red-700" :
                    selectedRequest.priority === "Medium" ? "bg-yellow-50 border-yellow-100 text-yellow-700" : "bg-green-50 border-green-100 text-green-700"
                  }`}>
                    {selectedRequest.priority}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-800 border-b pb-1.5 flex gap-1 items-center">
                  <FileText size={14} className="text-indigo-600" />
                  <span>Items Ordered</span>
                </h4>
                <div className="bg-slate-50 rounded-xl p-3 divide-y divide-slate-100 text-xs">
                  {selectedRequest.items.map((item, index) => (
                    <div key={index} className="py-2 first:pt-0 last:pb-0 flex justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-800">{item.productName || "General Item"}</p>
                        <p className="text-slate-400 mt-0.5">Qty: {item.qty} × ₹{item.price}</p>
                      </div>
                      <span className="font-bold text-indigo-600">₹{item.qty * item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery info */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-800 border-b pb-1.5 flex gap-1 items-center">
                  <Calendar size={14} className="text-indigo-600" />
                  <span>Delivery Details</span>
                </h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-semibold">Delivery Address:</span> {selectedRequest.deliveryAddress || "N/A"}</p>
                  <p><span className="font-semibold">Expected Date Range:</span> {selectedRequest.startDate} to {selectedRequest.endDate}</p>
                  {selectedRequest.specialInstructions && (
                    <p><span className="font-semibold">Special Instructions:</span> {selectedRequest.specialInstructions}</p>
                  )}
                </div>
              </div>

              {/* Actions & Print */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, "Approved")}
                    disabled={selectedRequest.status === "Approved"}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, "Rejected")}
                    disabled={selectedRequest.status === "Rejected"}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrint(selectedRequest)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Printer size={14} />
                    Print PR
                  </button>
                  <button
                    onClick={() => handleDownload(selectedRequest)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 h-[300px] flex flex-col justify-center items-center">
              <AlertCircle size={28} className="text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No Purchase Request Selected</p>
              <p className="text-xs text-slate-400 max-w-[200px] mt-1">Select a request from the table to view details and perform actions.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
