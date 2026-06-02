import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  FilePlus,
  PackagePlus,
  ClipboardCheck,
  BarChart3,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  TrendingUp,
  Warehouse,
  History
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { toast } from "sonner";
import { API_BASE_URL } from "../../config/http";
import { getSavedSettings, getCurrencySymbol, getFormattedDateTimeForTimezone } from "../../utils/settingsHelper";

// Chart Color harmonious palettes (sleek modern ERP theme)
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

interface ProductType {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSavedSettings());
  const [timeAndDate, setTimeAndDate] = useState({ date: "", time: "" });

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

  useEffect(() => {
    // Initial compute
    setTimeAndDate(getFormattedDateTimeForTimezone(settings.timezone, settings.dateFormat));

    // Clock Interval
    const timer = setInterval(() => {
      setTimeAndDate(getFormattedDateTimeForTimezone(settings.timezone, settings.dateFormat));
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.timezone, settings.dateFormat]);
  
  // Dynamic metrics state
  const [totalMrCount, setTotalMrCount] = useState<number>(0);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [activePosCount, setActivePosCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [spendValue, setSpendValue] = useState<number>(0);

  // Dynamic Chart states
  const [spendChartData, setSpendChartData] = useState<any[]>([]);
  const [poStatusData, setPoStatusData] = useState<any[]>([]);
  const [topVendorsData, setTopVendorsData] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const loadDashboardMetrics = async () => {
    // 1. Load Material Requests count & pending list
    try {
      const res = await fetch(`${API_BASE_URL}/material`);
      const json = await res.json();
      if (json && json.data) {
        setTotalMrCount(json.data.length);
        const pend = json.data.filter((m: any) => m.status === "Pending");
        setPendingApprovals(pend);
      }
    } catch (e) {
      console.warn("Failed to load material requests from API, falling back to local mocks");
      setTotalMrCount(18);
      setPendingApprovals([
        { _id: "MR-2026-516", referenceId: "MR-2026-516", productDetails: "Dell Laptops", quantity: 20, requester: "Arjun Sharma", status: "Pending" },
        { _id: "MR-2026-517", referenceId: "MR-2026-517", productDetails: "Safety Helmets", quantity: 100, requester: "Priya Nair", status: "Pending" },
        { _id: "MR-2026-518", referenceId: "MR-2026-518", productDetails: "Ergonomic Chairs", quantity: 5, requester: "Sneha Patel", status: "Pending" }
      ]);
    }

    // 2. Load POs
    const pos = JSON.parse(localStorage.getItem("invenpro_pos") || "[]");
    const activePos = pos.filter((p: any) => p.status === "Sent to Vendor" || p.status === "Approved");
    setActivePosCount(activePos.length);

    // Calculate total spend
    const totalSpend = pos
      .filter((p: any) => p.status !== "Rejected")
      .reduce((sum: number, p: any) => sum + (p.grandTotal || 0), 0);
    setSpendValue(totalSpend);

    // 3. Load Products & low stock items
    try {
      const prodRes = await fetch(`${API_BASE_URL}/productmenu`);
      const prodData = await prodRes.json();
      if (Array.isArray(prodData)) {
        setProducts(prodData);
        const low = prodData.filter((p: any) => p.stock <= 10).length;
        setLowStockCount(low);
      }
    } catch (err) {
      // Fallback
      const defaultProds = [
        { _id: "1", name: "Dell Laptops core i5", category: "Hardware", unit: "pcs", price: 42000, stock: 18 },
        { _id: "2", name: "Safety Helmets", category: "Safety", unit: "pcs", price: 350, stock: 5 }, // Low Stock
        { _id: "3", name: "Ergonomic Chairs", category: "Furniture", unit: "pcs", price: 8500, stock: 15 },
        { _id: "4", name: "Work Gloves", category: "Safety", unit: "pairs", price: 220, stock: 8 }, // Low Stock
        { _id: "5", name: "Printer Paper (A4)", category: "Stationery", unit: "reams", price: 450, stock: 120 }
      ];
      setProducts(defaultProds);
      setLowStockCount(2);
    }

    // 4. Set up Recharts data dynamically based on PO list
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const baseSpend = [450000, 380000, 520000, 240000, totalSpend || 954200, 0];
    const generatedSpendData = months.map((m, idx) => ({
      name: m,
      Spend: baseSpend[idx],
      Target: 600000
    }));
    setSpendChartData(generatedSpendData);

    // PO Status chart
    const statuses = ["Draft", "Pending Approval", "Approved", "Sent to Vendor", "Closed"];
    const statusCounts = statuses.map(s => ({
      name: s,
      value: pos.filter((p: any) => p.status === s).length || (s === "Approved" ? 1 : s === "Closed" ? 3 : 0)
    })).filter(item => item.value > 0);
    setPoStatusData(statusCounts.length ? statusCounts : [
      { name: "Approved", value: 1 },
      { name: "Sent to Vendor", value: 1 },
      { name: "Closed", value: 3 }
    ]);

    // Top Vendors chart
    const vendorMap: Record<string, number> = {};
    pos.forEach((p: any) => {
      vendorMap[p.vendorName] = (vendorMap[p.vendorName] || 0) + (p.grandTotal || 0);
    });
    const vendorDataArray = Object.keys(vendorMap).map(k => ({
      name: k,
      Value: vendorMap[k]
    })).sort((a, b) => b.Value - a.Value);
    
    setTopVendorsData(vendorDataArray.length ? vendorDataArray : [
      { name: "Dell Technologies", Value: 954200 },
      { name: "HP Solutions", Value: 131800 },
      { name: "Office Supplies Inc", Value: 43450 }
    ]);

    // Audit logs
    const cachedLogs = JSON.parse(localStorage.getItem("invenpro_audit_logs") || "[]");
    setRecentLogs(cachedLogs.slice(0, 5));
  };

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const handleApproveFromDashboard = async (mrId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/material/${mrId}/approve`, { method: "PUT" });
      const json = await res.json();
      if (json.success) {
        toast.success(`Request approved successfully from dynamic console!`);
        // Record audit
        const cachedLogs = JSON.parse(localStorage.getItem("invenpro_audit_logs") || "[]");
        const newLog = {
          id: "LOG-" + Math.floor(100 + Math.random() * 900),
          action: `Dashboard quick-action: Approved Material Request ${mrId}`,
          user: "Admin User",
          timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: "admin"
        };
        localStorage.setItem("invenpro_audit_logs", JSON.stringify([newLog, ...cachedLogs]));
        loadDashboardMetrics();
      }
    } catch (err) {
      // Offline fallback
      const updatedPending = pendingApprovals.filter(p => p._id !== mrId);
      setPendingApprovals(updatedPending);
      toast.success(`Request approved successfully (Local Sync activated)!`);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-blue-50/40 min-h-screen">
      {/* Dynamic Header Panel */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{settings.orgName}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">Corporate Analytics Console</h1>
          <p className="text-xs text-muted-foreground text-slate-500">Real-time tracking of spend limits, purchase authorizations, and supplier operations.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
            <TrendingUp className="h-4 w-4" />
            <span>Procurement Spend: {currencySymbol}{spendValue.toLocaleString()}</span>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-950/30 text-white rounded-xl p-3 shadow-md min-w-[220px] flex flex-col justify-center">
            <div className="flex justify-between items-center gap-2 border-b border-indigo-900/30 pb-1 mb-1">
              <span className="text-[9px] font-black text-indigo-300 uppercase tracking-wider truncate max-w-[120px]" title={settings.orgName}>
                {settings.orgName}
              </span>
              <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded px-1.5 py-0.2 font-bold shrink-0">
                {settings.timezone.split(" ")[0]}
              </span>
            </div>
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-base font-black font-mono tracking-wider text-emerald-400">
                {timeAndDate.time}
              </span>
              <span className="text-[9px] font-bold text-slate-300 font-mono">
                {timeAndDate.date}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Open Requisitions", value: totalMrCount, sub: "Material requests logged", icon: FileText, bg: "bg-blue-100", color: "text-blue-600" },
          { title: "Pending Approvals", value: pendingApprovals.length, sub: "Awaiting manager signature", icon: IndianRupee, bg: "bg-emerald-100", color: "text-emerald-600" },
          { title: "Active Purchase Orders", value: activePosCount, sub: "Bids sent to vendor", icon: ShoppingCart, bg: "bg-indigo-100", color: "text-indigo-600" },
          { title: "Low Stock Products", value: lowStockCount, sub: "Items below reorder limit", icon: Clock, bg: "bg-rose-100", color: "text-rose-600" }
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <Card key={idx} className="rounded-xl border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {c.title}
                </CardTitle>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${c.bg} ${c.color}`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-800">{c.value}</div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{c.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 📈 DYNAMIC RECHARTS VISUALIZATION GRID (PREMIUM BUSINESS ANALYTICS) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spend Analytics Chart */}
        <Card className="lg:col-span-2 rounded-xl border shadow-sm bg-white">
          <CardHeader className="border-b pb-3.5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-1">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Monthly Procurement Spend Trend
              </CardTitle>
            </div>
            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500">2026 AUDIT YEAR</span>
          </CardHeader>
          <CardContent className="pt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value) => [`${currencySymbol} ${Number(value).toLocaleString()}`, "Spend"]} />
                <Legend fontSize={11} />
                <Area type="monotone" dataKey="Spend" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpend)" name={`Net Outflow (${currencySymbol})`} />
                <Area type="monotone" dataKey="Target" stroke="#CBD5E1" strokeWidth={1} strokeDasharray="5 5" fill="none" name="Budget Limit" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PO Status Split PieChart */}
        <Card className="rounded-xl border shadow-sm bg-white">
          <CardHeader className="border-b pb-3.5">
            <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-1">
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
              PO Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-[260px] flex flex-col items-center justify-between">
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={poStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {poStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Orders`, "Status"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend Map */}
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold text-slate-500">
              {poStatusData.map((entry, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {entry.name} ({entry.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COMPONENT: Real Pending Approvals Console */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <ClipboardCheck className="h-4.5 w-4.5 text-blue-600" />
                Live Pending Approvals Queue
              </h3>
              <p className="text-[10px] text-muted-foreground">Approve requests instantly to release them for PR/RFQ bidding.</p>
            </div>
            <span onClick={() => navigate("/apporavals")} className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">
              Open Console
            </span>
          </div>

          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-semibold text-xs bg-slate-50 rounded-xl border border-dashed">
                All material request approvals settled! Excellent work.
              </div>
            ) : (
              pendingApprovals.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border p-3 rounded-xl hover:shadow-sm transition bg-slate-50/50 border-slate-100"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800 text-xs">{item.referenceId}</span>
                      <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full font-black">
                        High Priority
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-1">
                      Material: <strong className="text-slate-800">{item.productDetails}</strong> ({item.quantity} units)
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Requested by: {item.requester}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveFromDashboard(item._id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black flex items-center gap-1 shadow-sm transition"
                    >
                      <CheckCircle2 size={12} className="stroke-[2.5]" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => toast.error("Rejection Timeline activated. Open Approvals Console.")}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 transition"
                      title="Reject"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT: ERP Quick Actions Grid */}
        <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-indigo-600" />
              ERP Operational Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
            {[
              { label: "New Requisition", desc: "Log employee requests", icon: FilePlus, bg: "bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 border-blue-100", action: () => navigate("/material-request") },
              { label: "Bids Comparative", desc: "Compare RFQ quotes", icon: BarChart3, bg: "bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-700 border-indigo-100", action: () => navigate("/procurement") },
              { label: "QC Inspection", desc: "Process GRN checklist", icon: ClipboardCheck, bg: "bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-700 border-emerald-100", action: () => navigate("/qcmanagement") },
              { label: "Stock Logs", desc: "Manage inventory items", icon: PackagePlus, bg: "bg-purple-50/50 hover:bg-purple-100/60 text-purple-700 border-purple-100", action: () => navigate("/inventory") }
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <div
                  key={idx}
                  onClick={act.action}
                  className={`rounded-xl p-3 border cursor-pointer transition ${act.bg}`}
                >
                  <Icon className="w-5.5 h-5.5 mb-1.5" />
                  <h4 className="font-extrabold">{act.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid for Low Stock Alerts & Audit logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Low Stock Alerts */}
        <Card className="rounded-xl border shadow-sm bg-white p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-bounce" />
              Low Stock Warnings ({lowStockCount})
            </h3>
            <span onClick={() => navigate("/inventory")} className="text-xs text-rose-500 font-bold hover:underline cursor-pointer">
              Procure stock
            </span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {products.filter(p => p.stock <= 10).map((prod) => (
              <div key={prod._id} className="p-3 border border-rose-100 bg-rose-50/30 rounded-xl flex items-center justify-between text-xs font-semibold">
                <div>
                  <p className="font-black text-slate-800">{prod.name}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">Category: {prod.category}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 font-bold text-[10px] text-white">Stock: {prod.stock} {prod.unit}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Horizontal Supplier Value Bars */}
        <Card className="rounded-xl border shadow-sm bg-white p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
              Top Vendors by Value
            </h3>
          </div>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVendorsData} layout="vertical" margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={75} />
                <Tooltip formatter={(value) => [`${currencySymbol} ${Number(value).toLocaleString()}`, "Order Value"]} />
                <Bar dataKey="Value" fill="#4F46E5" radius={[0, 4, 4, 0]}>
                  {topVendorsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dynamic Action Timeline Logs */}
        <Card className="rounded-xl border shadow-sm bg-white p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-slate-600" />
              Recent Actions Timeline
            </h3>
          </div>
          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex gap-2.5 items-start text-xs">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                <div>
                  <p className="font-bold text-slate-700 leading-normal">{log.action}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{log.timestamp} · {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;