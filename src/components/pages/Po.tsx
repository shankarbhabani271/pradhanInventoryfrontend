import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";
import {
  Search,
  Plus,
  Check,
  X,
  Send,
  Eye,
  Printer,
  Download,
  ShoppingCart,
  Clock,
  ClipboardCheck,
  AlertCircle,
  Filter,
  Sparkles,
  Trash2,
  MapPin,
  Phone,
  Mail,
  FileSpreadsheet,
  Layers,
  Award,
  ChevronDown,
  Building,
  Calendar,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { getSavedSettings, getCurrencySymbol, formatDate } from "../../utils/settingsHelper";

// ── TYPES & INTERFACES ──
export interface POItem {
  id: string; // PO-2026-XXX
  rfqId: string;
  quotationId: string;
  vendorName: string;
  vendorContact: string;
  vendorAddress: string;
  productName: string; // backwards compatibility
  quantity: number; // backwards compatibility
  unitPrice: number; // backwards compatibility
  items?: {
    productName: string;
    quantity: number;
    unitPrice: number;
    taxPercent: number;
    subtotal: number;
  }[];
  taxPercent: number; // e.g. 18
  discountPercent: number; // e.g. 5
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  grandTotal: number;
  expectedDeliveryDate: string;
  paymentTerms: string;
  currency: string;
  status: "Draft" | "Pending Approval" | "Approved" | "Sent to Vendor" | "Closed";
  createdBy: string;
  approvedBy: string;
  createdDate: string;
  materialRequestRef?: string;
  termsAndConditions?: string;
  // ── Procurement Traceability ──
  prNumber?: string;            // PR-2026-XXX
  rfqNumber?: string;           // RFQ-2026-XXX
  vendorQuotationNumber?: string; // QT-2026-XXX
  procurementOfficer?: string;
  approvalDate?: string;
  poCreationDate?: string;
  procurementStage?: string;
  procurementStatus?: string;   // Overall workflow status
}

export interface Vendor {
  _id?: string;
  id?: number;
  name?: string;
  vendorName?: string;
  category?: string;
  productType?: string;
  phone?: string;
  email?: string;
  gst?: string;
  location?: string;
  address?: string;
  primaryaddress?: string;
  contactPerson?: string;
}

const STATIC_VENDORS: Vendor[] = [
  { name: "HP Solutions", category: "Laptops & Computers", contactPerson: "Alok Gupta", email: "alok@hpsolutions.com", phone: "+91-9988776655", gst: "07HP9012H3X7", address: "Okhla Phase 3, Delhi, India" },
  { name: "Dell Technologies", category: "Computers & Servers", contactPerson: "Rajesh Kumar", email: "rajesh@dell.com", phone: "+91-8877665544", gst: "07DELL1234A1", address: "Whitefield, Bangalore, India" },
  { name: "Logitech India", category: "Peripherals & Accessories", contactPerson: "Sanjay Kumar", email: "sanjay@logitech.in", phone: "+91-7766554433", gst: "07LOGI5678B2", address: "Andheri East, Mumbai, India" },
  { name: "Bhabani Traders", category: "Stationery & Office Supplies", contactPerson: "Bhabani Patra", email: "bhabani@traders.com", phone: "+91-9876543210", gst: "21BHAB8765C1Z9", address: "Nayapalli, Bhubaneswar, Odisha" }
];

export default function Po() {
  const location = useLocation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSavedSettings());
  const currencySymbol = getCurrencySymbol(settings.currency);

  const [pos, setPos] = useState<POItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selection states
  const [selectedPo, setSelectedPo] = useState<POItem | null>(null);
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);
  const [workflowDetails, setWorkflowDetails] = useState<any>(null);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);

  // Manual PO Creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [termsAndConditions, setTermsAndConditions] = useState("1. Delivery within expected schedule.\n2. Invoices will be settled Net 30 days after GRN validation.\n3. Goods must match specification sheet.");
  const [poItemsList, setPoItemsList] = useState<{ productName: string; quantity: number; unitPrice: number; taxPercent: number }[]>([
    { productName: "", quantity: 1, unitPrice: 0, taxPercent: 18 }
  ]);

  // Load POs & Vendors
  useEffect(() => {
    // 1. POs
    const cachedPos = localStorage.getItem("invenpro_pos");
    if (cachedPos) {
      try {
        setPos(JSON.parse(cachedPos));
      } catch { }
    } else {
      setPos([]);
    }

    // 2. Vendors
    const fetchVendors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/vendor/get`);
        const loadedVendors = Array.isArray(res.data) ? res.data : (res.data?.vendors || []);
        if (loadedVendors.length > 0) {
          const merged = [...STATIC_VENDORS];
          loadedVendors.forEach((v: any) => {
            const exists = merged.some(m => (m.name || m.vendorName || "").toLowerCase() === (v.name || v.vendorName || "").toLowerCase());
            if (!exists) merged.push(v);
          });
          setVendors(merged);
        } else {
          setVendors(STATIC_VENDORS);
        }
      } catch (err) {
        setVendors(STATIC_VENDORS);
      }
    };
    fetchVendors();

    // Check if PO was requested in route state
    if (location.state?.poId) {
      const target = JSON.parse(cachedPos || "[]").find((p: any) => p.id === location.state.poId);
      if (target) setSelectedPo(target);
    }
  }, [location.state]);

  // Fetch workflow details when a PO with materialRequestRef is selected
  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!selectedPo?.materialRequestRef && !selectedPo?.rfqNumber && !selectedPo?.prNumber) {
        setWorkflowDetails(null);
        return;
      }
      setLoadingWorkflow(true);
      try {
        // Try fetching traceability by materialRequestRef if available
        if (selectedPo.materialRequestRef) {
          const res = await axios.get(`${API_BASE_URL}/procurement/traceability/${selectedPo.materialRequestRef}`);
          if (res.data?.success) {
            setWorkflowDetails(res.data.data);
            return;
          }
        }
      } catch {
        // Fallback: use data already stored on the PO object
      } finally {
        setLoadingWorkflow(false);
      }
      setWorkflowDetails(null);
    };
    fetchWorkflow();
  }, [selectedPo]);

  const addAuditLog = (action: string) => {
    const role = localStorage.getItem("role") || "admin";
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const name = user?.name || "System";

    const freshLogs = JSON.parse(localStorage.getItem("invenpro_audit_logs") || "[]");
    const newLog = {
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      action,
      user: name,
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role
    };
    localStorage.setItem("invenpro_audit_logs", JSON.stringify([newLog, ...freshLogs]));
  };

  // Generate Unique PO ID
  const getNextPoId = (): string => {
    const year = new Date().getFullYear();
    const key = `invenpro_po_counter_${year}`;
    const current = parseInt(localStorage.getItem(key) || "0") + 1;
    localStorage.setItem(key, String(current));
    return `PO-${year}-${String(current).padStart(3, "0")}`;
  };

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorName) {
      toast.error("Please select a vendor.");
      return;
    }
    if (poItemsList.some(item => !item.productName.trim())) {
      toast.error("Product name cannot be empty.");
      return;
    }

    setLoading(true);

    const vendor = vendors.find(v => (v.name || v.vendorName) === selectedVendorName);
    const subtotal = poItemsList.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = poItemsList.reduce((sum, item) => sum + Math.round((item.quantity * item.unitPrice) * (item.taxPercent / 100)), 0);
    const discountAmount = Math.round(subtotal * 0.05); // Standard 5% selection discount
    const shippingCost = 3500;
    const grandTotal = subtotal + taxAmount - discountAmount + shippingCost;

    const poId = getNextPoId();
    const today = new Date().toISOString().split("T")[0];

    const newPo: POItem = {
      id: poId,
      rfqId: "N/A",
      quotationId: "N/A",
      vendorName: selectedVendorName,
      vendorContact: vendor?.phone || "+91-9876543210",
      vendorAddress: vendor?.address || vendor?.primaryaddress || "Vendor Facility, India",
      productName: poItemsList[0].productName, // compatibility
      quantity: poItemsList.reduce((sum, item) => sum + item.quantity, 0), // compatibility
      unitPrice: poItemsList[0].unitPrice, // compatibility
      items: poItemsList.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxPercent: item.taxPercent,
        subtotal: item.quantity * item.unitPrice
      })),
      taxPercent: poItemsList[0].taxPercent,
      discountPercent: 5,
      subtotal,
      taxAmount,
      discountAmount,
      shippingCost,
      grandTotal,
      expectedDeliveryDate: expectedDelivery || today,
      paymentTerms,
      currency: "INR (₹)",
      status: "Draft",
      createdBy: "Bhabani",
      approvedBy: "",
      createdDate: today,
      termsAndConditions
    };

    const updated = [newPo, ...pos];
    localStorage.setItem("invenpro_pos", JSON.stringify(updated));
    setPos(updated);

    addAuditLog(`Purchase Order ${poId} generated manually in Draft status for vendor ${selectedVendorName}.`);
    toast.success(`Purchase Order ${poId} created successfully in Draft status! 🛒`);

    // Reset Form
    setSelectedVendorName("");
    setExpectedDelivery("");
    setPaymentTerms("Net 30");
    setTermsAndConditions("1. Delivery within expected schedule.\n2. Invoices will be settled Net 30 days after GRN validation.\n3. Goods must match specification sheet.");
    setPoItemsList([{ productName: "", quantity: 1, unitPrice: 0, taxPercent: 18 }]);
    setShowCreateModal(false);
    setLoading(false);
  };

  const handleUpdateStatus = (poId: string, newStatus: POItem["status"]) => {
    const role = localStorage.getItem("role") || "admin";
    if (newStatus === "Approved" && role !== "admin" && role !== "manager") {
      toast.error("Access Denied: Only Managers/Admins can approve Purchase Orders!");
      return;
    }

    const updated = pos.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          status: newStatus,
          approvedBy: newStatus === "Approved" ? "Procurement Head" : p.approvedBy
        };
      }
      return p;
    });

    localStorage.setItem("invenpro_pos", JSON.stringify(updated));
    setPos(updated);
    addAuditLog(`Purchase Order ${poId} status updated to ${newStatus}.`);

    if (selectedPo && selectedPo.id === poId) {
      setSelectedPo({ ...selectedPo, status: newStatus, approvedBy: newStatus === "Approved" ? "Procurement Head" : selectedPo.approvedBy });
    }

    toast.success(`Purchase Order ${poId} is now ${newStatus}!`);
  };

  const handleDeletePo = (poId: string) => {
    if (!window.confirm("Are you sure you want to delete this Purchase Order?")) return;

    const updated = pos.filter(p => p.id !== poId);
    localStorage.setItem("invenpro_pos", JSON.stringify(updated));
    setPos(updated);
    addAuditLog(`Purchase Order ${poId} deleted.`);
    setSelectedPo(null);
    toast.success(`Purchase Order ${poId} deleted successfully.`);
  };

  // Add Item Line
  const addPoItemLine = () => {
    setPoItemsList([...poItemsList, { productName: "", quantity: 1, unitPrice: 0, taxPercent: 18 }]);
  };

  // Remove Item Line
  const removePoItemLine = (index: number) => {
    if (poItemsList.length === 1) return;
    setPoItemsList(poItemsList.filter((_, i) => i !== index));
  };

  // Update Item Line
  const updatePoItemLine = (index: number, field: string, value: any) => {
    const updated = [...poItemsList];
    updated[index] = { ...updated[index], [field]: value };
    setPoItemsList(updated);
  };

  // Calculations
  const calculatedSubtotal = poItemsList.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculatedTax = poItemsList.reduce((sum, item) => sum + Math.round((item.quantity * item.unitPrice) * (item.taxPercent / 100)), 0);
  const calculatedDiscount = Math.round(calculatedSubtotal * 0.05);
  const calculatedTotal = calculatedSubtotal + calculatedTax - calculatedDiscount + 3500;

  // Filtered POs
  const filteredPos = pos.filter(p => {
    const matchSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // KPI calculations
  const totalSpend = pos
    .filter(p => p.status !== "Closed" && p.status !== "Draft")
    .reduce((sum, p) => sum + (p.grandTotal || 0), 0);
  const activeCount = pos.filter(p => p.status === "Approved" || p.status === "Sent to Vendor").length;
  const pendingCount = pos.filter(p => p.status === "Pending Approval").length;
  const completedCount = pos.filter(p => p.status === "Closed").length;

  // Invoicing/Print PO
  const handlePrintPo = (poItem: POItem) => {
    const logoSrc = buildLogoUrlForPrint();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popups blocked! Please allow popups for printing PO.");
      return;
    }

    const itemsList = poItem.items || [
      { productName: poItem.productName, quantity: poItem.quantity, unitPrice: poItem.unitPrice, taxPercent: poItem.taxPercent, subtotal: poItem.subtotal }
    ];

    const itemsHtml = itemsList.map((item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 500; color: #1e293b;">${idx + 1}</td>
        <td style="padding: 12px; color: #334155;">${item.productName}</td>
        <td style="padding: 12px; text-align: center; color: #334155;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #334155;">${currencySymbol}${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 12px; text-align: center; color: #334155;">${item.taxPercent}%</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #4f46e5;">${currencySymbol}${item.subtotal.toLocaleString()}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Order ${poItem.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;850&display=swap');
            body { font-family: 'Outfit', sans-serif; margin: 40px; color: #1e293b; background: white; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0284c5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 800; color: #0284c5; }
            .title { font-size: 24px; font-weight: 800; color: #0f172a; text-align: right; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 35px; }
            .col { flex: 1; }
            .col-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 5px; letter-spacing: 0.05em; }
            .col-value { font-size: 14px; font-weight: 600; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
            th { background-color: #f8fafc; padding: 12px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .total-section { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .total-box { border-top: 2px solid #e2e8f0; padding-top: 15px; display: grid; grid-template-columns: 140px 100px; gap: 10px; text-align: right; font-size: 13px; font-weight: 600; }
            .total-title { color: #64748b; }
            .total-val { color: #0f172a; }
            .grand-total { border-top: 2px solid #0284c5; padding-top: 10px; font-size: 16px; font-weight: 850; color: #0284c5; }
            .footer { border-top: 1px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: 60px; }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              ${logoSrc ? `<img src="${logoSrc}" style="max-height: 45px; max-width: 140px; object-fit: contain; margin-bottom: 8px;" />` : `<div class="logo">Wilyfox Bill Maker</div>`}
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Procurement & Supplier Center</div>
            </div>
            <div style="text-align: right;">
              <div class="title">PURCHASE ORDER</div>
              <p style="font-size: 13px; font-weight: 600; color: #64748b; margin: 4px 0 0 0;">ID: ${poItem.id}</p>
            </div>
          </div>

          <div style="display: flex; gap: 40px; margin-bottom: 30px;">
            <div class="col">
              <div class="col-title">Supplier / Vendor</div>
              <div class="col-value">${poItem.vendorName}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">${poItem.vendorAddress}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">Contact: ${poItem.vendorContact}</div>
            </div>
            <div class="col" style="text-align: right;">
              <div class="col-title">Order Details</div>
              <div class="col-value">Status: ${poItem.status}</div>
              <div style="font-size: 13px; color: #475569; margin-top: 4px;">Date Released: ${formatDate(poItem.createdDate, settings.dateFormat)}</div>
              <div style="font-size: 13px; color: #475569;">Delivery Expected: ${formatDate(poItem.expectedDeliveryDate, settings.dateFormat)}</div>
              <div style="font-size: 13px; color: #475569;">Payment Conditions: ${poItem.paymentTerms}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Item Details</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 120px;">Rate</th>
                <th style="text-align: center; width: 80px;">Tax</th>
                <th style="text-align: right; width: 140px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-title">Subtotal:</div>
              <div class="total-val">${currencySymbol}${poItem.subtotal.toLocaleString()}</div>
              <div class="total-title">Tax Amount:</div>
              <div class="total-val">+${currencySymbol}${poItem.taxAmount.toLocaleString()}</div>
              <div class="total-title">Special Discount:</div>
              <div class="total-val">-${currencySymbol}${poItem.discountAmount.toLocaleString()}</div>
              <div class="total-title">Shipping / Freight:</div>
              <div class="total-val">+${currencySymbol}${poItem.shippingCost.toLocaleString()}</div>
              <div class="total-title grand-total">Grand Total:</div>
              <div class="total-val grand-total">${currencySymbol}${poItem.grandTotal.toLocaleString()}</div>
            </div>
          </div>

          ${poItem.termsAndConditions ? `
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 40px;">
              <div class="col-title" style="margin-bottom: 6px;">Terms & Conditions</div>
              <div style="font-size: 12px; color: #334155; line-height: 1.5; white-space: pre-line;">${poItem.termsAndConditions}</div>
            </div>
          ` : ""}

          <div style="display: flex; justify-content: space-between; margin-top: 80px;">
            <div style="text-align: center; width: 200px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 12px; font-weight: 600; color: #475569;">
              Prepared By
            </div>
            <div style="text-align: center; width: 200px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 12px; font-weight: 600; color: #475569;">
              Procurement Head Approval
            </div>
          </div>

          <div class="footer">
            <span>Corporate Procurement System</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
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

  const buildLogoUrlForPrint = (): string => {
    if (settings.logoUrl) {
      return `${API_BASE_URL}${settings.logoUrl}?v=${settings.logoVersion || 0}`;
    }
    return "";
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50/20 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800/80 p-6 shadow-sm">
          <div>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
              Procurement Flow
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 mt-1.5">
              <ShoppingCart className="text-indigo-600" />
              Purchase Order Console
            </h1>
            <p className="text-slate-500 text-sm font-semibold mt-0.5">
              Manage, track, approve, and finalize corporate procurement contracts.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus size={16} />
            Create Purchase Order
          </button>
        </div>

        {/* KPI metrics cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Outlay Limit", value: `${currencySymbol}${totalSpend.toLocaleString()}`, desc: "Active released orders total", icon: DollarSign, bg: "bg-blue-50 text-blue-700 border-blue-100" },
            { title: "Active Released POs", value: activeCount, desc: "Awaiting supplier fulfillment", icon: ShoppingCart, bg: "bg-indigo-50 text-indigo-700 border-indigo-100" },
            { title: "Pending Approval", value: pendingCount, desc: "Awaiting manager signature", icon: Clock, bg: "bg-amber-50 text-amber-700 border-amber-100" },
            { title: "Completed Orders", value: completedCount, desc: "Fully stocked & closed", icon: ClipboardCheck, bg: "bg-emerald-50 text-emerald-700 border-emerald-100" }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.title}</span>
                  <div className={`p-2.5 rounded-xl ${card.bg}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-800 tracking-tight">{card.value}</div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter and Table Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main list area */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filters panel */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                  <Filter size={14} className="text-indigo-600" />
                  Filters & Search
                </span>
                <button
                  onClick={() => { setSearchQuery(""); setStatusFilter("All"); }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition"
                >
                  Reset
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search PO code, vendor or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 pl-10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 p-2.5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Sent to Vendor">Sent to Vendor</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* PO List Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider">
                      <th className="p-4">PO Number</th>
                      <th className="p-4">PR Number</th>
                      <th className="p-4">RFQ Number</th>
                      <th className="p-4">Vendor Name</th>
                      <th className="p-4">Grand Total</th>
                      <th className="p-4 text-center">Procurement Status</th>
                      <th className="p-4 text-center">PO Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                    {filteredPos.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400 font-bold">
                          No Purchase Orders found. Click "Create Purchase Order" to generate one.
                        </td>
                      </tr>
                    ) : (
                      filteredPos.map(p => {
                        const isSelected = selectedPo?.id === p.id;
                        let statusClass = "";
                        if (p.status === "Closed") {
                          // Show Closed as completed
                          statusClass = "bg-slate-100 text-slate-500 border border-slate-200";
                        } else if (p.status === "Sent to Vendor") {
                          statusClass = "bg-blue-50 text-blue-700 border border-blue-200";
                        } else if (p.status === "Approved") {
                          statusClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                        } else if (p.status === "Pending Approval") {
                          statusClass = "bg-amber-50 text-amber-700 border border-amber-200";
                        } else {
                          statusClass = "bg-slate-50 text-slate-600 border border-slate-200";
                        }

                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-slate-50/40 transition cursor-pointer ${isSelected ? "bg-indigo-50/20" : ""}`}
                            onClick={() => setSelectedPo(p)}
                          >
                            <td className="p-4 font-black text-indigo-700 tracking-tight">{p.id}</td>
                            {/* PR Number */}
                            <td className="p-4">
                              {p.prNumber ? (
                                <span className="font-black text-violet-700 text-[10px] bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">{p.prNumber}</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">—</span>
                              )}
                            </td>
                            {/* RFQ Number */}
                            <td className="p-4">
                              {p.rfqNumber || p.rfqId !== "N/A" ? (
                                <span className="font-black text-blue-700 text-[10px] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{p.rfqNumber || p.rfqId}</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">—</span>
                              )}
                            </td>
                            <td className="p-4 font-bold text-slate-800">{p.vendorName}</td>
                            <td className="p-4 font-extrabold text-indigo-600">{currencySymbol}{p.grandTotal.toLocaleString()}</td>
                            {/* Procurement Status */}
                            <td className="p-4 text-center">
                              {p.procurementStage ? (
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">{p.procurementStage}</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Manual</span>
                              )}
                            </td>
                            {/* PO Status */}
                            <td className="p-4 text-center">
                              {p.status === "Closed" ? (
                                <span className="px-2 py-0.5 rounded-xl text-[10px] font-black border bg-rose-50 text-rose-600 border-rose-200">
                                  Closed
                                </span>
                              ) : (
                                <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-black ${statusClass}`}>
                                  {p.status}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex gap-2 justify-end items-center">
                                <button
                                  onClick={() => setSelectedPo(p)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 bg-white transition text-[10px] font-bold shadow-sm"
                                >
                                  <Eye size={12} className="inline mr-1" /> View
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenActionDropdownId(openActionDropdownId === p.id ? null : p.id)}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold transition text-xs"
                                  >
                                    ⋮
                                  </button>
                                  {openActionDropdownId === p.id && (
                                    <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 divide-y divide-slate-100 text-left">
                                      <button
                                        onClick={() => { handlePrintPo(p); setOpenActionDropdownId(null); }}
                                        className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                      >
                                        <Printer size={12} /> Print PO
                                      </button>
                                      {p.status === "Draft" && (
                                        <>
                                          <button
                                            onClick={() => { handleUpdateStatus(p.id, "Pending Approval"); setOpenActionDropdownId(null); }}
                                            className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2"
                                          >
                                            <Send size={12} /> Submit Approval
                                          </button>
                                          <button
                                            onClick={() => { handleDeletePo(p.id); setOpenActionDropdownId(null); }}
                                            className="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-2"
                                          >
                                            <Trash2 size={12} /> Delete PO
                                          </button>
                                        </>
                                      )}
                                      {p.status === "Pending Approval" && (
                                        <>
                                          <button
                                            onClick={() => { handleUpdateStatus(p.id, "Approved"); setOpenActionDropdownId(null); }}
                                            className="w-full px-4 py-2 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2"
                                          >
                                            <Check size={12} /> Approve PO
                                          </button>
                                          <button
                                            onClick={() => { handleUpdateStatus(p.id, "Draft"); setOpenActionDropdownId(null); }}
                                            className="w-full px-4 py-2 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2"
                                          >
                                            <X size={12} /> Reject to Draft
                                          </button>
                                        </>
                                      )}
                                      {p.status === "Approved" && (
                                        <button
                                          onClick={() => { handleUpdateStatus(p.id, "Sent to Vendor"); setOpenActionDropdownId(null); }}
                                          className="w-full px-4 py-2 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-2"
                                        >
                                          <Send size={12} /> Release to Vendor
                                        </button>
                                      )}
                                      {p.status === "Sent to Vendor" && (
                                        <button
                                          onClick={() => { handleUpdateStatus(p.id, "Closed"); setOpenActionDropdownId(null); }}
                                          className="w-full px-4 py-2 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2"
                                        >
                                          <CheckCircle2 size={12} /> Mark Completed
                                        </button>
                                      )}
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
            </div>

          </div>

          {/* PO Sidebar Detail Panel */}
          <div className="lg:col-span-1">
            {selectedPo ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 animate-scale-up">
                
                {/* Panel Header */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{selectedPo.id}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Created on {formatDate(selectedPo.createdDate, settings.dateFormat)}</p>
                  </div>
                  {selectedPo.status === "Closed" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200">
                      Closed
                    </span>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      selectedPo.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                      selectedPo.status === "Sent to Vendor" ? "bg-blue-100 text-blue-800" :
                      selectedPo.status === "Pending Approval" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                    }`}>
                      {selectedPo.status}
                    </span>
                  )}
                </div>

                {/* Navigation Chain / Document Traceability */}
                <div className="space-y-2 border-b pb-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Procurement Chain Traceability</span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <span
                      className="text-indigo-600 hover:underline cursor-pointer"
                      onClick={() => navigate("/purchase-request-list")}
                    >
                      {selectedPo.prNumber || "PR"}
                    </span>
                    <span>➔</span>
                    <span
                      className="text-indigo-600 hover:underline cursor-pointer"
                      onClick={() => navigate("/procurement")}
                    >
                      {selectedPo.rfqNumber || selectedPo.rfqId || "RFQ"}
                    </span>
                    <span>➔</span>
                    <span className="text-slate-500">{selectedPo.vendorQuotationNumber || "Quote"}</span>
                    <span>➔</span>
                    <span className="text-slate-800 font-black">{selectedPo.id}</span>
                    <span>➔</span>
                    <span className="text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate("/qcmanagement")}>GRN</span>
                    <span>➔</span>
                    <span className="text-slate-400">Invoice</span>
                    <span>➔</span>
                    <span className="text-slate-400">Pay</span>
                  </div>
                </div>

                {/* ── Procurement Details Section (NEW) ── */}
                <div className="space-y-3 border-b pb-4">
                  <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <Layers size={13} className="text-indigo-600" />
                    Procurement Details
                  </h4>
                  {loadingWorkflow ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      <span className="text-[10px] text-slate-400 font-semibold">Loading traceability...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-semibold">
                      {[
                        { label: "PR Number", value: selectedPo.prNumber || workflowDetails?.prId || "—" },
                        { label: "RFQ Number", value: selectedPo.rfqNumber || selectedPo.rfqId !== "N/A" ? (selectedPo.rfqNumber || selectedPo.rfqId) : (workflowDetails?.rfqId || "—") },
                        { label: "Vendor Quotation No.", value: selectedPo.vendorQuotationNumber || workflowDetails?.vendorQuotationNumber || "—" },
                        { label: "Selected Vendor", value: selectedPo.vendorName || workflowDetails?.selectedVendor?.vendorName || "—" },
                        { label: "Procurement Officer", value: selectedPo.procurementOfficer || workflowDetails?.procurementOfficer || "—" },
                        { label: "Approval Date", value: selectedPo.approvalDate ? formatDate(selectedPo.approvalDate, settings.dateFormat) : (workflowDetails?.approvalDate ? new Date(workflowDetails.approvalDate).toLocaleDateString() : "—") },
                        { label: "PO Creation Date", value: selectedPo.poCreationDate ? formatDate(selectedPo.poCreationDate, settings.dateFormat) : formatDate(selectedPo.createdDate, settings.dateFormat) },
                        { label: "Current Stage", value: selectedPo.procurementStage || workflowDetails?.workflowStatus || selectedPo.status },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start gap-2">
                          <span className="text-slate-400 shrink-0">{label}:</span>
                          <span className="text-slate-800 font-bold text-right max-w-[130px] truncate" title={String(value)}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vendor details */}
                <div className="space-y-2.5 text-xs">
                  <h4 className="font-black text-slate-800 border-b pb-1">Supplier Details</h4>
                  <div className="space-y-1.5 font-semibold text-slate-500">
                    <div className="flex justify-between">
                      <span>Vendor:</span>
                      <span className="text-slate-800 font-extrabold hover:underline cursor-pointer" onClick={() => navigate("/procurement/vendor", { state: { vendorName: selectedPo.vendorName } })}>{selectedPo.vendorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contact:</span>
                      <span className="text-slate-700">{selectedPo.vendorContact}</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Address:</span>
                      <span className="text-slate-700 leading-tight mt-0.5">{selectedPo.vendorAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Items summary */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs text-slate-800 border-b pb-1">Items Lines</h4>
                  <div className="bg-slate-50/70 rounded-2xl p-4.5 divide-y divide-slate-100 text-xs">
                    {selectedPo.items ? (
                      selectedPo.items.map((item, idx) => (
                        <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between gap-4">
                          <div>
                            <p className="font-bold text-slate-800">{item.productName}</p>
                            <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{item.quantity} units × {currencySymbol}{item.unitPrice.toLocaleString()}</p>
                          </div>
                          <span className="font-black text-indigo-600">{currencySymbol}{item.subtotal.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-1 flex justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-800">{selectedPo.productName}</p>
                          <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{selectedPo.quantity} units × {currencySymbol}{selectedPo.unitPrice.toLocaleString()}</p>
                        </div>
                        <span className="font-black text-indigo-600">{currencySymbol}{selectedPo.subtotal.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grand totals */}
                <div className="space-y-2 text-xs border-t pt-4 font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span className="text-slate-800">+{currencySymbol}{selectedPo.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount (5%):</span>
                    <span className="text-slate-800">-{currencySymbol}{selectedPo.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight / Shipping:</span>
                    <span className="text-slate-800">+{currencySymbol}{selectedPo.shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t pt-2 mt-2">
                    <span className="font-bold text-slate-700">Grand Total:</span>
                    <span className="text-lg font-black text-indigo-600">{currencySymbol}{selectedPo.grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Timeline and status buttons — NO <hr> above */}
                <div className="pt-2 space-y-3">
                  {/* ── Go to Vendor Section (NEW) ── */}
                  <button
                    onClick={() => navigate("/vendors", { state: { highlightVendor: selectedPo.vendorName } })}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-100"
                  >
                    <Building size={12} /> Go to Vendor Section
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrintPo(selectedPo)}
                      className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-2xl text-[10px] font-bold flex items-center justify-center gap-1 transition shadow-sm"
                    >
                      <Printer size={12} /> Print Invoice
                    </button>
                    {selectedPo.status === "Draft" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedPo.id, "Pending Approval")}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1 transition shadow-md shadow-indigo-50"
                      >
                        <Send size={12} /> Submit
                      </button>
                    )}
                  </div>

                  {selectedPo.status === "Pending Approval" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedPo.id, "Approved")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedPo.id, "Draft")}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  )}

                  {selectedPo.status === "Approved" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedPo.id, "Sent to Vendor")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-50"
                    >
                      <Send size={12} /> Release to Vendor
                    </button>
                  )}

                  {selectedPo.status === "Sent to Vendor" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedPo.id, "Closed")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-50"
                    >
                      <CheckCircle2 size={12} /> Mark Completed
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 font-bold text-xs">
                Select a Purchase Order row to view comprehensive trace history.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-scale-up">
            
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-800">Create Purchase Order Manually</h3>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Build a manual procurement contract from vendor catalogs.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit} className="space-y-6">
              
              {/* Vendor & Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">
                    Vendor Partner <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedVendorName}
                    onChange={(e) => setSelectedVendorName(e.target.value)}
                    required
                    className="border border-slate-200 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700 bg-white"
                  >
                    <option value="">Select Vendor...</option>
                    {vendors.map((v, idx) => (
                      <option key={idx} value={v.name || v.vendorName}>
                        {v.name || v.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    className="border border-slate-200 p-2.5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Payment & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">
                    Payment Conditions
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="border border-slate-200 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700 bg-white"
                  >
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="Net 45">Net 45 Days</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">
                    Terms & Conditions
                  </label>
                  <textarea
                    rows={2}
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    className="border border-slate-200 p-2.5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* PO Items lines builder */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet size={14} className="text-indigo-600" />
                    Product Items Lines
                  </h4>
                </div>

                {poItemsList.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50/70 p-4 rounded-3xl border border-slate-100 items-end hover:bg-slate-50 transition"
                  >
                    <div className="sm:col-span-4 flex flex-col">
                      <label className="text-[10px] font-bold text-slate-500 mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter item name"
                        value={item.productName}
                        onChange={(e) => updatePoItemLine(index, "productName", e.target.value)}
                        className="border border-slate-200 p-2 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-[11px] font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col">
                      <label className="text-[10px] font-bold text-slate-500 mb-1">
                        Qty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => updatePoItemLine(index, "quantity", parseInt(e.target.value) || 0)}
                        className="border border-slate-200 p-2 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-[11px] font-extrabold text-center"
                      />
                    </div>

                    <div className="sm:col-span-3 flex flex-col">
                      <label className="text-[10px] font-bold text-slate-500 mb-1">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unitPrice}
                        onChange={(e) => updatePoItemLine(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="border border-slate-200 p-2 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-[11px] font-extrabold text-right"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 mb-1">Tax (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={item.taxPercent}
                        onChange={(e) => updatePoItemLine(index, "taxPercent", parseInt(e.target.value) || 0)}
                        className="border border-slate-200 p-2 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-[11px] font-bold text-center"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removePoItemLine(index)}
                        disabled={poItemsList.length === 1}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-30 disabled:pointer-events-none w-9 h-9 rounded-xl flex items-center justify-center border border-rose-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPoItemLine}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 transition font-bold text-[10px]"
                >
                  <Plus size={14} /> Add Product Line
                </button>
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-50 border rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500">
                <span>Subtotal: <strong className="text-slate-800 text-sm">{currencySymbol}{calculatedSubtotal.toLocaleString()}</strong></span>
                <span>Tax (+18%): <strong className="text-slate-800 text-sm">{currencySymbol}{calculatedTax.toLocaleString()}</strong></span>
                <span>Discount (-5%): <strong className="text-slate-800 text-sm">-{currencySymbol}{calculatedDiscount.toLocaleString()}</strong></span>
                <span>Grand Total: <strong className="text-indigo-600 text-base font-black">{currencySymbol}{calculatedTotal.toLocaleString()}</strong></span>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 hover:shadow-indigo-250 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={14} />
                  {loading ? "Creating..." : "Create PO"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}