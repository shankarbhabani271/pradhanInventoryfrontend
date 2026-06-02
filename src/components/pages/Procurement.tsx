import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/http";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  ShoppingCart,
  Clock,
  Plus,
  Check,
  X,
  Send,
  Sliders,
  AlertTriangle,
  Search,
  ArrowRight,
  ClipboardList,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  Save,
  IndianRupee,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { getSavedSettings, getCurrencySymbol, formatDate } from "../../utils/settingsHelper";

// ── TYPES & INTERFACES ──
export interface PRItem {
  id: string; // PR-2026-XXX
  materialRequestId?: string;
  department: string;
  requester: string;
  productDetails: string;
  quantity: number;
  estimatedPrice: number;
  totalAmount: number;
  priority: "Low" | "Medium" | "High";
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected";
  createdDate: string;
}

export interface RFQItem {
  id: string; // RFQ-2026-XXX
  prId: string;
  productDetails: string;
  quantity: number;
  createdDate: string;
  lastResponseDate: string;
  selectedVendors: string[];
  status: "Draft" | "Sent to Vendors" | "Closed";
}

export interface VendorQuotation {
  id: string;
  rfqId: string;
  vendorName: string;
  vendorContact: string;
  vendorAddress: string;
  unitPrice: number;
  deliveryDays: number;
  warranty: string;
  paymentTerms: string;
  notes: string;
  totalAmount: number;
}

export interface POItem {
  id: string; // PO-2026-XXX
  rfqId: string;
  quotationId: string;
  vendorName: string;
  vendorContact: string;
  vendorAddress: string;
  productName: string;
  quantity: number;
  unitPrice: number;
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
}

export interface GRNItem {
  id: string; // GRN-2026-XXX
  poId: string;
  vendorName: string;
  receivedDate: string;
  receivedBy: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  conditionNotes: string;
  status: "Pending QC" | "QC Completed";
}

export interface InvoiceItem {
  id: string; // INV-2026-XXX
  poId: string;
  grnId?: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: "Pending" | "Verified" | "Paid";
}

export interface PaymentItem {
  id: string; // PAY-2026-XXX
  invoiceId: string;
  poId: string;
  vendorName: string;
  paymentDate: string;
  amount: number;
  mode: "UPI" | "NetBanking" | "Card" | "NEFT";
  bankRef: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  role: string;
}

// ── STATIC SYSTEM VENDORS ──
const STATIC_VENDORS = [
  { name: "Dell Technologies", contact: "Dell Sales Team (+91-8877665544)", address: "Bangalore Tech Park, India" },
  { name: "HP Solutions", contact: "HP Enterprise Hub (+91-9988776655)", address: "Delhi Industrial Complex, India" },
  { name: "Logitech India", contact: "Logitech Logistics (+91-7766554433)", address: "Mumbai Peripherals Yard, India" },
  { name: "Bhabani Traders", contact: "Bhabani Procurement (+91-9876543210)", address: "Bhubaneswar Hub, Odisha" }
];

// ── SERIAL ID GENERATOR (localStorage-based, year-wise) ──
const getNextPoId = (): string => {
  const year = new Date().getFullYear();
  const key = `invenpro_po_counter_${year}`;
  const current = parseInt(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(current));
  return `PO-${year}-${String(current).padStart(3, "0")}`;
};

const getNextPrId = (): string => {
  const year = new Date().getFullYear();
  const key = `invenpro_pr_counter_${year}`;
  const current = parseInt(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(current));
  return `PR-${year}-${String(current).padStart(3, "0")}`;
};

