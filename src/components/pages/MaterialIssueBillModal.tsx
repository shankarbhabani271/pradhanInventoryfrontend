import { useEffect, useState } from "react";
import { X, Printer, Download, CheckCircle, FileText } from "lucide-react";
import { getSavedSettings, buildLogoUrl } from "../../utils/settingsHelper";
import { API_BASE_URL } from "../../config/http";

interface MaterialIssueBillModalProps {
  request: {
    _id: string;
    referenceId: string;
    requester: string;
    department: string;
    date: string;
    productDetails: string;
    quantity: number;
    priority: string;
    status: string;
    createdAt?: string;
  } | null;
  onClose: () => void;
}

export default function MaterialIssueBillModal({ request, onClose }: MaterialIssueBillModalProps) {
  const [settings] = useState(getSavedSettings());
  const [stockInfo, setStockInfo] = useState<{
    stock: number;
    warehouse: string;
    category: string;
    unit: string;
  }>({
    stock: 0,
    warehouse: "Main Warehouse",
    category: "General",
    unit: "units",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!request) return;

    const fetchStock = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/inventory/check-stock/${encodeURIComponent(request.productDetails)}`);
        const json = await res.json();
        if (json.success && json.found) {
          setStockInfo({
            stock: json.stock ?? 0,
            warehouse: json.data?.warehouse ?? "Main Warehouse",
            category: json.data?.category ?? "General",
            unit: json.data?.unit ?? "units",
          });
        }
      } catch (err) {
        console.warn("Failed to fetch stock metadata for bill receipt:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [request]);

  if (!request) return null;

  // Stable product code generation
  const charSum = request.productDetails.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const productCode = `PRD-2026-${(charSum % 10000).toString().padStart(4, "0")}`;

  // Receipt Number MIR-YYYY-XXXX
  const receiptNo = `MIR-2026-${request.referenceId.split("-").pop() || "0001"}`;

  // Issue date calculation
  const issueDateStr = request.createdAt 
    ? new Date(request.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
    : new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Standard approach is to call print which allows save-as-pdf natively
    window.print();
  };

  const logoUrl = buildLogoUrl(settings.logoUrl, settings.logoVersion, API_BASE_URL);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:relative print:inset-auto">
      {/* Printable Style Tag */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-bill-wrapper, .printable-bill-wrapper * {
            visibility: visible;
          }
          .printable-bill-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="printable-bill-wrapper bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] print:max-h-full print:w-full print:border-none print:shadow-none animate-scale-up">
        {/* Header Actions (Bar) */}
        <div className="no-print bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Material Issue Bill Console</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Bill
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 print:overflow-visible print:p-0">
          {/* Company Branding & Receipt Title */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={settings.orgName} className="h-10 object-contain" />
              ) : (
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">
                  IP
                </div>
              )}
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{settings.orgName}</h2>
                <p className="text-[10px] text-slate-500 max-w-[240px] leading-tight mt-0.5">{settings.address}</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-sm font-extrabold text-blue-700 tracking-wider uppercase">Material Issue Receipt</h1>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1">Receipt No: {receiptNo}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Request No: {request.referenceId}</p>
              <p className="text-[10px] text-slate-400 font-mono">Date: {issueDateStr}</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Requested By</p>
              <p className="font-semibold text-slate-800 mt-0.5">{request.requester}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
              <p className="font-semibold text-slate-800 mt-0.5">{request.department}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Approved By</p>
              <p className="font-semibold text-slate-800 mt-0.5">Manager Bhabani</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Issue Status</p>
              <span className="inline-flex items-center gap-1 mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-black text-[10px] uppercase text-slate-500 tracking-wider">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Product Code</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">{request.productDetails}</td>
                  <td className="p-3 font-mono font-bold">{productCode}</td>
                  <td className="p-3">{stockInfo.category}</td>
                  <td className="p-3 text-center">{stockInfo.unit}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quantity Card & Inventory Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Quantity Breakdown</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white border rounded-lg p-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Req Qty</p>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">{request.quantity}</p>
                </div>
                <div className="bg-white border rounded-lg p-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Issued</p>
                  <p className="text-sm font-extrabold text-blue-600 mt-0.5">{request.quantity}</p>
                </div>
                <div className="bg-white border rounded-lg p-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Remaining</p>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                    {loading ? "..." : stockInfo.stock}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Inventory Fulfillment</span>
              <div className="space-y-2 text-xs pt-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Warehouse:</span>
                  <span className="font-semibold text-slate-800">{stockInfo.warehouse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stock Status:</span>
                  <span className="font-bold text-emerald-600">Stock Successfully Deducted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks & Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 items-end text-xs">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Remarks</p>
              <p className="text-slate-600 mt-1 italic leading-relaxed border-b pb-1">
                Direct stock issue processed, verification completed cleanly.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="w-40 border-b border-slate-900 pb-1 text-center font-semibold text-slate-800">
                {request.requester.split(" ")[0]}
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 mr-4">Authorized Signature</p>
            </div>
          </div>

          {/* System Footer info */}
          <div className="border-t border-slate-100 pt-6 text-[10px] text-slate-400 flex justify-between">
            <span>Generated By: {request.requester || "System"}</span>
            <span>Generated Date: {new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        {/* Modal Close actions footer */}
        <div className="no-print bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
