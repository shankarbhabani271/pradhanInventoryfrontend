import { useState, useEffect } from "react";
import { Plus, Trash2, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

interface Vendor {
  _id?: string;
  id?: number;
  name?: string;
  vendorName?: string;
  category?: string;
  productType?: string;
  phone: string;
  gst?: string;
  location?: string;
  address?: string;
  primaryaddress?: string;
  logo?: string;
}

// Fallback static list in case API is empty or offline
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

interface Item {
  productName: string;
  qty: number;
  price: number;
}

function PurchaseRequestForm({ vendor }: { vendor: Vendor }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([
    { productName: "", qty: 1, price: 0 }
  ]);
  const [department, setDepartment] = useState("IT");
  const [requestedBy, setRequestedBy] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const displayName = vendor.vendorName || vendor.name || "Unknown Supplier";

  const addItem = () => {
    setItems([...items, { productName: "", qty: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestNumber = "PR-" + Math.floor(1000 + Math.random() * 9000);
    const todayStr = new Date().toISOString().split("T")[0];

    // Constructing the complete structured output from the form inputs
    const newRequest = {
      id: requestNumber,
      vendorId: vendor._id || vendor.id?.toString() || "1",
      vendorName: displayName,
      startDate,
      endDate,
      department,
      requestedBy: requestedBy || "Authorized Representative",
      priority,
      items,
      deliveryAddress: deliveryAddress || "Corporate Head Office",
      specialInstructions,
      totalQty,
      totalAmount,
      status: "Pending" as const,
      createdDate: todayStr
    };

    console.log("====== Purchase Request Submitting ======");
    console.log("Output Payload (Input Data):", newRequest);
    console.log("========================================");

    // Save to localStorage
    const saved = localStorage.getItem("purchase_requests");
    let requestsList = [];
    if (saved) {
      try {
        requestsList = JSON.parse(saved);
      } catch (err) {
        requestsList = [];
      }
    }
    requestsList.unshift(newRequest);
    localStorage.setItem("purchase_requests", JSON.stringify(requestsList));

    // Show Success Popup exactly as required by the user
    alert(
      `🎉 Purchase Request Successfully Created\n\n` +
      `Vendor:\n${displayName}\n\n` +
      `Request Details:\n` +
      `• Total Items: ${items.length}\n` +
      `• Total Quantity: ${totalQty}\n` +
      `• Total Amount: ₹${totalAmount.toLocaleString()}\n` +
      `• Priority: ${priority}\n` +
      `• Department: ${department}\n\n` +
      `Click OK to continue to Purchase Request List Page.`
    );

    // Redirect to Purchase Request List Page
    navigate("/purchase-request-list");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6 border border-gray-100/80 transition-all duration-300">
      <h3 className="text-xl font-bold mb-6 text-slate-800">
        Create Purchase Request: {displayName}
      </h3>

      {/* Dates */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Department & Requested By */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1">Department</label>
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
            className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 bg-white"
          >
            <option value="">Select Department</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1">Requested By</label>
          <input
            type="text"
            placeholder="Requested By"
            value={requestedBy}
            onChange={(e) => setRequestedBy(e.target.value)}
            className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Priority */}
      <div className="mb-6">
        <p className="font-semibold mb-3 text-slate-700">Priority</p>
        <div className="flex gap-4 flex-wrap">
          {["Low", "Medium", "High"].map((p) => {
            const isSelected = priority === p;
            let btnClass = "";
            if (p === "Low") {
              btnClass = isSelected 
                ? "bg-green-600 text-white shadow-md shadow-green-150" 
                : "bg-green-50 text-green-700 hover:bg-green-100";
            } else if (p === "Medium") {
              btnClass = isSelected 
                ? "bg-yellow-500 text-white shadow-md shadow-yellow-150" 
                : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100";
            } else {
              btnClass = isSelected 
                ? "bg-red-600 text-white shadow-md shadow-red-150" 
                : "bg-red-50 text-red-700 hover:bg-red-100";
            }
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${btnClass}`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-slate-800">
          Product Items
        </h4>

        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 items-end"
          >
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">Product Name</label>
              <input
                type="text"
                placeholder="Product Name"
                value={item.productName}
                onChange={(e) => updateItem(index, "productName", e.target.value)}
                className="border p-2.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">Qty</label>
              <input
                type="number"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(index, "qty", parseInt(e.target.value) || 0)}
                className="border p-2.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">Price</label>
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                className="border p-2.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">Subtotal</label>
              <div className="flex items-center font-bold text-indigo-600 p-2 text-base">
                ₹{item.qty * item.price}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="bg-red-50 text-red-600 hover:bg-red-100 w-12 h-11 rounded-lg flex items-center justify-center transition-colors self-end md:self-auto border border-red-100"
              title="Remove Item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-black transition-all font-medium text-sm"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Delivery */}
      <div className="mb-4 flex flex-col">
        <label className="text-sm font-medium text-slate-600 mb-1">Delivery Address</label>
        <input
          type="text"
          placeholder="Delivery Address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
        />
      </div>

      <div className="mb-6 flex flex-col">
        <label className="text-sm font-medium text-slate-600 mb-1">Special Instructions</label>
        <textarea
          rows={3}
          placeholder="Special Instructions"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
        ></textarea>
      </div>

      {/* Summary */}
      <div className="bg-indigo-50/50 border border-indigo-100/50 p-5 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="font-semibold text-indigo-900">
          Total Quantity: {totalQty}
        </h3>

        <h3 className="font-bold text-indigo-700 text-lg">
          Total Amount: ₹{totalAmount}
        </h3>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 flex-wrap border-t pt-4">
        <button 
          type="button"
          onClick={() => {
            setItems([{ productName: "", qty: 1, price: 0 }]);
            setDepartment("IT");
            setRequestedBy("");
            setPriority("Medium");
            setDeliveryAddress("");
            setSpecialInstructions("");
            setStartDate("");
            setEndDate("");
          }}
          className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium text-sm"
        >
          Reset Form
        </button>

        <button 
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-100 hover:shadow-indigo-200 font-medium text-sm"
        >
          Send Request
        </button>
      </div>
    </form>
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
        const res = await axios.get("http://localhost:8080/api/vendor/get");
        console.log("Axios API response inside PurchaseRequest page:", res.data);
        
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
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-slate-500 mt-4 font-medium">Loading registered vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 md:p-8">
      {/* Top Welcome Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Purchase Request Center
        </h1>
        <p className="text-slate-500 mt-1">
          Create and manage purchase orders individually for registered suppliers.
        </p>
      </div>

      {/* Vendor Sections List */}
      <div className="space-y-6">
        {vendors.map((vendor) => {
          const vendorId = vendor._id || vendor.id?.toString() || "";
          const isPOOpen = openVendorId === vendorId;
          const isLiked = !!likedVendors[vendorId];

          const name = vendor.vendorName || vendor.name || "Unknown Supplier";
          const category = vendor.productType || vendor.category || "General Supplier";
          const gst = vendor.gst || "N/A";
          const locationVal = vendor.primaryaddress || vendor.address || vendor.location || "N/A";
          const logo = name.charAt(0).toUpperCase();

          return (
            <div 
              key={vendorId} 
              className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden mb-8 border border-slate-100 hover:shadow-md transition-all duration-300"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 text-white">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                      {logo}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold tracking-tight">
                        {name}
                      </h2>
                      <p className="text-sm text-blue-100">
                        {category}
                      </p>
                    </div>
                  </div>

                  <span className="bg-green-500/20 text-green-200 border border-green-500/30 px-4 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    Active Vendor
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Phone</p>
                  <h3 className="font-semibold text-slate-800 mt-1">{vendor.phone}</h3>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">GST Number</p>
                  <h3 className="font-semibold text-slate-800 mt-1">{gst}</h3>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Location</p>
                  <h3 className="font-semibold text-slate-800 mt-1">{locationVal}</h3>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-100 p-4 flex gap-4 justify-between bg-slate-50/50 items-center flex-wrap">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => toggleLike(vendorId)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                    isLiked 
                      ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" 
                      : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900"
                  }`}
                >
                  <Heart size={18} className={isLiked ? "fill-rose-500 stroke-rose-500" : ""} />
                  {isLiked ? "Liked" : "Like"}
                </button>

                {/* Create PO Button */}
                <button
                  type="button"
                  onClick={() => setOpenVendorId(isPOOpen ? null : vendorId)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-300 ${
                    isPOOpen 
                      ? "bg-slate-800 hover:bg-slate-900 text-white shadow-slate-100" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-md"
                  }`}
                >
                  <Plus size={18} className={isPOOpen ? "rotate-45 transition-transform duration-300 animate-pulse" : "transition-transform duration-300"} />
                  {isPOOpen ? "Close PO" : "Create PO"}
                </button>
              </div>

              {/* PO Form Drawer / Section */}
              {isPOOpen && (
                <div className="border-t border-slate-100 bg-slate-50/30 p-5 transition-all duration-500 ease-in-out">
                  <PurchaseRequestForm vendor={vendor} />
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