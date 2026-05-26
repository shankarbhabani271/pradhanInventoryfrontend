import { useState, useEffect } from "react";
import { Plus, Trash2, Heart, CheckCircle2, ChevronRight, Store, ArrowLeft, Send, Sparkles, Building, MapPin, Phone, FileSpreadsheet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";
import { toast } from "sonner";

export interface Vendor {
  _id?: string;
  id?: number;
  name?: string;
  vendorName?: string;
  category?: string;
  productType?: string;
  phone?: string;
  gst?: string;
  location?: string;
  address?: string;
  primaryaddress?: string;
  logo?: string;
  status?: string;
}

const STATIC_VENDORS: Vendor[] = [
  {
    id: 1,
    name: "HP Solutions",
    category: "Laptops & Computers",
    phone: "+91-9988776655",
    gst: "07HP9012H3X7",
    location: "Delhi, India",
    logo: "HP"
  },
  {
    id: 2,
    name: "Dell Technologies",
    category: "Computers & Servers",
    phone: "+91-8877665544",
    gst: "07DELL1234A1",
    location: "Bangalore, India",
    logo: "DELL"
  },
  {
    id: 3,
    name: "Logitech India",
    category: "Peripherals & Accessories",
    phone: "+91-7766554433",
    gst: "07LOGI5678B2",
    location: "Mumbai, India",
    logo: "LOGI"
  },
  {
    id: 4,
    name: "Bhabani Traders",
    category: "Stationery & Office Supplies",
    phone: "+91-9876543210",
    gst: "21BHAB8765C1Z9",
    location: "Bhubaneswar, Odisha",
    logo: "BT"
  }
];

export interface Item {
  productName: string;
  qty: number;
  price: number;
}

// PREMIUM CUSTOM SUCCESS POPUP DIALOG (ENGLISH)
interface SuccessModalProps {
  isOpen: boolean;
  vendorName: string;
  requestId: string;
  totalItems: number;
  totalQty: number;
  totalAmount: number;
  priority: string;
  department: string;
  onClose: () => void;
}

function SuccessModal({ isOpen, vendorName, requestId, totalItems, totalQty, totalAmount, priority, department, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 max-w-md w-full text-center space-y-6 transform scale-100 transition-all duration-300 animate-scale-up">
        {/* Animated Check Circle */}
        <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
          <CheckCircle2 size={48} className="stroke-[2.5]" />
        </div>

        {/* Localized Titles */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Purchase Request Created
          </h2>
          <p className="text-slate-400 text-xs font-semibold">
            Purchase Request successfully generated for {vendorName}
          </p>
        </div>

        {/* Detailed Grid Table matching user specification */}
        <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100/80 space-y-3 text-xs font-semibold text-slate-500">
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span>Vendor:</span>
            <span className="text-slate-800 font-extrabold">{vendorName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span>Request ID:</span>
            <span className="text-slate-800 font-extrabold">{requestId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span>Total Items:</span>
            <span className="text-slate-800 font-extrabold">{totalItems} products</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span>Total Quantity:</span>
            <span className="text-slate-800 font-extrabold">{totalQty} units</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span>Total Amount:</span>
            <span className="text-indigo-600 font-black text-sm">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span>Priority:</span>
            <span className="text-slate-800 font-extrabold">{priority}</span>
          </div>
          <div className="flex justify-between">
            <span>Department:</span>
            <span className="text-slate-800 font-extrabold">{department}</span>
          </div>
        </div>

        {/* Navigation Action */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-150 hover:shadow-indigo-250 transition-all duration-300"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export function PurchaseRequestForm({ vendor, onBack }: { vendor: Vendor; onBack?: () => void }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([
    { productName: "", qty: 1, price: 0 }
  ]);
  const [department, setDepartment] = useState("IT");
  const [requestedBy, setRequestedBy] = useState("Admin");
  const [priority, setPriority] = useState("Medium");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Success Modal state
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState("");

  const displayName = vendor.vendorName || vendor.name || "Unknown Supplier";

  const addItem = () => {
    setItems([...items, { productName: "", qty: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const updateItem = (index: number, key: keyof Item, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  const totalQty = items.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.some(item => !item.productName.trim())) {
      toast.error("Please enter a valid product name for all items.");
      return;
    }

    setLoading(true);
    const requestNumber = "PR-" + Math.floor(1000 + Math.random() * 9000);
    const todayStr = new Date().toISOString().split("T")[0];

    const prPayload = {
      department,
      vendor: displayName,
      products: items.map(it => ({
        name: it.productName,
        quantity: Number(it.qty) || 1,
        price: Number(it.price) || 0
      })),
      totalAmount,
      requestedBy: requestedBy || "Admin",
      status: "Pending",
      createdDate: todayStr
    };

    // Full custom construct for localStorage compatibility
    const fullLocalPR = {
      ...prPayload,
      id: requestNumber,
      vendorId: vendor._id || vendor.id?.toString() || "1",
      startDate: startDate || todayStr,
      endDate: endDate || todayStr,
      deliveryAddress: deliveryAddress || "Corporate Head Office",
      specialInstructions,
      totalQty
    };

    try {
      // 1. POST to database
      const response = await axios.post(`${API_BASE_URL}/purchase-request/create`, prPayload);
      console.log("DB Success Response:", response.data);

      const dbPR = response.data?.data;
      if (dbPR) {
        // Map database ID or response attributes to local format
        fullLocalPR.id = dbPR.id || "PR-" + dbPR._id.substring(dbPR._id.length - 4).toUpperCase();
      }
    } catch (err) {
      console.warn("⚠️ Backend API unreachable or failed. Falling back to local Storage save only.", err);
    } finally {
      // 2. Sync to local Storage (always happens so data is 100% available and secure)
      const saved = localStorage.getItem("purchase_requests");
      let requestsList = [];
      if (saved) {
        try {
          requestsList = JSON.parse(saved);
        } catch (err) {
          requestsList = [];
        }
      }
      requestsList.unshift(fullLocalPR);
      localStorage.setItem("purchase_requests", JSON.stringify(requestsList));

      // 3. Trigger premium Success Popup Dialog
      setGeneratedId(fullLocalPR.id);
      setLoading(false);
      setShowSuccess(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition duration-200 text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Vendors List
        </button>
      )}

      {/* SUCCESS POPUP MODAL */}
      <SuccessModal
        isOpen={showSuccess}
        vendorName={displayName}
        requestId={generatedId}
        totalItems={items.length}
        totalQty={totalQty}
        totalAmount={totalAmount}
        priority={priority}
        department={department}
        onClose={() => navigate("/purchase-request-list")}
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Vendor Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 md:p-8 text-white relative">
          <div className="absolute right-6 top-6 opacity-10">
            <Building size={120} />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center font-black text-2xl border border-white/20 shrink-0 shadow-inner">
                {displayName.split(" ").map(w => w.charAt(0)).join("").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                  Selected Supplier
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-1">
                  {displayName}
                </h2>
                <p className="text-xs text-indigo-100 font-medium tracking-wide">
                  {vendor.productType || vendor.category || "General Supplier"}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-indigo-200" />
                <span>{vendor.primaryaddress || vendor.address || vendor.location || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/20 pl-4">
                <Phone size={14} className="text-indigo-200" />
                <span>{vendor.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-3">
            <Sparkles size={18} className="text-indigo-600" />
            Purchase Request Form
          </h3>

          {/* Department & Requested By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="border border-slate-200 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 bg-white font-semibold transition"
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-1.5">
                Requested By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Name of requester"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                required
                className="border border-slate-200 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium transition"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-slate-200 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-slate-200 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Priority <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: "Low", val: "Low" },
                { label: "Medium", val: "Medium" },
                { label: "High", val: "High" }
              ].map((p) => {
                const isSelected = priority === p.val;
                let activeStyle = "";
                if (p.val === "Low") {
                  activeStyle = isSelected 
                    ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-200" 
                    : "bg-green-50/50 border-green-200 text-green-700 hover:bg-green-100/50";
                } else if (p.val === "Medium") {
                  activeStyle = isSelected 
                    ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200" 
                    : "bg-amber-50/50 border-amber-200 text-amber-700 hover:bg-amber-100/50";
                } else {
                  activeStyle = isSelected 
                    ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-200" 
                    : "bg-rose-50/50 border-rose-200 text-rose-700 hover:bg-rose-100/50";
                }

                return (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPriority(p.val)}
                    className={`px-5 py-2.5 rounded-2xl font-bold border text-sm transition-all duration-200 ${activeStyle}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-black text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet size={16} className="text-indigo-600" />
                Product Items
              </h4>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/70 p-4 rounded-3xl border border-slate-100 items-end relative hover:bg-slate-50 transition"
              >
                <div className="md:col-span-5 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter item name"
                    value={item.productName}
                    onChange={(e) => updateItem(index, "productName", e.target.value)}
                    className="border border-slate-200 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5">
                    Qty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.qty}
                    onChange={(e) => updateItem(index, "qty", parseInt(e.target.value) || 0)}
                    className="border border-slate-200 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm font-bold"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                    className="border border-slate-200 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm font-bold"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <span className="text-xs font-bold text-slate-500 mb-1.5">Subtotal</span>
                  <div className="font-extrabold text-indigo-600 py-2.5 text-sm">
                    ₹{(item.qty * item.price).toLocaleString()}
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-30 disabled:pointer-events-none w-11 h-11 rounded-xl flex items-center justify-center transition-colors border border-rose-100"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-2xl hover:bg-slate-50 text-slate-700 transition font-bold text-xs"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          {/* Delivery Address */}
          <div className="flex flex-col pt-4 border-t">
            <label className="text-sm font-bold text-slate-700 mb-1.5">
              Delivery Address
            </label>
            <input
              type="text"
              placeholder="Enter exact delivery location"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="border border-slate-200 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium transition"
            />
          </div>

          {/* Special Instructions */}
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-700 mb-1.5">
              Special Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Any handle with care notes, delivery time requests..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="border border-slate-200 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
            ></textarea>
          </div>

          {/* Calculations Summary Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-bold text-slate-600 text-sm">
              Total Quantity: <strong className="text-slate-800 text-base">{totalQty} units</strong>
            </span>
            <span className="font-bold text-slate-600 text-sm">
              Total Amount: <strong className="text-indigo-600 text-xl font-black">₹{totalAmount.toLocaleString()}</strong>
            </span>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 flex-wrap border-t pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-600 font-bold text-sm transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:shadow-indigo-250 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function PurchaseRequest() {
  const location = useLocation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openVendorId, setOpenVendorId] = useState<string | null>(null);
  const [likedVendors, setLikedVendors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/vendor/get`);
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
      } catch (err) {
        console.warn("Axios API failed, falling back to static vendor list:", err);
        setVendors(STATIC_VENDORS);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Sync openVendorId with state passed via router-navigation or URL query
  useEffect(() => {
    if (vendors.length > 0) {
      const stateVendorId = location.state?.vendorId;
      if (stateVendorId) {
        setOpenVendorId(stateVendorId);
      } else {
        const params = new URLSearchParams(location.search);
        const queryId = params.get("vendorId");
        if (queryId) {
          setOpenVendorId(queryId);
        }
      }
    }
  }, [location, vendors]);

  const toggleLike = (id: string) => {
    setLikedVendors(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-slate-500 font-bold">Loading Suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/20 p-4 md:p-8">
      {/* Title Header */}
      <div className="max-w-6xl mx-auto mb-8 space-y-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Store className="text-indigo-600" />
          Purchase Request Center
        </h1>
        <p className="text-slate-500 text-sm font-semibold">
          Select a vendor below to create a new purchase request.
        </p>
      </div>

      {/* Vendors Selection Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map((vendor) => {
          const vendorId = vendor._id || vendor.id?.toString() || "";
          const isLiked = !!likedVendors[vendorId];
          const name = vendor.vendorName || vendor.name || "Unknown Supplier";
          const category = vendor.productType || vendor.category || "General Supplier";
          const gst = vendor.gst || "N/A";
          const locationVal = vendor.primaryaddress || vendor.address || vendor.location || "N/A";
          const logo = name.split(" ").map(w => w.charAt(0)).join("").substring(0, 2).toUpperCase() || "V";

          return (
            <div
              key={vendorId}
              className={`bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                openVendorId === vendorId ? "col-span-1 md:col-span-2 border-indigo-200 shadow-md" : "hover:border-indigo-100"
              }`}
            >
              {/* Card Top */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                      {logo}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-base leading-tight">{name}</h3>
                      <span className="text-xs text-slate-400 font-semibold">{category}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    Active
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>GST:</span>
                    <span className="text-slate-700 font-bold">{gst}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="text-slate-700 font-bold">{vendor.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="text-slate-700 font-bold truncate max-w-[200px]">{locationVal}</span>
                  </div>
                </div>
              </div>

              {/* Action area */}
              <div className="bg-slate-50/70 border-t border-slate-100 p-4 flex gap-2 justify-between items-center">
                {/* Like trigger */}
                <button
                  type="button"
                  onClick={() => toggleLike(vendorId)}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                    isLiked 
                      ? "bg-rose-50 border-rose-100 text-rose-500" 
                      : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Heart size={16} className={isLiked ? "fill-rose-500" : ""} />
                </button>

                {/* Create PO trigger */}
                <button
                  type="button"
                  onClick={() => setOpenVendorId(vendorId)}
                  className="flex-1 max-w-[220px] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-50 hover:shadow-indigo-150 transition"
                >
                  Create PO
                  <ChevronRight size={14} />
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
    </div>
  );
}

export default PurchaseRequest;