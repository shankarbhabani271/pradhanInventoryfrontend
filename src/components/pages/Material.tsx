import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RotateCcw,
  Send,
  ChevronDown,
  Check,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/http";

interface InventoryItem {
  _id: string;
  itemName: string;
  stockQuantity: number;
  category: string;
  status: string;
}

const DEPARTMENTS = [
  "Admin",
  "HR",
  "Inventory",
  "Finance",
  "Procurement",
  "IT"
];

interface PriorityOption {
  name: string;
  dotColor: string;
  activeBorder: string;
  activeBg: string;
  activeText: string;
}

const PRIORITIES: PriorityOption[] = [
  { name: "Low",    dotColor: "bg-green-500",  activeBorder: "border-green-500",  activeBg: "bg-green-50/50",  activeText: "text-green-700" },
  { name: "Medium", dotColor: "bg-[#E6A23C]",  activeBorder: "border-[#E6A23C]",  activeBg: "bg-[#FDF6EC]",     activeText: "text-[#E6A23C]" },
  { name: "High",   dotColor: "bg-orange-500", activeBorder: "border-orange-500", activeBg: "bg-orange-50/50", activeText: "text-orange-700" },
  { name: "Urgent", dotColor: "bg-red-500",    activeBorder: "border-red-500",    activeBg: "bg-red-50/50",    activeText: "text-red-700" }
];