// ── COMPONENT ──
const Procurement = () => {
  const location = useLocation();
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

  const [activeTab, setActiveTab] = useState<string>("Requisitions");
  const [highlightPoId, setHighlightPoId] = useState<string | null>(null);

  const [role, setRole] = useState<string>("admin"); // Dynamic Switchable Roles

  // Main Dynamic States
  const [prs, setPrs] = useState<PRItem[]>([]);
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [quotations, setQuotations] = useState<VendorQuotation[]>([]);
  const [pos, setPos] = useState<POItem[]>([]);
  const [grns, setGrns] = useState<GRNItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Active Selections
  const [selectedPr, setSelectedPr] = useState<PRItem | null>(null);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const [selectedRfq, setSelectedRfq] = useState<RFQItem | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [selectedPo, setSelectedPo] = useState<POItem | null>(null);
  const [showGrnModal, setShowGrnModal] = useState(false);
  const [grnReceivedQty, setGrnReceivedQty] = useState<number>(0);
  const [grnNotes, setGrnNotes] = useState<string>("Received in secure packaging");

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"UPI" | "NetBanking" | "Card" | "NEFT">("NetBanking");
  const [bankRefCode, setBankRefCode] = useState("");

  // Manual PO Selection states
  const [showManualPoModal, setShowManualPoModal] = useState(false);
  const [vendorSelectedMrs, setVendorSelectedMrs] = useState<any[]>([]);
  const [selectedMrIdForPo, setSelectedMrIdForPo] = useState<string>("");
  const [manualPoPrice, setManualPoPrice] = useState<number>(1200);
  const [manualPoExpectedDate, setManualPoExpectedDate] = useState<string>("");
  const [manualPoPaymentTerms, setManualPoPaymentTerms] = useState<string>("COD");

  // ── EDIT PO States ──
  const [showEditPoModal, setShowEditPoModal] = useState(false);
  const [editingPo, setEditingPo] = useState<POItem | null>(null);
  const [editPoForm, setEditPoForm] = useState({
    vendorName: "",
    productName: "",
    quantity: 0,
    unitPrice: 0,
    expectedDeliveryDate: "",
    status: "Draft" as POItem["status"],
  });

  // ── DELETE PO States ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPoId, setDeletingPoId] = useState<string | null>(null);

  // Sync tab and highlight state when location changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.highlightPoId) {
      setHighlightPoId(location.state.highlightPoId);

      // Fetch updated POs from localStorage instantly to ensure it is visible!
      const cachedPos = localStorage.getItem("invenpro_pos");
      if (cachedPos) {
        try {
          setPos(JSON.parse(cachedPos));
        } catch { }
      }

      // Automatically clear highlight animation after 5 seconds
      const timer = setTimeout(() => {
        setHighlightPoId(null);
      }, 5000);

      // Clean up location state to avoid re-triggering
      window.history.replaceState({}, document.title);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // ── SEED SAMPLE DATA ON FIRST RENDER ──
  useEffect(() => {
    // 1. Audit Logs
    const cachedLogs = localStorage.getItem("invenpro_audit_logs");
    if (!cachedLogs) {
      const defaultLogs: AuditLog[] = [
        { id: "LOG-001", action: "Material Request MR-2026-001 created by Arjun Sharma", user: "Arjun Sharma", timestamp: "2026-05-20 10:30 AM", role: "employee" },
        { id: "LOG-002", action: "Material Request MR-2026-001 approved by Manager Bhabani", user: "Bhabani", timestamp: "2026-05-21 11:15 AM", role: "manager" },
        { id: "LOG-003", action: "Purchase Requisition PR-2026-001 auto-generated from approved MR-2026-001", user: "System", timestamp: "2026-05-21 11:15 AM", role: "admin" },
        { id: "LOG-004", action: "RFQ RFQ-2026-001 generated for PR-2026-001 with 3 vendors selected", user: "Bhabani", timestamp: "2026-05-22 02:45 PM", role: "procurement" }
      ];
      localStorage.setItem("invenpro_audit_logs", JSON.stringify(defaultLogs));
      setAuditLogs(defaultLogs);
    } else {
      setAuditLogs(JSON.parse(cachedLogs));
    }

    // 2. PRs
    const cachedPrs = localStorage.getItem("invenpro_prs");
    if (!cachedPrs) {
      const defaultPrs: PRItem[] = [
        {
          id: "PR-2026-001",
          department: "IT Services",
          requester: "Arjun Sharma",
          productDetails: "Dell Laptops core i5",
          quantity: 20,
          estimatedPrice: 45000,
          totalAmount: 900000,
          priority: "High",
          status: "Approved",
          createdDate: "2026-05-21"
        },
        {
          id: "PR-2026-002",
          department: "Operations",
          requester: "Priya Nair",
          productDetails: "Safety Helmets",
          quantity: 100,
          estimatedPrice: 350,
          totalAmount: 35000,
          priority: "Medium",
          status: "Pending Approval",
          createdDate: "2026-05-24"
        },
        {
          id: "PR-2026-003",
          department: "HR Administration",
          requester: "Sneha Patel",
          productDetails: "Ergonomic Chairs",
          quantity: 15,
          estimatedPrice: 8500,
          totalAmount: 127500,
          priority: "Low",
          status: "Rejected",
          createdDate: "2026-05-25"
        }
      ];
      localStorage.setItem("invenpro_prs", JSON.stringify(defaultPrs));
      setPrs(defaultPrs);
    } else {
      setPrs(JSON.parse(cachedPrs));
    }

    // 3. RFQs & Quotations
    const cachedRfqs = localStorage.getItem("invenpro_rfqs");
    const cachedQuotes = localStorage.getItem("invenpro_quotes");
    if (!cachedRfqs || !cachedQuotes) {
      const defaultRfqs: RFQItem[] = [
        {
          id: "RFQ-2026-001",
          prId: "PR-2026-001",
          productDetails: "Dell Laptops core i5",
          quantity: 20,
          createdDate: "2026-05-22",
          lastResponseDate: "2026-06-05",
          selectedVendors: ["Dell Technologies", "HP Solutions", "Logitech India"],
          status: "Sent to Vendors"
        },
        {
          id: "RFQ-2026-002",
          prId: "PR-2026-002",
          productDetails: "Safety Helmets",
          quantity: 100,
          createdDate: "2026-05-24",
          lastResponseDate: "2026-06-07",
          selectedVendors: ["HP Solutions", "Bhabani Traders"],
          status: "Draft"
        }
      ];
      const defaultQuotes: VendorQuotation[] = [
        {
          id: "QT-2026-001",
          rfqId: "RFQ-2026-001",
          vendorName: "Dell Technologies",
          vendorContact: "Dell Sales Team (+91-8877665544)",
          vendorAddress: "Bangalore Tech Park, India",
          unitPrice: 42000,
          deliveryDays: 3,
          warranty: "3 Years",
          paymentTerms: "Net 30",
          notes: "Dell Latitude Pro 5440 core i5, highly reliable ERP model",
          totalAmount: 840000
        },
        {
          id: "QT-2026-002",
          rfqId: "RFQ-2026-001",
          vendorName: "HP Solutions",
          vendorContact: "HP Enterprise Hub (+91-9988776655)",
          vendorAddress: "Delhi Industrial Complex, India",
          unitPrice: 45000,
          deliveryDays: 2,
          warranty: "2 Years",
          paymentTerms: "Net 15",
          notes: "HP ProBook 440 G10, immediate delivery, premium keyboard",
          totalAmount: 900000
        },
        {
          id: "QT-2026-003",
          rfqId: "RFQ-2026-001",
          vendorName: "Logitech India",
          vendorContact: "Logitech Logistics (+91-7766554433)",
          vendorAddress: "Mumbai Peripherals Yard, India",
          unitPrice: 48000,
          deliveryDays: 6,
          warranty: "1 Year",
          paymentTerms: "COD",
          notes: "Assembled commercial grade laptops with warranty extension options",
          totalAmount: 960000
        }
      ];
      localStorage.setItem("invenpro_rfqs", JSON.stringify(defaultRfqs));
      localStorage.setItem("invenpro_quotes", JSON.stringify(defaultQuotes));
      setRfqs(defaultRfqs);
      setQuotations(defaultQuotes);
    } else {
      setRfqs(JSON.parse(cachedRfqs));
      setQuotations(JSON.parse(cachedQuotes));
    }

    // 4. POs
    const cachedPos = localStorage.getItem("invenpro_pos");
    if (!cachedPos) {
      const defaultPos: POItem[] = [
        {
          id: "PO-2026-001",
          rfqId: "RFQ-2026-001",
          quotationId: "QT-2026-001",
          vendorName: "Dell Technologies",
          vendorContact: "Dell Sales Team (+91-8877665544)",
          vendorAddress: "Bangalore Tech Park, India",
          productName: "Dell Laptops core i5",
          quantity: 20,
          unitPrice: 42000,
          taxPercent: 18,
          discountPercent: 5,
          subtotal: 840000,
          taxAmount: 151200,
          discountAmount: 42000,
          shippingCost: 5000,
          grandTotal: 954200,
          expectedDeliveryDate: "2026-05-28",
          paymentTerms: "Net 30",
          currency: "INR (₹)",
          status: "Sent to Vendor",
          createdBy: "Bhabani",
          approvedBy: "Procurement Manager",
          createdDate: "2026-05-25"
        },
        {
          id: "PO-2026-002",
          rfqId: "RFQ-2026-002",
          quotationId: "N/A",
          vendorName: "HP Solutions",
          vendorContact: "HP Enterprise Hub (+91-9988776655)",
          vendorAddress: "Delhi Industrial Complex, India",
          productName: "HP Laptops Elite",
          quantity: 2,
          unitPrice: 55000,
          taxPercent: 18,
          discountPercent: 0,
          subtotal: 110000,
          taxAmount: 19800,
          discountAmount: 0,
          shippingCost: 2000,
          grandTotal: 131800,
          expectedDeliveryDate: "2026-06-03",
          paymentTerms: "Net 15",
          currency: "INR (₹)",
          status: "Pending Approval",
          createdBy: "Bhabani",
          approvedBy: "",
          createdDate: "2026-05-28"
        }
      ];
      localStorage.setItem("invenpro_pos", JSON.stringify(defaultPos));
      setPos(defaultPos);
    } else {
      setPos(JSON.parse(cachedPos));
    }

    // 5. GRNs
    const cachedGrns = localStorage.getItem("invenpro_grns");
    if (!cachedGrns) {
      const defaultGrns: GRNItem[] = [
        {
          id: "GRN-2026-001",
          poId: "PO-2026-001",
          vendorName: "Dell Technologies",
          receivedDate: "2026-05-28",
          receivedBy: "Bhabani",
          productName: "Dell Laptops core i5",
          orderedQty: 20,
          receivedQty: 20,
          conditionNotes: "Received in secure packaging, screen and keyboard checks pending",
          status: "Pending QC"
        }
      ];
      localStorage.setItem("invenpro_grns", JSON.stringify(defaultGrns));
      setGrns(defaultGrns);
    } else {
      setGrns(JSON.parse(cachedGrns));
    }

    // 6. Invoices & Payments
    const cachedInvoices = localStorage.getItem("invenpro_invoices");
    const cachedPayments = localStorage.getItem("invenpro_payments");
    if (!cachedInvoices || !cachedPayments) {
      const defaultInvoices: InvoiceItem[] = [
        {
          id: "INV-2026-001",
          poId: "PO-2026-001",
          grnId: "GRN-2026-001",
          vendorName: "Dell Technologies",
          invoiceDate: "2026-05-28",
          dueDate: "2026-06-27",
          amount: 954200,
          status: "Paid"
        },
        {
          id: "INV-2026-002",
          poId: "PO-2026-002",
          vendorName: "HP Solutions",
          invoiceDate: "2026-05-29",
          dueDate: "2026-06-13",
          amount: 131800,
          status: "Pending"
        }
      ];
      const defaultPayments: PaymentItem[] = [
        {
          id: "PAY-2026-001",
          invoiceId: "INV-2026-001",
          poId: "PO-2026-001",
          vendorName: "Dell Technologies",
          paymentDate: "2026-05-29",
          amount: 954200,
          mode: "NetBanking",
          bankRef: "HDFCR520260529124"
        }
      ];
      localStorage.setItem("invenpro_invoices", JSON.stringify(defaultInvoices));
      localStorage.setItem("invenpro_payments", JSON.stringify(defaultPayments));
      setInvoices(defaultInvoices);
      setPayments(defaultPayments);
    } else {
      setInvoices(JSON.parse(cachedInvoices));
      setPayments(JSON.parse(cachedPayments));
    }

    // Check for any approved Material Requests to generate Requisitions automatically
    syncApprovedMaterialRequests();
  }, []);

  // ── AUTO-SYNC APPROVED MATERIAL REQUESTS TO PRs ──
  const syncApprovedMaterialRequests = async () => {
    try {
      const res = await fetch("/api/material?status=Approved");
      const json = await res.json();
      if (json && json.data) {
        const approvedMRequests = json.data;
        const currentPrs = JSON.parse(localStorage.getItem("invenpro_prs") || "[]");
        let addedCount = 0;

        approvedMRequests.forEach((req: any) => {
          const exists = currentPrs.some((p: any) => p.materialRequestId === req._id);
          if (!exists) {
            const newPr: PRItem = {
              id: getNextPrId(),
              materialRequestId: req._id,
              department: req.department,
              requester: req.requester,
              productDetails: req.productDetails,
              quantity: req.quantity,
              estimatedPrice: 1200,
              totalAmount: req.quantity * 1200,
              priority: req.priority === "Urgent" ? "High" : req.priority,
              status: "Approved",
              createdDate: new Date().toISOString().split("T")[0]
            };
            currentPrs.unshift(newPr);
            addedCount++;
          }
        });

        if (addedCount > 0) {
          localStorage.setItem("invenpro_prs", JSON.stringify(currentPrs));
          setPrs(currentPrs);
          addAuditLog(`Auto-synced ${addedCount} approved material requests into PR Requisitions list.`);
        }
      }
    } catch (err) {
      console.warn("MongoDB API sync unavailable, relying on localStorage requisitions state.");
    }
  };

  // ── AUDIT LOG HELPER ──
  const addAuditLog = (action: string) => {
    const freshLogs = JSON.parse(localStorage.getItem("invenpro_audit_logs") || "[]");
    const newLog: AuditLog = {
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      action,
      user: role === "admin" ? "Admin User" : role === "manager" ? "Procurement Manager" : "Procurement Officer",
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role
    };
    const updated = [newLog, ...freshLogs];
    localStorage.setItem("invenpro_audit_logs", JSON.stringify(updated));
    setAuditLogs(updated);
  };

  // ── PR ACTIONS ──
  const handleApprovePr = (prId: string) => {
    if (role !== "admin" && role !== "manager") {
      toast.error("Access Denied: Only Procurement Managers can approve requisitions!");
      return;
    }
    const updated = prs.map(p => p.id === prId ? { ...p, status: "Approved" as const } : p);
    localStorage.setItem("invenpro_prs", JSON.stringify(updated));
    setPrs(updated);
    addAuditLog(`Requisition ${prId} approved.`);
    toast.success(`Requisition ${prId} approved successfully!`);
  };

  const handleRejectPr = (prId: string) => {
    if (role !== "admin" && role !== "manager") {
      toast.error("Access Denied: Only Procurement Managers can reject requisitions!");
      return;
    }
    const updated = prs.map(p => p.id === prId ? { ...p, status: "Rejected" as const } : p);
    localStorage.setItem("invenpro_prs", JSON.stringify(updated));
    setPrs(updated);
    addAuditLog(`Requisition ${prId} rejected.`);
    toast.error(`Requisition ${prId} rejected.`);
  };

  // ── RFQ ACTIONS ──
  const handleOpenRfqModal = (pr: PRItem) => {
    setSelectedPr(pr);
    setSelectedVendors([]);
    setShowRfqModal(true);
  };

  const handleCreateRfq = () => {
    if (selectedVendors.length === 0) {
      toast.error("Please select at least one vendor to send the RFQ!");
      return;
    }
    if (!selectedPr) return;

    const rfqId = "RFQ-2026-" + Math.floor(100 + Math.random() * 900);
    const today = new Date().toISOString().split("T")[0];
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const lastDate = targetDate.toISOString().split("T")[0];

    const newRfq: RFQItem = {
      id: rfqId,
      prId: selectedPr.id,
      productDetails: selectedPr.productDetails,
      quantity: selectedPr.quantity,
      createdDate: today,
      lastResponseDate: lastDate,
      selectedVendors,
      status: "Sent to Vendors"
    };

    // Auto-generate competitive quotations from selected vendors
    const newQuotes: VendorQuotation[] = selectedVendors.map((vendor, idx) => {
      const selectedStatic = STATIC_VENDORS.find(v => v.name === vendor) || STATIC_VENDORS[0];
      // Random price calculation to simulate real quotes
      const baseEst = selectedPr.estimatedPrice;
      const variation = (idx === 0) ? -0.05 : (idx === 1) ? 0.02 : 0.08;
      const finalUnit = Math.round(baseEst * (1 + variation));
      const delivery = (idx === 0) ? 3 : (idx === 1) ? 2 : 5;
      const warranty = (idx === 0) ? "3 Years" : (idx === 1) ? "2 Years" : "1 Year";
      const terms = (idx === 0) ? "Net 30" : (idx === 1) ? "Net 15" : "COD";

      return {
        id: "QT-2026-" + Math.floor(1000 + Math.random() * 9000),
        rfqId,
        vendorName: vendor,
        vendorContact: selectedStatic.contact,
        vendorAddress: selectedStatic.address,
        unitPrice: finalUnit,
        deliveryDays: delivery,
        warranty,
        paymentTerms: terms,
        notes: `Enterprise quote for ${selectedPr.productDetails}. High quality guaranteed.`,
        totalAmount: finalUnit * selectedPr.quantity
      };
    });

    // Update Requisitions status
    const updatedPrs = prs.map(p => p.id === selectedPr.id ? { ...p, status: "Approved" as const } : p);
    localStorage.setItem("invenpro_prs", JSON.stringify(updatedPrs));
    setPrs(updatedPrs);

    const updatedRfqs = [newRfq, ...rfqs];
    const updatedQuotes = [...newQuotes, ...quotations];

    localStorage.setItem("invenpro_rfqs", JSON.stringify(updatedRfqs));
    localStorage.setItem("invenpro_quotes", JSON.stringify(updatedQuotes));

    setRfqs(updatedRfqs);
    setQuotations(updatedQuotes);

    addAuditLog(`RFQ ${rfqId} generated for PR ${selectedPr.id} and sent to ${selectedVendors.join(", ")}.`);
    setShowRfqModal(false);
    toast.success(`RFQ ${rfqId} successfully generated and vendor quotes loaded! 🎉`);
  };

  const handleOpenCompareModal = (rfq: RFQItem) => {
    setSelectedRfq(rfq);
    setShowCompareModal(true);
  };

  // ── PO AUTO-CREATION FROM SELECTION ──
  const handleSelectVendorQuote = (quote: VendorQuotation) => {
    if (!selectedRfq) return;

    const poId = getNextPoId();
    const today = new Date().toISOString().split("T")[0];
    const expected = new Date();
    expected.setDate(expected.getDate() + quote.deliveryDays);
    const deliveryStr = expected.toISOString().split("T")[0];

    const subtotal = quote.totalAmount;
    const taxAmount = Math.round(subtotal * 0.18);
    const discountAmount = Math.round(subtotal * 0.05); // Standard 5% selection discount
    const shippingCost = 3500;
    const grandTotal = subtotal + taxAmount - discountAmount + shippingCost;

    const newPo: POItem = {
      id: poId,
      rfqId: selectedRfq.id,
      quotationId: quote.id,
      vendorName: quote.vendorName,
      vendorContact: quote.vendorContact,
      vendorAddress: quote.vendorAddress,
      productName: selectedRfq.productDetails,
      quantity: selectedRfq.quantity,
      unitPrice: quote.unitPrice,
      taxPercent: 18,
      discountPercent: 5,
      subtotal,
      taxAmount,
      discountAmount,
      shippingCost,
      grandTotal,
      expectedDeliveryDate: deliveryStr,
      paymentTerms: quote.paymentTerms,
      currency: "INR (₹)",
      status: "Draft",
      createdBy: "Bhabani",
      approvedBy: "",
      createdDate: today
    };

    // Close RFQ
    const updatedRfqs = rfqs.map(r => r.id === selectedRfq.id ? { ...r, status: "Closed" as const } : r);
    localStorage.setItem("invenpro_rfqs", JSON.stringify(updatedRfqs));
    setRfqs(updatedRfqs);

    const updatedPos = [newPo, ...pos];
    localStorage.setItem("invenpro_pos", JSON.stringify(updatedPos));
    setPos(updatedPos);

    addAuditLog(`Purchase Order ${poId} auto-created in Draft status based on approved RFQ ${selectedRfq.id} (Supplier: ${quote.vendorName}).`);
    setShowCompareModal(false);
    toast.success(`PO ${poId} generated from approved quotation! Please approve to release to supplier.`);
  };

  const fetchVendorSelectedMrs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/material?status=${encodeURIComponent("Vendor Selected")}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVendorSelectedMrs(json.data);
        if (json.data.length > 0) {
          setSelectedMrIdForPo(json.data[0]._id);

          // Pre-populate price from stored invenpro_mr_vendors if available
          const cachedMrVendors = localStorage.getItem("invenpro_mr_vendors");
          if (cachedMrVendors) {
            try {
              const map = JSON.parse(cachedMrVendors);
              if (map[json.data[0]._id]?.unitPrice) {
                setManualPoPrice(map[json.data[0]._id].unitPrice);
              } else {
                setManualPoPrice(1200);
              }
            } catch {
              setManualPoPrice(1200);
            }
          } else {
            setManualPoPrice(1200);
          }
        } else {
          setSelectedMrIdForPo("");
        }
      }
    } catch (err) {
      console.error("Failed to fetch Vendor Selected requests:", err);
    }
  };

  const handleOpenManualPoModal = async () => {
    await fetchVendorSelectedMrs();

    // Set default expected date to 5 days from now
    const fiveDaysOut = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setManualPoExpectedDate(fiveDaysOut);
    setManualPoPaymentTerms("COD");
    setShowManualPoModal(true);
  };

  const handleMrSelectionChange = (mrId: string) => {
    setSelectedMrIdForPo(mrId);

    // Look up negotiated price if any
    const cachedMrVendors = localStorage.getItem("invenpro_mr_vendors");
    if (cachedMrVendors) {
      try {
        const map = JSON.parse(cachedMrVendors);
        if (map[mrId]?.unitPrice) {
          setManualPoPrice(map[mrId].unitPrice);
        } else {
          setManualPoPrice(1200);
        }
      } catch {
        setManualPoPrice(1200);
      }
    } else {
      setManualPoPrice(1200);
    }
  };

  const handleConfirmManualPo = async () => {
    if (!selectedMrIdForPo) {
      toast.error("Please select a Material Request reference first.");
      return;
    }

    const selectedMr = vendorSelectedMrs.find(m => m._id === selectedMrIdForPo);
    if (!selectedMr) {
      toast.error("Selected Material Request was not found.");
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
        const mapped = map[selectedMrIdForPo];
        if (mapped) {
          vendorName = mapped.vendorName;
          vendorContact = mapped.vendorContact;
          vendorAddress = mapped.vendorAddress;
        }
      } catch { }
    }

    let toastId: any = null;
    try {
      toastId = toast.loading ? toast.loading(`Manually generating Purchase Order...`) : null;
    } catch {
      toastId = toast(`Manually generating Purchase Order...`);
    }

    try {
      const poNumber = getNextPoId();
      const todayStr = new Date().toISOString().split("T")[0];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Calculations
      const qty = Number(selectedMr.quantity) || 1;
      const price = Number(manualPoPrice) || 1200;
      const subtotal = qty * price;
      const taxPercent = 18;
      const taxAmount = Math.round(subtotal * (taxPercent / 100));
      const grandTotal = subtotal + taxAmount;

      const newPo: POItem = {
        id: poNumber,
        rfqId: "N/A",
        quotationId: "N/A",
        vendorName: vendorName,
        vendorContact: vendorContact,
        vendorAddress: vendorAddress,
        productName: selectedMr.productDetails,
        quantity: qty,
        unitPrice: price,
        taxPercent: taxPercent,
        discountPercent: 0,
        subtotal: subtotal,
        taxAmount: taxAmount,
        discountAmount: 0,
        shippingCost: 0,
        grandTotal: grandTotal,
        expectedDeliveryDate: manualPoExpectedDate || todayStr,
        paymentTerms: manualPoPaymentTerms || "COD",
        currency: "INR (₹)",
        status: "Draft",
        createdBy: "Bhabani",
        approvedBy: "",
        createdDate: todayStr,
        materialRequestRef: selectedMr.referenceId
      };

      // 1. Add PO to invenpro_pos
      const cachedPos = localStorage.getItem("invenpro_pos");
      let posList = [];
      if (cachedPos) {
        try {
          posList = JSON.parse(cachedPos);
        } catch {
          posList = [];
        }
      }
      posList.unshift(newPo);
      localStorage.setItem("invenpro_pos", JSON.stringify(posList));
      setPos(posList);

      // 2. Update Material Request status in DB to "PO Created"
      try {
        await fetch(`${API_BASE_URL}/material/${selectedMr._id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PO Created" })
        });
      } catch (err) {
        console.warn("Backend status update failed", err);
      }

      // 3. Add Log entry
      const cachedLogs = localStorage.getItem("invenpro_audit_logs");
      let logsList = [];
      if (cachedLogs) {
        try {
          logsList = JSON.parse(cachedLogs);
        } catch {
          logsList = [];
        }
      }
      const newAuditLog = {
        id: "LOG-" + Math.floor(100000 + Math.random() * 900000),
        action: `Manual Purchase Order ${poNumber} created in Draft status for request ${selectedMr.referenceId}.`,
        user: "Bhabani",
        timestamp: `${todayStr} ${timeStr}`,
        role: "procurement"
      };
      logsList.unshift(newAuditLog);
      localStorage.setItem("invenpro_audit_logs", JSON.stringify(logsList));
      setAuditLogs(logsList);

      // 4. Success Toast
      try {
        if (toastId && typeof toastId !== "object" && toast.success) {
          toast.success(`Purchase Order ${poNumber} successfully generated manually! 🎉`, { id: toastId });
        } else {
          toast.success(`Purchase Order ${poNumber} successfully generated manually! 🎉`);
        }
      } catch {
        toast.success(`Purchase Order ${poNumber} successfully generated manually! 🎉`);
      }

      // 5. Highlight the row
      setHighlightPoId(poNumber);

      // Automatically clear highlight animation after 5 seconds
      setTimeout(() => {
        setHighlightPoId(null);
      }, 5000);

      // 6. Close Modal
      setShowManualPoModal(false);

    } catch (error: any) {
      console.error("Manual PO generation failed:", error);
      const errMsg = error.message || "Failed to create Purchase Order.";
      try {
        if (toastId && typeof toastId !== "object" && toast.error) {
          toast.error(errMsg, { id: toastId });
        } else {
          toast.error(errMsg);
        }
      } catch {
        toast.error(errMsg);
      }
    }
  };

  const handleApprovePo = async (poId: string) => {
    if (role !== "admin" && role !== "manager") {
      toast.error("Access Denied: Only Procurement Managers can approve POs!");
      return;
    }
    const targetPo = pos.find(p => p.id === poId);
    const updated = pos.map(p => p.id === poId ? { ...p, status: "Approved" as const, approvedBy: "Procurement Manager" } : p);
    localStorage.setItem("invenpro_pos", JSON.stringify(updated));
    setPos(updated);
    addAuditLog(`PO ${poId} approved by Procurement Manager.`);
    toast.success(`PO ${poId} is approved and ready for dispatch.`);

    if (targetPo && targetPo.materialRequestRef) {
      try {
        const mrRes = await fetch(`${API_BASE_URL}/material`);
        const mrJson = await mrRes.json();
        if (mrJson.success && Array.isArray(mrJson.data)) {
          const matchedMr = mrJson.data.find((m: any) => m.referenceId === targetPo.materialRequestRef);
          if (matchedMr) {
            await fetch(`${API_BASE_URL}/material/${matchedMr._id}/status`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "PO Approved" })
            });
          }
        }
      } catch (err) {
        console.warn("Failed to update MR status on PO approval:", err);
      }
    }
  };

  const handleSendPoToVendor = (poId: string) => {
    const updated = pos.map(p => p.id === poId ? { ...p, status: "Sent to Vendor" as const } : p);
    localStorage.setItem("invenpro_pos", JSON.stringify(updated));
    setPos(updated);
    addAuditLog(`PO ${poId} sent officially to vendor.`);
    toast.success(`PO ${poId} transmitted to supplier. Receiving channel activated.`);
  };

  // ── EDIT PO HANDLERS ──
  const handleOpenEditPo = (po: POItem) => {
    setEditingPo(po);
    setEditPoForm({
      vendorName: po.vendorName,
      productName: po.productName,
      quantity: po.quantity,
      unitPrice: po.unitPrice,
      expectedDeliveryDate: po.expectedDeliveryDate,
      status: po.status,
    });
    setShowEditPoModal(true);
  };

  const handleSaveEditPo = () => {
    if (!editingPo) return;
    const subtotal = editPoForm.quantity * editPoForm.unitPrice;
    const taxAmount = Math.round(subtotal * (editingPo.taxPercent / 100));
    const discountAmount = Math.round(subtotal * (editingPo.discountPercent / 100));
    const grandTotal = subtotal + taxAmount - discountAmount + editingPo.shippingCost;

    const updated = pos.map(p =>
      p.id === editingPo.id
        ? {
          ...p,
          vendorName: editPoForm.vendorName,
          productName: editPoForm.productName,
          quantity: editPoForm.quantity,
          unitPrice: editPoForm.unitPrice,
          expectedDeliveryDate: editPoForm.expectedDeliveryDate,
          status: editPoForm.status,
          subtotal,
          taxAmount,
          discountAmount,
          grandTotal,
        }
        : p
    );
    localStorage.setItem("invenpro_pos", JSON.stringify(updated));
    setPos(updated);
    addAuditLog(`PO ${editingPo.id} updated by ${role}.`);
    setShowEditPoModal(false);
    setEditingPo(null);
    toast.success(`Purchase Order ${editingPo.id} updated successfully!`);
  };

  // ── DELETE PO HANDLERS ──
  const handleOpenDeletePo = (poId: string) => {
    setDeletingPoId(poId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeletePo = () => {
    if (!deletingPoId) return;
    const updated = pos.filter(p => p.id !== deletingPoId);
    localStorage.setItem("invenpro_pos", JSON.stringify(updated));
    setPos(updated);
    addAuditLog(`PO ${deletingPoId} permanently deleted by ${role}.`);
    setShowDeleteConfirm(false);
    setDeletingPoId(null);
    toast.success(`Purchase Order deleted successfully!`);
  };

  // ── GRN RECEIVING ──
  const handleOpenGrnModal = (po: POItem) => {
    setSelectedPo(po);
    setGrnReceivedQty(po.quantity);
    setGrnNotes("Items checked. Safe reception.");
    setShowGrnModal(true);
  };

  const handleCreateGrn = () => {
    if (!selectedPo) return;
    if (grnReceivedQty <= 0) {
      toast.error("Received quantity must be positive!");
      return;
    }

    const grnId = "GRN-2026-" + Math.floor(100 + Math.random() * 900);
    const today = new Date().toISOString().split("T")[0];

    const newGrn: GRNItem = {
      id: grnId,
      poId: selectedPo.id,
      vendorName: selectedPo.vendorName,
      receivedDate: today,
      receivedBy: "Bhabani",
      productName: selectedPo.productName,
      orderedQty: selectedPo.quantity,
      receivedQty: grnReceivedQty,
      conditionNotes: grnNotes,
      status: "Pending QC"
    };

    // Close/update PO status
    const isFull = grnReceivedQty >= selectedPo.quantity;
    const updatedPos = pos.map(p => p.id === selectedPo.id ? { ...p, status: (isFull ? "Closed" : "Sent to Vendor") as any } : p);
    localStorage.setItem("invenpro_pos", JSON.stringify(updatedPos));
    setPos(updatedPos);

    const updatedGrns = [newGrn, ...grns];
    localStorage.setItem("invenpro_grns", JSON.stringify(updatedGrns));
    setGrns(updatedGrns);

    // Auto-generate invoice matching the GRN
    const invId = "INV-2026-" + Math.floor(100 + Math.random() * 900);
    const targetDue = new Date();
    targetDue.setDate(targetDue.getDate() + 30);

    const newInvoice: InvoiceItem = {
      id: invId,
      poId: selectedPo.id,
      grnId,
      vendorName: selectedPo.vendorName,
      invoiceDate: today,
      dueDate: targetDue.toISOString().split("T")[0],
      amount: selectedPo.grandTotal,
      status: "Pending"
    };

    const updatedInvoices = [newInvoice, ...invoices];
    localStorage.setItem("invenpro_invoices", JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);

    addAuditLog(`GRN ${grnId} generated for PO ${selectedPo.id}. Invoice ${invId} pending verification.`);
    setShowGrnModal(false);
    toast.success(`GRN ${grnId} generated successfully! QC inspection and invoice verification activated.`);
  };

  // ── FINANCE INVOICE & PAYMENT ACTIONS ──
  const handleVerifyInvoice = (inv: InvoiceItem) => {
    if (role !== "admin" && role !== "finance") {
      toast.error("Access Denied: Only Finance officers can verify invoices!");
      return;
    }
    // Gating rule: Invoice can only be verified if a matching GRN exists
    if (!inv.grnId) {
      toast.error(`Invoice Verification Failed: No matching Goods Receipt Note (GRN) exists for PO ${inv.poId}!`);
      return;
    }

    const updated = invoices.map(i => i.id === inv.id ? { ...i, status: "Verified" as const } : i);
    localStorage.setItem("invenpro_invoices", JSON.stringify(updated));
    setInvoices(updated);
    addAuditLog(`Invoice ${inv.id} verified against GRN ${inv.grnId}.`);
    toast.success(`Invoice ${inv.id} verified successfully! Ready for payment.`);
  };

  const handleOpenPaymentModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setBankRefCode("TXN-" + Math.floor(100000 + Math.random() * 900000));
    setShowPaymentModal(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;

    const payId = "PAY-2026-" + Math.floor(100 + Math.random() * 900);
    const today = new Date().toISOString().split("T")[0];

    const newPayment: PaymentItem = {
      id: payId,
      invoiceId: selectedInvoice.id,
      poId: selectedInvoice.poId,
      vendorName: selectedInvoice.vendorName,
      paymentDate: today,
      amount: selectedInvoice.amount,
      mode: paymentMode,
      bankRef: bankRefCode
    };

    const updatedInvoices = invoices.map(i => i.id === selectedInvoice.id ? { ...i, status: "Paid" as const } : i);
    localStorage.setItem("invenpro_invoices", JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);

    const updatedPayments = [newPayment, ...payments];
    localStorage.setItem("invenpro_payments", JSON.stringify(updatedPayments));
    setPayments(updatedPayments);

    addAuditLog(`Payment ${payId} recorded for Invoice ${selectedInvoice.id} via ${paymentMode}.`);
    setShowPaymentModal(false);
    toast.success(`Payment of ${currencySymbol}${selectedInvoice.amount.toLocaleString()} successful! Status closed.`);
  };

  // ── FILTER LISTS ──
  const filteredPrs = prs.filter(p =>
    p.productDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRfqs = rfqs.filter(r =>
    r.productDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPos = pos.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvoices = invoices.filter(i =>
    i.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.poId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 bg-blue-50/50 min-h-screen">
      {/* ── HIGHLY PREMIUM HEADER PANEL WITH ROLE SWITCHING & AUDIT INDICATORS ── */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">ERP Core System</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">Procurement Management Hub</h1>
          <p className="text-xs text-muted-foreground">Automating complete lifecycle: PR → RFQ → Comparison → PO → GRN → Payments</p>
        </div>

        {/* Dynamic Testing Panel */}
        <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border">
          <Sliders className="h-4.5 w-4.5 text-blue-500" />
          <span className="text-xs font-extrabold text-slate-700">Test Role:</span>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              toast.info(`Switched interface role to: ${e.target.value.toUpperCase()}`);
            }}
            className="bg-white border rounded-lg px-2.5 py-1 text-xs font-bold text-blue-600 outline-none cursor-pointer"
          >
            <option value="admin">Administrator (All)</option>
            <option value="procurement">Procurement Officer</option>
            <option value="manager">Procurement Manager</option>
            <option value="finance">Finance Specialist</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Requisitions", value: prs.length, sub: "PR-2026 series", color: "text-blue-600", bg: "bg-blue-100/70" },
          { title: "Active RFQs", value: rfqs.filter(r => r.status === "Sent to Vendors").length, sub: "Pending comparative bid", color: "text-amber-600", bg: "bg-amber-100/70" },
          { title: "Purchase Orders", value: pos.length, sub: `${pos.filter(p => p.status === "Sent to Vendor").length} Sent to Vendor`, color: "text-indigo-600", bg: "bg-indigo-100/70" },
          { title: "Pending GRNs", value: grns.filter(g => g.status === "Pending QC").length, sub: "QC checking required", color: "text-rose-600", bg: "bg-rose-100/70" }
        ].map((kpi, idx) => (
          <Card key={idx} className="rounded-xl border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">{kpi.title}</p>
                <h4 className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</p>
              </div>
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold ${kpi.bg} ${kpi.color}`}>
                {idx === 0 ? <FileText size={18} /> : idx === 1 ? <Search size={18} /> : idx === 2 ? <ShoppingCart size={18} /> : <Clock size={18} />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== TABS LIST ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-slate-200 h-12 rounded-xl p-1 text-slate-700 flex flex-wrap max-w-full overflow-x-auto">
            <TabsTrigger value="Requisitions" className="px-5 py-2 text-xs font-bold rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 transition-all">
              Purchase Requisitions (PR)
            </TabsTrigger>
            <TabsTrigger value="Quotations " className="px-5 py-2 text-xs font-bold rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 transition-all">
              RFQ & Quotation Comparison
            </TabsTrigger>
            <TabsTrigger value=" Orders" className="px-5 py-2 text-xs font-bold rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 transition-all">
              Purchase Orders (PO)
            </TabsTrigger>
            <TabsTrigger value="Finance" className="px-5 py-2 text-xs font-bold rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 transition-all">
              Invoice & Payments
            </TabsTrigger>
            <TabsTrigger value="Logs" className="px-5 py-2 text-xs font-bold rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 transition-all">
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Quick Search */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-[240px] pl-9 rounded-lg border px-3 text-xs bg-white focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1. PURCHASE REQUISITIONS TAB */}
        {/* ============================================================ */}
        <TabsContent value="Requisitions">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden p-6 space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-800">Purchase Requisitions (PR)</h2>
              <p className="text-xs text-muted-foreground">PRs generated automatically from approved Material Requests. Approved Requisitions are sent out for RFQ bidding.</p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="p-3">PR Number</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPrs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">No requisitions found.</td>
                    </tr>
                  ) : (
                    filteredPrs.map(pr => (
                      <tr key={pr.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-blue-600">{pr.id}</td>
                        <td className="p-3 text-slate-700">{pr.department}</td>
                        <td className="p-3 text-slate-800 font-semibold">{pr.productDetails}</td>
                        <td className="p-3 text-center font-bold text-slate-900">{pr.quantity}</td>
                        <td className="p-3 text-slate-500">{formatDate(pr.createdDate, settings.dateFormat)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${pr.priority === "High" ? "bg-rose-50 text-rose-700 border-rose-100" :
                              pr.priority === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-green-50 text-green-700 border-green-100"
                            }`}>
                            {pr.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pr.status === "Approved" ? "bg-green-100 text-green-700" :
                              pr.status === "Rejected" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                            }`}>
                            {pr.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            {pr.status === "Pending Approval" && (
                              <>
                                <button
                                  onClick={() => handleApprovePr(pr.id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition"
                                  title="Approve Requisition"
                                >
                                  <Check size={14} className="stroke-[2.5]" />
                                </button>
                                <button
                                  onClick={() => handleRejectPr(pr.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
                                  title="Reject Requisition"
                                >
                                  <X size={14} className="stroke-[2.5]" />
                                </button>
                              </>
                            )}
                            {pr.status === "Approved" && (
                              <button
                                onClick={() => handleOpenRfqModal(pr)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                              >
                                <Send size={10} />
                                Create RFQ
                              </button>
                            )}
                            {pr.status === "Rejected" && <span className="text-[10px] text-slate-400 font-semibold">Archived</span>}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* 2. RFQ & COMPARISON TAB */}
        {/* ============================================================ */}
        <TabsContent value="Quotations ">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden p-6 space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-800">Request for Quotation (RFQ) & Comparative Bidding</h2>
              <p className="text-xs text-muted-foreground">RFQ tracks sent bids. Click "Compare Quotations" to review vendor pricing and select a supplier.</p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="p-3">RFQ Ref</th>
                    <th className="p-3">PR Source</th>
                    <th className="p-3">Material Requested</th>
                    <th className="p-3 text-center">Bidding Qty</th>
                    <th className="p-3">Sent Date</th>
                    <th className="p-3">Vendors Contacted</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRfqs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">No RFQs generated.</td>
                    </tr>
                  ) : (
                    filteredRfqs.map(rfq => (
                      <tr key={rfq.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{rfq.id}</td>
                        <td className="p-3 font-semibold text-blue-600">{rfq.prId}</td>
                        <td className="p-3 text-slate-800 font-bold">{rfq.productDetails}</td>
                        <td className="p-3 text-center font-bold text-slate-900">{rfq.quantity}</td>
                        <td className="p-3 text-slate-500">{formatDate(rfq.createdDate, settings.dateFormat)}</td>
                        <td className="p-3 text-slate-600 font-semibold">{rfq.selectedVendors.join(", ")}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rfq.status === "Closed" ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"
                            }`}>
                            {rfq.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {rfq.status !== "Closed" ? (
                            <button
                              onClick={() => handleOpenCompareModal(rfq)}
                              className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition shadow-sm"
                            >
                              <Sliders size={10} />
                              Compare Quotes
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">PO Released</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* 3. PURCHASE ORDERS (PO) TAB */}
        {/* ============================================================ */}
        <TabsContent value=" Orders">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-800">Purchase Orders (PO) Management</h2>
                <p className="text-xs text-muted-foreground">Official corporate orders. ERP-style IDs auto-generated. Edit or delete POs, or click "Go To" on Draft POs to view full vendor details.</p>
              </div>
              <button
                onClick={() => handleOpenManualPoModal()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 transition cursor-pointer self-start sm:self-center shrink-0"
              >
                <Plus size={14} />
                Create Purchase Order
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Vendor Name</th>
                    <th className="p-3">Product Details</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Total Amount</th>
                    <th className="p-3">Created By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">No purchase orders listed.</td>
                    </tr>
                  ) : (
                    filteredPos.map(po => {
                      const isHighlighted = po.id === highlightPoId;
                      return (
                        <tr
                          key={po.id}
                          className={`transition-all duration-1000 ${isHighlighted
                              ? "bg-indigo-50/90 border-indigo-200 shadow-inner animate-pulse duration-1000"
                              : "hover:bg-slate-50/50"
                            }`}
                        >
                          <td className="p-3 font-bold text-indigo-700">{po.id}</td>
                          <td className="p-3 font-bold text-slate-800">{po.vendorName}</td>
                          <td className="p-3 text-slate-700 font-semibold max-w-[180px] truncate">{po.productName}</td>
                          <td className="p-3 text-center font-bold text-slate-900">{po.quantity}</td>
                          <td className="p-3 text-right font-black text-indigo-600">{currencySymbol}{po.grandTotal.toLocaleString()}</td>
                          <td className="p-3 text-slate-600 font-semibold">{po.createdBy}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${po.status === "Closed" ? "bg-slate-100 text-slate-500" :
                                po.status === "Sent to Vendor" ? "bg-blue-100 text-blue-700" :
                                  po.status === "Approved" ? "bg-green-100 text-green-700" :
                                    po.status === "Draft" ? "bg-violet-100 text-violet-700" :
                                      "bg-amber-100 text-amber-700"
                              }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center items-center gap-1.5 flex-wrap">
                              {/* Draft → Go To button */}
                              {po.status === "Draft" && (
                                <button
                                  onClick={() => navigate("/procurement/vendor", { state: { po } })}
                                  className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                                  title="Go To Vendor Dashboard"
                                >
                                  <ExternalLink size={10} />
                                  Go To
                                </button>
                              )}

                              {/* Workflow buttons */}
                              {po.status === "Pending Approval" && (
                                <button
                                  onClick={() => handleApprovePo(po.id)}
                                  className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                                >
                                  <Check size={10} className="stroke-[2.5]" />
                                  Approve
                                </button>
                              )}
                              {po.status === "Approved" && (
                                <button
                                  onClick={() => handleSendPoToVendor(po.id)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                                >
                                  <Send size={10} />
                                  Send
                                </button>
                              )}
                              {po.status === "Sent to Vendor" && (
                                <button
                                  onClick={() => handleOpenGrnModal(po)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                                >
                                  <Plus size={10} />
                                  GRN
                                </button>
                              )}
                              {po.status === "Closed" && (
                                <span className="text-[10px] text-slate-400 font-semibold">Received</span>
                              )}

                              {/* Edit button — always visible */}
                              <button
                                onClick={() => handleOpenEditPo(po)}
                                className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-700 rounded-lg transition border border-slate-200 hover:border-blue-300"
                                title="Edit Purchase Order"
                              >
                                <Edit size={11} />
                              </button>

                              {/* Delete button — always visible */}
                              <button
                                onClick={() => handleOpenDeletePo(po.id)}
                                className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg transition border border-slate-200 hover:border-red-300"
                                title="Delete Purchase Order"
                              >
                                <Trash2 size={11} />
                              </button>
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
        </TabsContent>

        {/* ============================================================ */}
        {/* 4. INVOICES & PAYMENTS TAB */}
        {/* ============================================================ */}
        <TabsContent value="Finance">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden p-6 space-y-6">
            {/* Invoices List */}
            <div className="space-y-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Vendor Invoices</h2>
                <p className="text-xs text-muted-foreground">3-way matching validation: Invoices can only be verified after a matching GRN exists (matching quantities and vendors).</p>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="p-3">Invoice Number</th>
                      <th className="p-3">PO Reference</th>
                      <th className="p-3">GRN Reference</th>
                      <th className="p-3">Vendor Name</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">No invoices.</td>
                      </tr>
                    ) : (
                      filteredInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{inv.id}</td>
                          <td className="p-3 font-semibold text-blue-600">{inv.poId}</td>
                          <td className="p-3 text-slate-500 font-bold">{inv.grnId || "Awaiting Reception"}</td>
                          <td className="p-3 font-bold text-slate-800">{inv.vendorName}</td>
                          <td className="p-3 text-slate-500">{formatDate(inv.dueDate, settings.dateFormat)}</td>
                          <td className="p-3 text-right font-black text-indigo-600">{currencySymbol}{inv.amount.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${inv.status === "Paid" ? "bg-green-100 text-green-700 border border-green-200" :
                                inv.status === "Verified" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                                  "bg-amber-100 text-amber-700 border border-amber-200"
                              }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-1.5">
                              {inv.status === "Pending" && (
                                <button
                                  onClick={() => handleVerifyInvoice(inv)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                                >
                                  <Sliders size={10} />
                                  Verify GRN Match
                                </button>
                              )}
                              {inv.status === "Verified" && (
                                <button
                                  onClick={() => handleOpenPaymentModal(inv)}
                                  className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                                >
                                  <IndianRupee size={10} />
                                  Record Payment
                                </button>
                              )}
                              {inv.status === "Paid" && (
                                <span className="text-[10px] text-slate-400 font-semibold">Payment Settled</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments History */}
            <div className="space-y-3 pt-4 border-t">
              <div>
                <h2 className="text-base font-black text-slate-800">Recorded Payment Transmissions</h2>
                <p className="text-xs text-muted-foreground">Historical records of cash outflows and bank references.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="p-3">Payment ID</th>
                      <th className="p-3">Invoice Ref</th>
                      <th className="p-3">PO Reference</th>
                      <th className="p-3">Supplier Name</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Bank Reference</th>
                      <th className="p-3 text-right">Paid Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">No payment transaction records.</td>
                      </tr>
                    ) : (
                      payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{pay.id}</td>
                          <td className="p-3 font-semibold text-blue-600">{pay.invoiceId}</td>
                          <td className="p-3 text-slate-500 font-bold">{pay.poId}</td>
                          <td className="p-3 font-bold text-slate-800">{pay.vendorName}</td>
                          <td className="p-3 text-slate-500">{formatDate(pay.paymentDate, settings.dateFormat)}</td>
                          <td className="p-3 text-slate-600 font-bold">{pay.mode}</td>
                          <td className="p-3 text-slate-600 font-mono text-[10px]">{pay.bankRef}</td>
                          <td className="p-3 text-right font-black text-emerald-600">{currencySymbol}{pay.amount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* 5. AUDIT LOGS TAB */}
        {/* ============================================================ */}
        <TabsContent value="Logs">
          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-800">Operational Audit Logs</h2>
              <p className="text-xs text-muted-foreground">Every create, update, and approval action is chronologically recorded for ERP compliance.</p>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl border bg-slate-50 flex items-start justify-between gap-4 text-xs">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 font-bold">
                      {log.id.split("-")[1]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-normal">{log.action}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        Operated by: <span className="text-slate-600">{log.user}</span> ({log.role.toUpperCase()})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                    {(() => {
                      const parts = log.timestamp.split(" ");
                      if (parts.length >= 2) {
                        return `${formatDate(parts[0], settings.dateFormat)} ${parts.slice(1).join(" ")}`;
                      }
                      return formatDate(log.timestamp, settings.dateFormat);
                    })()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── MODALS SECTION ── */}

      {/* RFQ CREATION MODAL */}
      {showRfqModal && selectedPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-lg w-full space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Raise RFQ for {selectedPr.id}</h3>
                <p className="text-[11px] text-muted-foreground">Select vendors to request price quotations</p>
              </div>
              <button onClick={() => setShowRfqModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border text-xs font-semibold text-slate-600 space-y-1.5">
              <p><span className="text-slate-400">Material Requested:</span> {selectedPr.productDetails}</p>
              <p><span className="text-slate-400">Inspected Qty:</span> {selectedPr.quantity} units</p>
              <p><span className="text-slate-400">Department:</span> {selectedPr.department} ({selectedPr.requester})</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Vendors (Minimum 1) <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {STATIC_VENDORS.map((v) => {
                  const isChecked = selectedVendors.includes(v.name);
                  return (
                    <label key={v.name} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition ${isChecked ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white hover:bg-slate-50 text-slate-600"
                      }`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedVendors(selectedVendors.filter(name => name !== v.name));
                          } else {
                            setSelectedVendors([...selectedVendors, v.name]);
                          }
                        }}
                        className="rounded accent-blue-600"
                      />
                      <div>
                        <p className="font-extrabold">{v.name}</p>
                        <p className="text-[9px] text-slate-400 leading-none mt-0.5">{v.name.split(" ")[0]} Hub</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-3 border-t">
              <button
                onClick={() => setShowRfqModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRfq}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-50 flex items-center gap-1"
              >
                <Send size={12} />
                Send RFQ to Selected Vendors
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RFQ COMPARATIVE ANALYSIS SCREEN */}
      {showCompareModal && selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-4xl w-full space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Quotation Comparison Matrix - {selectedRfq.id}</h3>
                <p className="text-[11px] text-muted-foreground">Evaluating bids for {selectedRfq.productDetails} ({selectedRfq.quantity} qty)</p>
              </div>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <div className="overflow-x-auto rounded-xl border shadow-inner">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase border-b">
                    <th className="p-3">Vendor / Supplier</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-center">Delivery Days</th>
                    <th className="p-3 text-center">Warranty</th>
                    <th className="p-3">Payment Terms</th>
                    <th className="p-3 text-right">Total Amount</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {quotations.filter(q => q.rfqId === selectedRfq.id).map((quote) => (
                    <tr key={quote.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-black text-slate-800">{quote.vendorName}</p>
                        <p className="text-[9px] text-slate-400 leading-none mt-0.5">{quote.notes}</p>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">{currencySymbol}{quote.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-center font-extrabold text-blue-600">{quote.deliveryDays} Days</td>
                      <td className="p-3 text-center font-bold text-slate-700">{quote.warranty}</td>
                      <td className="p-3 text-slate-600 font-bold">{quote.paymentTerms}</td>
                      <td className="p-3 text-right font-black text-indigo-600 text-sm">{currencySymbol}{quote.totalAmount.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleSelectVendorQuote(quote)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition shadow-sm"
                        >
                          Select Vendor & Generate PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border rounded-2xl text-[11px] text-slate-500 font-semibold space-y-1">
              <p className="font-extrabold text-slate-700 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Comparative Selection Criteria Rules:
              </p>
              <p>1. Review delivery timelines and payment conditions before selecting the winning supplier bid.</p>
              <p>2. Selection locks vendor bid details and automatically constructs an authorized Draft Purchase Order (PO).</p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
              >
                Back to RFQ List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD GRN RECEIVING MODAL */}
      {showGrnModal && selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Generate GRN for {selectedPo.id}</h3>
                <p className="text-[11px] text-muted-foreground">Supplier: {selectedPo.vendorName}</p>
              </div>
              <button onClick={() => setShowGrnModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">Product Details</label>
                <div className="bg-slate-50 border p-2.5 rounded-xl font-extrabold text-slate-800">
                  {selectedPo.productName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="font-bold text-slate-700 mb-1">Ordered Quantity</label>
                  <div className="bg-slate-50 border p-2.5 rounded-xl font-bold text-slate-500">
                    {selectedPo.quantity} units
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-bold text-slate-700 mb-1">Received Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    max={selectedPo.quantity}
                    value={grnReceivedQty}
                    onChange={(e) => setGrnReceivedQty(parseInt(e.target.value) || 0)}
                    className="border p-2.5 rounded-xl font-extrabold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">Condition Notes / Packaging Check</label>
                <textarea
                  rows={2}
                  value={grnNotes}
                  onChange={(e) => setGrnNotes(e.target.value)}
                  className="border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-3 border-t">
              <button
                onClick={() => setShowGrnModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGrn}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-50"
              >
                Create Goods Receipt Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT TRANSACTION MODAL */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Record Payment - {selectedInvoice.id}</h3>
                <p className="text-[11px] text-muted-foreground">Supplier: {selectedInvoice.vendorName}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">Grand Total Invoice Outflow:</span>
                <span className="text-indigo-600 font-black text-base">{currencySymbol}{selectedInvoice.amount.toLocaleString()}</span>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">Transaction Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="border p-2.5 rounded-xl font-bold bg-white outline-none cursor-pointer focus:ring-2 focus:ring-green-500"
                >
                  <option value="NetBanking">Corporate NetBanking</option>
                  <option value="NEFT">NEFT / RTGS Transfer</option>
                  <option value="UPI">Authorized UPI Gateway</option>
                  <option value="Card">Corporate Credit Card</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">Bank Reference Ref-Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={bankRefCode}
                  onChange={(e) => setBankRefCode(e.target.value)}
                  className="border p-2.5 rounded-xl font-mono outline-none focus:ring-2 focus:ring-green-500 text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-3 border-t">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-green-50"
              >
                Authorize Settle Amount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD MANUAL PO MODAL */}
      {showManualPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-2xl w-full flex flex-col space-y-4 scale-in animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  Create Purchase Order Manually
                </h3>
                <p className="text-[11px] text-muted-foreground">Select a verified vendor-assigned material request to generate PO</p>
              </div>
              <button onClick={() => setShowManualPoModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            {vendorSelectedMrs.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-slate-500">No requests in "Vendor Selected" status found.</p>
                <p className="text-[10px] text-slate-400">Please go to Approvals, select an approval request and set a supplier first.</p>
                <button
                  onClick={() => setShowManualPoModal(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-semibold">

                {/* MR Selector Dropdown */}
                <div className="flex flex-col">
                  <label className="font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Reference Material Request <span className="text-red-500">*</span></label>
                  <select
                    value={selectedMrIdForPo}
                    onChange={(e) => handleMrSelectionChange(e.target.value)}
                    className="border p-2.5 rounded-xl font-bold bg-white outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                  >
                    {vendorSelectedMrs.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.referenceId} ({m.department}) - {m.productDetails} [{m.quantity} units]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pre-populated Vendor Card Reference */}
                {selectedMrIdForPo && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
                    <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Reference Vendor & Delivery Info</span>
                    {(() => {
                      const cachedMrVendors = localStorage.getItem("invenpro_mr_vendors");
                      let mapped = null;
                      if (cachedMrVendors) {
                        try {
                          mapped = JSON.parse(cachedMrVendors)[selectedMrIdForPo];
                        } catch { }
                      }
                      if (!mapped) {
                        return <p className="text-[10px] text-slate-400 font-bold">No mapped vendor, defaulting to system standard.</p>;
                      }
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase">Vendor Name</span>
                            <span className="font-black text-slate-800">{mapped.vendorName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase">Vendor Contact</span>
                            <span className="font-bold text-slate-800">{mapped.vendorContact}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[9px] text-slate-400 block font-bold uppercase">Delivery Address</span>
                            <span className="font-semibold text-slate-700">{mapped.vendorAddress}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price Config */}
                  <div className="flex flex-col">
                    <label className="font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Negotiated Item Unit Price ({currencySymbol})</label>
                    <input
                      type="number"
                      min="1"
                      value={manualPoPrice}
                      onChange={(e) => setManualPoPrice(Number(e.target.value))}
                      className="border p-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  {/* Expected Delivery Date */}
                  <div className="flex flex-col">
                    <label className="font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={manualPoExpectedDate}
                      onChange={(e) => setManualPoExpectedDate(e.target.value)}
                      className="border p-2.5 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 cursor-pointer"
                    />
                  </div>

                  {/* Payment Terms */}
                  <div className="flex flex-col">
                    <label className="font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Payment Terms</label>
                    <select
                      value={manualPoPaymentTerms}
                      onChange={(e) => setManualPoPaymentTerms(e.target.value)}
                      className="border p-2.5 rounded-xl font-bold bg-white outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="COD">Cash On Delivery (COD)</option>
                      <option value="Net 30">Net 30 Days Credit</option>
                      <option value="Net 15">Net 15 Days Credit</option>
                      <option value="Immediate">Immediate / UPI</option>
                    </select>
                  </div>
                </div>

                {/* Calculations Summary */}
                {selectedMrIdForPo && (
                  <div className="border-t pt-3 flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Total PO Value (GST 18% Incl.)</span>
                      {(() => {
                        const mr = vendorSelectedMrs.find(m => m._id === selectedMrIdForPo);
                        if (!mr) return null;
                        const qty = Number(mr.quantity) || 1;
                        const sub = qty * manualPoPrice;
                        const tax = Math.round(sub * 0.18);
                        return (
                          <div className="mt-1">
                            <span className="text-indigo-600 font-black text-lg">{currencySymbol}{(sub + tax).toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 font-semibold ml-2">(Subtotal: {currencySymbol}{sub.toLocaleString()} + Tax: {currencySymbol}{tax.toLocaleString()})</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex gap-2.5 justify-end pt-3 border-t">
                  <button
                    onClick={() => setShowManualPoModal(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmManualPo}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-indigo-100 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={12} className="stroke-[2.5]" />
                    Generate Purchase Order
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
      {/* ══════════════════════════════════════════════
          EDIT PO MODAL
      ══════════════════════════════════════════════ */}
      {showEditPoModal && editingPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Edit Purchase Order</p>
                <h3 className="text-white font-black text-lg">{editingPo.id}</h3>
              </div>
              <button onClick={() => { setShowEditPoModal(false); setEditingPo(null); }}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Vendor Name</label>
                  <input
                    type="text"
                    value={editPoForm.vendorName}
                    onChange={e => setEditPoForm(f => ({ ...f, vendorName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Product Details</label>
                  <input
                    type="text"
                    value={editPoForm.productName}
                    onChange={e => setEditPoForm(f => ({ ...f, productName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={editPoForm.quantity}
                    onChange={e => setEditPoForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Unit Price ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={editPoForm.unitPrice}
                    onChange={e => setEditPoForm(f => ({ ...f, unitPrice: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Expected Delivery</label>
                  <input
                    type="date"
                    value={editPoForm.expectedDeliveryDate}
                    onChange={e => setEditPoForm(f => ({ ...f, expectedDeliveryDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Status</label>
                  <select
                    value={editPoForm.status}
                    onChange={e => setEditPoForm(f => ({ ...f, status: e.target.value as POItem["status"] }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Sent to Vendor">Sent to Vendor</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Preview total */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Estimated Total (with 18% GST)</span>
                <span className="text-indigo-700 font-black text-sm">
                  {currencySymbol}{(editPoForm.quantity * editPoForm.unitPrice * 1.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button onClick={() => { setShowEditPoModal(false); setEditingPo(null); }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleSaveEditPo}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-blue-100 flex items-center gap-1.5">
                  <Save size={12} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          DELETE PO CONFIRMATION DIALOG
      ══════════════════════════════════════════════ */}
      {showDeleteConfirm && deletingPoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">Confirm Deletion</p>
                <h3 className="text-white font-black text-base">Delete Purchase Order</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-700 font-semibold text-sm">
                Are you sure you want to permanently delete <span className="font-black text-red-600">{deletingPoId}</span>?
              </p>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2.5">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 text-xs font-semibold">
                  This action cannot be undone. The Purchase Order will be permanently removed from the list.
                </p>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button onClick={() => { setShowDeleteConfirm(false); setDeletingPoId(null); }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleConfirmDeletePo}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-red-100 flex items-center gap-1.5">
                  <Trash2 size={12} />
                  Yes, Delete PO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Procurement;
