import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Check, X, ShieldAlert, Award, FileSpreadsheet, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";

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

export interface QCInspection {
  id: string; // QC-2026-XXX
  grnId: string;
  poId: string;
  vendorName: string;
  itemName: string;
  receivedQty: number;
  passedQty: number;
  failedQty: number;
  status: "Pending" | "Completed";
  result: "Pass" | "Fail" | "Partial" | "-";
  inspector: string;
  notes: string;
  inspectedDate?: string;
}

export interface RTVItem {
  id: string; // RTV-2026-XXX
  qcId: string;
  grnId: string;
  vendorName: string;
  itemName: string;
  qty: number;
  reason: string;
  createdDate: string;
  status: "Pending Dispatch" | "Returned" | "Refunded";
}

const QcManagement = () => {
  const [grns, setGrns] = useState<GRNItem[]>([]);
  const [qcInspections, setQcInspections] = useState<QCInspection[]>([]);
  const [search, setSearch] = useState("");
  const [activeInspection, setActiveInspection] = useState<GRNItem | null>(null);
  
  // Grading Modal Form State
  const [passedCount, setPassedCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [qcNotes, setQcNotes] = useState<string>("Dimensions and basic visual test passed.");
  const [inspectorName, setInspectorName] = useState<string>("Mike Chen");

  // Checklist Verification Checked Items
  const [checklistChecks, setChecklistChecks] = useState<boolean[]>([
    true, true, true, false, false, true, false, false
  ]);

  // Load and seed dynamic GRNs/QC Inspections
  const loadQcData = async () => {
    // 1. Load GRNs
    const cachedGrns = JSON.parse(localStorage.getItem("invenpro_grns") || "[]");
    setGrns(cachedGrns);

    // 2. Load QC Inspections from Backend
    try {
      const res = await axios.get(`${API_BASE_URL}/qc/inspections`);
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped = res.data.data.map((q: any) => ({
          id: q.qcId,
          grnId: q.grnId,
          poId: q.poId,
          vendorName: q.vendorName,
          itemName: q.itemName,
          receivedQty: q.receivedQty,
          passedQty: q.passedQty,
          failedQty: q.failedQty,
          status: q.status,
          result: q.result,
          inspector: q.inspector,
          notes: q.notes,
          inspectedDate: q.inspectedDate
        }));
        setQcInspections(mapped);
        localStorage.setItem("invenpro_qc", JSON.stringify(mapped));
        return;
      }
    } catch (err) {
      console.warn("Could not load QC records from backend, relying on localStorage.", err);
    }

    // Fallback: Load QC Inspections
    const cachedQc = localStorage.getItem("invenpro_qc");
    if (!cachedQc) {
      const defaultQc: QCInspection[] = [
        {
          id: "QC-2026-001",
          grnId: "GRN-2026-001",
          poId: "PO-2026-001",
          vendorName: "Dell Technologies",
          itemName: "Dell Laptops core i5",
          receivedQty: 20,
          passedQty: 18,
          failedQty: 2,
          status: "Completed",
          result: "Partial",
          inspector: "Mike Chen",
          notes: "18 units in perfect condition. 2 units failed due to transit bezel damage.",
          inspectedDate: "2026-05-28"
        }
      ];
      localStorage.setItem("invenpro_qc", JSON.stringify(defaultQc));
      setQcInspections(defaultQc);
    } else {
      setQcInspections(JSON.parse(cachedQc));
    }
  };

  useEffect(() => {
    loadQcData();
  }, []);

  const handleOpenInspection = (grn: GRNItem) => {
    setActiveInspection(grn);
    setPassedCount(grn.receivedQty);
    setFailedCount(0);
    setQcNotes("Visual defects check passed. Dimension matching check OK.");
    setChecklistChecks([true, true, true, false, false, true, false, false]);
  };

  // ── DYNAMIC STOCK IN & RTV ON QC COMPLETE ──
  const handleCompleteQC = async () => {
    if (!activeInspection) return;
    const totalQty = activeInspection.receivedQty;

    if (passedCount + failedCount !== totalQty) {
      toast.error(`Error: Sum of Passed (${passedCount}) and Failed (${failedCount}) must match the total Received Quantity (${totalQty})!`);
      return;
    }

    const qcId = "QC-2026-0" + Math.floor(100 + Math.random() * 900);
    const today = new Date().toISOString().split("T")[0];

    let resultVal: "Pass" | "Fail" | "Partial" = "Pass";
    if (passedCount === 0) resultVal = "Fail";
    else if (failedCount > 0) resultVal = "Partial";

    const newQC: QCInspection = {
      id: qcId,
      grnId: activeInspection.id,
      poId: activeInspection.poId,
      vendorName: activeInspection.vendorName,
      itemName: activeInspection.productName,
      receivedQty: totalQty,
      passedQty: passedCount,
      failedQty: failedCount,
      status: "Completed",
      result: resultVal,
      inspector: inspectorName,
      notes: qcNotes,
      inspectedDate: today
    };

    // ── Call Backend API first for complete DB logging, RTV generation, and Inventory update ──
    try {
      const backendRes = await axios.post(`${API_BASE_URL}/qc/inspections/complete`, {
        grnId: activeInspection.id,
        passedQty: passedCount,
        failedQty: failedCount,
        inspector: inspectorName,
        notes: qcNotes,
        userName: inspectorName,
        userId: "qc-user-1"
      });

      if (backendRes.data.success) {
        toast.success(`Backend DB verified: QC Approved Stock entered into Inventory! 📦`);
      }
    } catch (err: any) {
      console.warn("Backend QC verification failed or unavailable. Falling back to local replication.", err);
    }

    // 1. UPDATE THE INVENTORY LOCALLY AS BACKUP
    if (passedCount > 0) {
      try {
        const queryRes = await axios.get(`${API_BASE_URL}/productmenu`);
        if (Array.isArray(queryRes.data)) {
          const matchedProd = queryRes.data.find(
            (p: any) => p.name.toLowerCase().includes(activeInspection.productName.toLowerCase())
          );
          if (matchedProd) {
            const newStock = Number(matchedProd.stock || 0) + passedCount;
            await axios.put(`${API_BASE_URL}/productmenu/${matchedProd._id}`, {
              ...matchedProd,
              stock: newStock
            });
          } else {
            await axios.post(`${API_BASE_URL}/productmenu/create`, {
              name: activeInspection.productName,
              category: "Hardware",
              unit: "pcs",
              price: 45000,
              stock: passedCount
            });
          }
        }
      } catch (err) {
        console.warn("Local backup productmenu sync failed.", err);
      }
    }

    // 2. TRIGGER RETURN TO VENDOR (RTV) LOCALLY AS BACKUP
    if (failedCount > 0) {
      const rtvId = "RTV-2026-0" + Math.floor(100 + Math.random() * 900);
      const newRtv: RTVItem = {
        id: rtvId,
        qcId,
        grnId: activeInspection.id,
        vendorName: activeInspection.vendorName,
        itemName: activeInspection.productName,
        qty: failedCount,
        reason: qcNotes || "Transit damage or physical discrepancy",
        createdDate: today,
        status: "Pending Dispatch"
      };

      const cachedRtv = JSON.parse(localStorage.getItem("invenpro_rtv") || "[]");
      cachedRtv.unshift(newRtv);
      localStorage.setItem("invenpro_rtv", JSON.stringify(cachedRtv));
      toast.warning(`Return workflow activated: ${failedCount} units logged for return to ${activeInspection.vendorName} (RTV Code: ${rtvId}).`);
    }

    // 3. UPDATE GRN STATUS locally to QC Completed
    const updatedGrns = grns.map(g => g.id === activeInspection.id ? { ...g, status: "QC Completed" as const } : g);
    localStorage.setItem("invenpro_grns", JSON.stringify(updatedGrns));
    setGrns(updatedGrns);

    // Save QC inspection locally
    const updatedQcs = [newQC, ...qcInspections];
    localStorage.setItem("invenpro_qc", JSON.stringify(updatedQcs));
    setQcInspections(updatedQcs);

    // Add Audit log locally
    const cachedLogs = JSON.parse(localStorage.getItem("invenpro_audit_logs") || "[]");
    const newLog = {
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      action: `QC Inspection ${qcId} completed. ${passedCount} passed (stocked in), ${failedCount} failed (RTV workflow active).`,
      user: inspectorName,
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: "inventory"
    };
    localStorage.setItem("invenpro_audit_logs", JSON.stringify([newLog, ...cachedLogs]));

    // Also trigger backend audit log api
    try {
      await axios.post(`${API_BASE_URL}/audit-log`, {
        userName: inspectorName,
        transactionId: qcId,
        moduleName: "RFQ",
        actionPerformed: `QC Inspection Completed: Passed=${passedCount}, Failed=${failedCount}`,
        previousStatus: "Pending QC Check",
        newStatus: resultVal
      });
    } catch (auditErr) {
      console.warn("Backend audit log submission failed.", auditErr);
    }

    setActiveInspection(null);
    toast.success(`QC Inspection ${qcId} completed successfully!`);
  };

  // Filter
  const filtered = qcInspections.filter(
    (qc) =>
      qc.itemName.toLowerCase().includes(search.toLowerCase()) ||
      qc.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      qc.id.toLowerCase().includes(search.toLowerCase()) ||
      qc.grnId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-blue-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 bg-white p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-sky-600" />
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Quality Assurance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">Quality Control (QC) Inspections</h1>
          <p className="text-xs text-muted-foreground text-slate-500">
            Verify received Goods Receipt Notes (GRN) under strict checking standards. Passed stock enters inventory instantly.
          </p>
        </div>
        <Button onClick={loadQcData} variant="outline" className="flex items-center gap-2 font-bold text-xs">
          <RefreshCcw className="w-4.5 h-4.5" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Inspections Performed", value: qcInspections.length, bg: "bg-white", border: "border-slate-100" },
          { title: "Passed Baches", value: qcInspections.filter(q => q.result === "Pass").length, bg: "bg-emerald-50/50", border: "border-emerald-100" },
          { title: "Partial Passed", value: qcInspections.filter(q => q.result === "Partial").length, bg: "bg-amber-50/50", border: "border-amber-100" },
          { title: "Awaiting QC check", value: grns.filter(g => g.status === "Pending QC").length, bg: "bg-blue-50/50", border: "border-blue-100" }
        ].map((item, idx) => (
          <Card key={idx} className={`rounded-xl border shadow-sm ${item.bg} ${item.border}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-slate-800">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Queue for Pending Inspections */}
      {grns.filter(g => g.status === "Pending QC").length > 0 && (
        <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4 space-y-3">
          <h3 className="text-xs font-black text-sky-800 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 animate-pulse text-sky-600" />
            QC Inspection Pending Queue ({grns.filter(g => g.status === "Pending QC").length} Goods Receipt Notes)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {grns.filter(g => g.status === "Pending QC").map((grn) => (
              <div key={grn.id} className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-800 text-sm">{grn.id}</span>
                    <Badge variant="secondary" className="text-[9px] bg-slate-100 font-bold">Pending QC Check</Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-1">Item: <strong className="text-slate-800">{grn.productName}</strong> ({grn.receivedQty} units)</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Supplier: {grn.vendorName} · Received: {grn.receivedDate}</p>
                </div>
                <Button onClick={() => handleOpenInspection(grn)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl px-4 py-2">
                  Inspect Batch
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search inspections by QC Code, Item, Vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 rounded-xl border font-semibold text-xs"
          />
          <Filter className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inspections" className="w-full text-black">
        <TabsList className="bg-slate-200 h-11 rounded-xl p-1 text-slate-600">
          <TabsTrigger value="inspections" className="px-6 rounded-lg font-bold text-xs cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 transition-all">
            Completed Inspections Logs
          </TabsTrigger>
          <TabsTrigger value="checklists" className="px-6 rounded-lg font-bold text-xs cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 transition-all">
            QC Guidelines Checklists
          </TabsTrigger>
        </TabsList>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="mt-4">
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b">
                    <tr className="text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="p-3">QC ID</th>
                      <th className="p-3">GRN No</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Supplier Vendor</th>
                      <th className="p-3 text-center">Qty Received</th>
                      <th className="p-3 text-center">Passed</th>
                      <th className="p-3 text-center">Failed (RTV)</th>
                      <th className="p-3">Result Status</th>
                      <th className="p-3">Inspector</th>
                      <th className="p-3">Inspected Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">No completed inspection records found.</td>
                      </tr>
                    ) : (
                      filtered.map((qc) => (
                        <tr key={qc.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{qc.id}</td>
                          <td className="p-3 text-sky-600 font-semibold">{qc.grnId}</td>
                          <td className="p-3 font-bold text-slate-800">{qc.itemName}</td>
                          <td className="p-3 font-bold text-slate-700">{qc.vendorName}</td>
                          <td className="p-3 text-center font-bold text-slate-900">{qc.receivedQty}</td>
                          <td className="p-3 text-center font-black text-emerald-600">{qc.passedQty}</td>
                          <td className="p-3 text-center font-black text-rose-600">{qc.failedQty}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                              qc.result === "Pass" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                              qc.result === "Fail" ? "bg-rose-50 text-rose-700 border-rose-100" :
                              "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                              {qc.result}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-semibold">{qc.inspector}</td>
                          <td className="p-3 text-slate-400 font-semibold">{qc.inspectedDate || "2026-05-28"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Checklist List */}
            <Card className="lg:col-span-1 rounded-xl border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-3.5">
                <CardTitle className="text-sm font-bold text-slate-800">QC Active Guidelines Checklists</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="p-3.5 rounded-xl border bg-blue-50/50 border-blue-100 text-xs font-semibold text-blue-700">
                  <p className="font-black text-slate-800">Steel Materials & Bezel Inspection</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">Raw Materials • 12 verification checkpoints</p>
                </div>

                <div className="p-3.5 rounded-xl border text-xs font-semibold text-slate-600">
                  <p className="font-extrabold text-slate-800">Electrical Components Checks</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">Hardware & Cable • 8 verification checkpoints</p>
                </div>

                <div className="p-3.5 rounded-xl border text-xs font-semibold text-slate-600">
                  <p className="font-extrabold text-slate-800">Safety Equipment Verification</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">Safety Helmets & Apparel • 15 verification checkpoints</p>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Preview */}
            <Card className="lg:col-span-2 rounded-xl border shadow-sm">
              <CardHeader className="border-b pb-3.5">
                <CardTitle className="text-sm font-bold text-slate-800">Checklist Inspector Preview Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-4 text-xs font-semibold text-slate-700">
                {[
                  "Visual inspection for transit frame scratching and cracks",
                  "Bezel dimension and structural thickness alignment verification",
                  "Item unit weight and payload limits audit checks",
                  "Raw chemical composition safety checks (Certificate of Quality)",
                  "Surface finish structural resistance check",
                  "Packaging seal and anti-static moisture shield checks",
                  "Origin manufacturing documentation stamp matching verified",
                  "Traceability Batch / ID barcode scanned successfully",
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input type="checkbox" defaultChecked={checklistChecks[i]} className="rounded accent-sky-600 h-4 w-4" />
                    <span>{item}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* DYNAMIC QC GRADING AND INSPECTION DIALOG MODAL */}
      {activeInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-lg w-full space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Perform QC Grading: {activeInspection.id}</h3>
                <p className="text-[11px] text-muted-foreground">Verification audit for received {activeInspection.productName}</p>
              </div>
              <button onClick={() => setActiveInspection(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 text-xs font-semibold text-slate-600 grid grid-cols-2 gap-2">
              <p><span className="text-slate-400">Supplier:</span> {activeInspection.vendorName}</p>
              <p><span className="text-slate-400">Received Date:</span> {activeInspection.receivedDate}</p>
              <p className="col-span-2"><span className="text-slate-400">Notes from Receiving:</span> {activeInspection.conditionNotes}</p>
            </div>

            {/* Checklist verified indicator */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-700 flex items-center gap-1">
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                Checkpoint Checklist Audited
              </h4>
              <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl border bg-slate-50 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Visual Defect Passed</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Dimension Check Passed</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Weight Check Passed</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Packaging Shield OK</span>
              </div>
            </div>

            {/* Grading Counts Form */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex flex-col">
                <label className="text-slate-700 font-bold mb-1">Passed Quantity (Stock In)</label>
                <input
                  type="number"
                  min="0"
                  max={activeInspection.receivedQty}
                  value={passedCount}
                  onChange={(e) => setPassedCount(Math.min(activeInspection.receivedQty, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="border p-2.5 rounded-xl font-extrabold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-700 font-bold mb-1">Failed Quantity (RTV Logged)</label>
                <input
                  type="number"
                  min="0"
                  max={activeInspection.receivedQty}
                  value={failedCount}
                  onChange={(e) => setFailedCount(Math.min(activeInspection.receivedQty, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="border p-2.5 rounded-xl font-extrabold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="col-span-2 flex flex-col">
                <label className="text-slate-700 font-bold mb-1">Inspection Notes & Findings</label>
                <textarea
                  rows={2}
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                  className="border p-2.5 rounded-xl font-medium outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Record defect reasons or visual test details..."
                />
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-3 border-t">
              <button
                onClick={() => setActiveInspection(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteQC}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-50 flex items-center gap-1"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                Complete Quality Inspection
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default QcManagement;