export default function MaterialForm() {
  const navigate = useNavigate();
  
  // ── States ──
  const [formData, setFormData] = useState({
    referenceId: "",
    date: "",
    requester: "",
    username: "",
    department: "Procurement", // default matching screenshot
    quantity: "3", // default matching screenshot
    productDetails: "",
    priority: "Medium" // default matching screenshot
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  
  const [loading, setLoading] = useState({ submit: false, refId: false });

  const productDropdownRef = useRef<HTMLDivElement>(null);
  
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);

  // ── Auto-generate Reference ID ──
  const fetchNextReferenceId = async () => {
    setLoading(prev => ({ ...prev, refId: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/material`);
      const json = await res.json();
      const data = json.data || [];
      
      let maxSerial = 0;
      data.forEach((item: any) => {
        if (item.referenceId && item.referenceId.startsWith("MR-2026-")) {
          const part = item.referenceId.replace("MR-2026-", "");
          const num = parseInt(part, 10);
          // Ignore massive timestamps/outliers like 221233414 (limit valid serials to < 100000)
          if (!isNaN(num) && num > maxSerial && num < 100000) {
            maxSerial = num;
          }
        }
      });
      
      const nextSerial = maxSerial > 0 ? maxSerial + 1 : 1;
      const padded = String(nextSerial).padStart(3, "0");
      setFormData(prev => ({
        ...prev,
        referenceId: `MR-2026-${padded}`
      }));
    } catch (err) {
      console.error("Failed to generate reference ID:", err);
      setFormData(prev => ({ ...prev, referenceId: "MR-2026-001" }));
    } finally {
      setLoading(prev => ({ ...prev, refId: false }));
    }
  };

  // ── Setup Date and Requester/Username on mount ──
  useEffect(() => {
    fetchNextReferenceId();
    
    // Set date (YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    // Retrieve user session data
    const userStr = localStorage.getItem("user");
    let loggedUser = "Bhabani Shankar Pradhan";
    let loggedUsername = "admin";
    
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.name) loggedUser = parsed.name;
        if (parsed.username) loggedUsername = parsed.username;
      } catch (e) {
        // ignore and use fallback
      }
    }
    
    const loggedDept = localStorage.getItem("department") || "Procurement";

    setFormData(prev => ({
      ...prev,
      date: formattedDate,
      requester: loggedUser,
      username: loggedUsername,
      department: DEPARTMENTS.includes(loggedDept) ? loggedDept : "Procurement"
    }));

    // Fetch live inventory
    const fetchInventory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/inventory/get`);
        const json = await res.json();
        setInventoryItems(json || []);
      } catch (err) {
        console.error("Failed to load inventory:", err);
      }
    };
    fetchInventory();
  }, []);

  // ── Close dropdowns on outside click ──
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Cleanup typing timeout on unmount ──
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // ── Date Formatter matching screen: "29 May 2026" ──
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // ── Search & Filters ──
  const filteredProducts = inventoryItems.filter(item => 
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectProduct = (item: InventoryItem) => {
    setSelectedProduct(item);
    setFormData(prev => ({ ...prev, productDetails: item.itemName }));
    setSearchQuery(item.itemName);
    setShowProductDropdown(false);
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setSearchQuery("");
    setShowProductDropdown(false);
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const userStr = localStorage.getItem("user");
    let loggedUser = "Bhabani Shankar Pradhan";
    let loggedUsername = "admin";
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.name) loggedUser = parsed.name;
        if (parsed.username) loggedUsername = parsed.username;
      } catch (e) {
        // ignore
      }
    }

    setFormData({
      referenceId: formData.referenceId, // preserve reference ID
      date: formattedDate,
      requester: loggedUser,
      username: loggedUsername,
      department: "Procurement",
      quantity: "3",
      productDetails: "",
      priority: "Medium"
    });

    toast.info("Form reset successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productDetails.trim()) {
      return toast.error("Please enter a product name.");
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      return toast.error("Please enter a valid quantity greater than 0.");
    }
    if (!formData.department) {
      return toast.error("Please select an operating department.");
    }

    setLoading(prev => ({ ...prev, submit: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceId: formData.referenceId,
          date: formData.date,
          requester: formData.requester,
          department: formData.department,
          productDetails: formData.productDetails,
          quantity: Number(formData.quantity),
          priority: formData.priority,
          status: "Pending"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Submission failed");
      }

      toast.success(`Request ${formData.referenceId} submitted to Pending Approval!`);
      navigate("/material-request");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to submit request.");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const isOutOfStockWarning = 
    !isTyping &&
    selectedProduct && 
    formData.quantity !== "" && 
    Number(formData.quantity) > selectedProduct.stockQuantity;


  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex items-center justify-center font-sans antialiased text-slate-800">
      <div className="w-full max-w-3xl bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Navy blue header matching screenshot exactly */}
        <div className="bg-[#1D6092] px-6 py-4 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📄</span>
            <h2 className="text-lg font-bold tracking-wide">Material Request Form</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold tracking-wide">
              {formData.referenceId || "MR-2026-001"}
            </span>
            <button 
              type="button" 
              className="text-white/80 hover:text-white text-lg font-bold px-1 transition"
              title="Form Menu Options"
            >
              •••
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Metadata Card - Light Beige/Slate Grid */}
          <div className="bg-[#FAF9F6] border border-[#EAEAEA] rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              
              {/* Reference ID Column */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Reference ID
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-blue-500 font-extrabold text-sm">#</span>
                  <span className="font-bold text-slate-850 text-sm">
                    {formData.referenceId || "MR-2026-001"}
                  </span>
                </div>
              </div>

              {/* Request Date Column */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Request Date
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm">📅</span>
                  <span className="font-bold text-slate-850 text-sm">
                    {formatDisplayDate(formData.date) || "29 May 2026"}
                  </span>
                </div>
              </div>

              {/* Requester Column */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Requester
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm">👤</span>
                  <span className="font-bold text-slate-850 text-sm">
                    {formData.requester || "Bhabani Shankar Pradhan"}
                  </span>
                </div>
              </div>

              {/* Username Column */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Username
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[#1D6092] font-semibold text-sm">@</span>
                  <span className="font-bold text-slate-850 text-sm">
                    {formData.username || "admin"}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Department & Quantity Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Department field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>🏢</span> Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none transition"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quantity field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="font-bold">#</span> Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  const clean = val.replace(/[^0-9]/g, "");
                  setFormData(prev => ({ ...prev, quantity: clean }));
                }}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                min="1"
              />
            </div>

          </div>

          {/* Product Details - Searchable Input with dropdown */}
          <div className="flex flex-col gap-1.5" ref={productDropdownRef}>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>📦</span> Product Details <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search product name..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setShowProductDropdown(true);
                  setFormData(prev => ({ ...prev, productDetails: val }));
                  if (selectedProduct && val !== selectedProduct.itemName) {
                    setSelectedProduct(null);
                  }

                  // Handle typing state for search completion debounce
                  setIsTyping(true);
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                  }, 500);
                }}
                onFocus={() => setShowProductDropdown(true)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {/* Dynamic searchable matching dropdown list */}
              {showProductDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-25 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                  {filteredProducts.map(item => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectProduct(item)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg hover:bg-slate-50 text-left transition ${selectedProduct?._id === item._id ? "bg-blue-50/50" : ""}`}
                    >
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.itemName}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{item.category || "General Item"}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.stockQuantity <= 0 
                            ? "bg-red-50 border-red-200 text-red-700" 
                            : item.stockQuantity < 10 
                            ? "bg-amber-50 border-amber-200 text-amber-700" 
                            : "bg-blue-50 border-blue-200 text-blue-700"
                        }`}>
                          {item.stockQuantity} in stock
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Display Selected Product stock validation */}
            {selectedProduct && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-650 mt-1">
                <span className="font-bold text-[#1D6092]">i</span>
                <span>
                  <strong>{selectedProduct.itemName}</strong> currently has <strong className="text-slate-850">{selectedProduct.stockQuantity} items</strong> available in stock.
                </span>
              </div>
            )}
            
            {/* Warning card for deficit requests */}
            {isOutOfStockWarning && (
              <div className="flex items-start gap-2.5 p-3 bg-orange-50 border border-orange-200 rounded-lg mt-1 text-orange-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Quantity Exceeds Stock</p>
                  <p className="mt-0.5 text-orange-700">
                    Warning: You are requesting more units than available stock ({selectedProduct.stockQuantity}). 
                    This request will trigger a <strong>Procurement Required</strong> state during approvals.
                  </p>
                </div>
              </div>
            )}


          </div>

          {/* Priority custom grid buttons */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>🚩</span> Priority <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PRIORITIES.map(opt => {
                const isActive = formData.priority === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: opt.name }))}
                    className={`flex flex-col items-center justify-center py-2.5 border rounded-lg transition-all text-xs font-semibold ${
                      isActive 
                        ? `${opt.activeBorder} ${opt.activeBg} ${opt.activeText} shadow-inner`
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor} mb-1.5`} />
                    {opt.name}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200 mt-2" />

          {/* Bottom Actions Row - Reset and Submit side-by-side on the right */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading.submit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-slate-350 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset
            </button>
            <button
              type="submit"
              disabled={loading.submit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-slate-350 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              Submit Request
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}