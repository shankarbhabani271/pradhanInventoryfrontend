import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/http";
import MaterialIssueBillModal from "./MaterialIssueBillModal";

interface MaterialData {
  _id: string;
  referenceId: string;
  requester: string;
  department: string;
  date: string;
  productDetails: string;
  quantity: number;
  priority: string;
  status: string;
}

const MOCK_DATA: MaterialData[] = [
  { _id: "1", referenceId: "MR-2024-001", requester: "Arjun Sharma", department: "Engineering", date: "2024-05-12", productDetails: "Steel Pipes 6in", quantity: 120, priority: "High", status: "Pending" },
  { _id: "2", referenceId: "MR-2024-002", requester: "Priya Nair", department: "Procurement", date: "2024-05-14", productDetails: "Copper Wire 2mm", quantity: 500, priority: "Medium", status: "Approved" },
  { _id: "3", referenceId: "MR-2024-003", requester: "Rohit Das", department: "Maintenance", date: "2024-05-15", productDetails: "Hydraulic Fluid 20L", quantity: 40, priority: "Low", status: "Draft" },
  { _id: "4", referenceId: "MR-2024-004", requester: "Sneha Patel", department: "Operations", date: "2024-05-18", productDetails: "Bolts M12 x 50mm", quantity: 1000, priority: "High", status: "Rejected" },
  { _id: "5", referenceId: "MR-2024-005", requester: "Vikram Menon", department: "Logistics", date: "2024-05-20", productDetails: "Pallet Wrap 400m", quantity: 60, priority: "Medium", status: "Completed" },
];

const priorityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  High:   { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  Medium: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  Low:    { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  Urgent: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

const getDisplayStatus = (status: string) => {
  if (["Procurement Required", "RFQ Created", "Quotations Received", "Vendor Selected", "PO Created", "PO Approved", "Material Ordered", "Material Received"].includes(status)) {
    return "Procurement";
  }
  if (status === "Procurement Completed") {
    return "Completed";
  }
  return status;
};

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  Pending:     { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }, // Orange
  Approved:    { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" }, // Green
  Procurement: { bg: "#F3E8FF", text: "#6B21A8", border: "#E9D5FF" }, // Purple
  Completed:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, // Blue
  Rejected:    { bg: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5" }, // Red
  Draft:       { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
};

const STATUSES = ["All Status", "Draft", "Pending", "Approved", "Procurement", "Completed", "Rejected"];

export default function MaterialRequest() {
  const navigate = useNavigate();
  const [data, setData] = useState<MaterialData[]>(MOCK_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [billRequest, setBillRequest] = useState<MaterialData | null>(null);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/material`)
      .then((res) => res.json())
      .then((res) => {
        if (res && res.data) {
          setData(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = data.filter((row) => {
    const displayStatus = getDisplayStatus(row.status);
    const matchSearch =
      (row.referenceId || "").toLowerCase().includes(search.toLowerCase()) ||
      (row.requester || "").toLowerCase().includes(search.toLowerCase()) ||
      (row.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (row.productDetails || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || displayStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const getInitials = (name?: string) => {
    if (!name) return "MR";
    return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const avatarColors = ["#DBEAFE", "#FCE7F3", "#D1FAE5", "#FEF3C7", "#EDE9FE"];
  const avatarTextColors = ["#1D4ED8", "#9D174D", "#065F46", "#92400E", "#5B21B6"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Floating Header Card - Aligns beautifully within dashboard layouts */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 20px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(2,132,199,0.15)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#0F172A", letterSpacing: "-0.3px" }}>Material Requests Console</h2>
              <p style={{ margin: 0, fontSize: 11, color: "#64748B", marginTop: 1.5 }}>View, track, and create employee material requisitions</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "#EFF6FF", color: "#1D4ED8", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid #BFDBFE" }}>
              {filtered.length} active records
            </span>
          </div>
        </div>
      </div>

      {/* Spaced Spacing Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          {[
            { label: "Total Requests", value: data.length, color: "#0284C7", bg: "#EFF6FF" },
            { label: "Pending approval", value: data.filter(d => d.status === "Pending").length, color: "#D97706", bg: "#FFFBEB" },
            { label: "Approved requisitions", value: data.filter(d => d.status === "Approved").length, color: "#059669", bg: "#ECFDF5" },
            { label: "Rejected requests", value: data.filter(d => d.status === "Rejected").length, color: "#DC2626", bg: "#FEF2F2" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#64748B", fontWeight: 550, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0F172A" }}>{value}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 16, color, fontWeight: 700 }}>{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", minWidth: 240 }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", background: "#F8FAFC", color: "#0F172A", width: "100%", fontFamily: "inherit" }}
              />
            </div>

            {/* Status Filter Pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUSES.map(s => {
                const isActive = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      fontSize: 12, fontWeight: 550, padding: "5px 12px", borderRadius: 20, cursor: "pointer", border: "1px solid",
                      borderColor: isActive ? "#0284C7" : "#E2E8F0",
                      background: isActive ? "#EFF6FF" : "#fff",
                      color: isActive ? "#0284C7" : "#475569",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Request Button */}
          <button
            onClick={() => navigate("/material")}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "#0284C7", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(2,132,199,0.2)", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#0271AA"}
            onMouseLeave={e => e.currentTarget.style.background = "#0284C7"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Request
          </button>
        </div>

        {/* Table Card Container with overflow safety, shadow, and rounded edges */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          
          {/* Scrollable wrapper to prevent table overflow from cutting off borders */}
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ width: "100%", minWidth: 960, borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  {["Reference", "Requester", "Department", "Date", "Product Details", "Qty", "Priority", "Status", ""].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: i === 8 ? "center" : "left", fontWeight: 600, fontSize: 11, color: "#64748B", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "48px 16px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                      No results found
                    </td>
                  </tr>
                ) : paginated.map((row, idx) => {
                  const displayStatus = getDisplayStatus(row.status);
                  const pri = priorityConfig[row.priority] || priorityConfig["Low"];
                  const sta = statusConfig[displayStatus] || statusConfig["Pending"];
                  const avBg = avatarColors[idx % avatarColors.length];
                  const avTxt = avatarTextColors[idx % avatarTextColors.length];
                  return (
                    <tr key={row._id || idx} style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.1s", cursor: "pointer" }}
                      onClick={() => navigate("/apporavals")}
                      onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500, color: "#0284C7", background: "#EFF6FF", padding: "3px 8px", borderRadius: 5 }}>
                          {row.referenceId || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: avBg, color: avTxt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {getInitials(row.requester)}
                          </div>
                          <span style={{ color: "#0F172A", fontWeight: 500 }}>{row.requester || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", color: "#475569" }}>{row.department || "—"}</td>
                      <td style={{ padding: "13px 16px", color: "#64748B", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                        {row.date ? new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ padding: "13px 16px", color: "#334155", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.productDetails || "—"}
                      </td>
                      <td style={{ padding: "13px 16px", color: "#334155", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                        {row.quantity ? row.quantity.toLocaleString() : "0"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: pri.bg, color: pri.text, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: pri.dot, flexShrink: 0 }} />
                          {row.priority || "Low"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ background: sta.bg, color: sta.text, border: `1px solid ${sta.border}`, fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                          {displayStatus || "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", textAlign: "center", position: "relative" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {displayStatus === "Completed" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setBillRequest(row); }}
                            style={{
                              background: "#EFF6FF",
                              border: "1px solid #BFDBFE",
                              borderRadius: 6,
                              padding: "5px 12px",
                              cursor: "pointer",
                              color: "#1D4ED8",
                              fontSize: 12,
                              fontWeight: 650,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontFamily: "inherit",
                              boxShadow: "0 1px 2px rgba(29, 78, 216, 0.05)"
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            View Bill
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === row._id ? null : row._id); }}
                              style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#64748B", display: "inline-flex", alignItems: "center" }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </button>
                            {openMenu === row._id && (
                              <div style={{ position: "absolute", right: 16, top: 44, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 10, minWidth: 130, overflow: "hidden" }}>
                                {["View", "Edit", "Approve", "Reject"].map(action => (
                                  <button key={action} onClick={(e) => { e.stopPropagation(); setOpenMenu(null); navigate("/apporavals"); }}
                                    style={{ display: "block", width: "100%", padding: "9px 14px", textAlign: "left", background: "none", border: "none", fontSize: 13, color: action === "Reject" ? "#DC2626" : "#334155", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                                  >
                                    {action}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer controls */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              Showing {filtered.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} requests
            </span>
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 5, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                {/* Prev page button */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 12, fontWeight: 500, cursor: safePage === 1 ? "not-allowed" : "pointer", opacity: safePage === 1 ? 0.5 : 1, fontFamily: "inherit" }}
                >
                  &lsaquo;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
                  const isActive = n === safePage;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid", borderColor: isActive ? "#0284C7" : "#E2E8F0", background: isActive ? "#EFF6FF" : "#fff", color: isActive ? "#0284C7" : "#64748B", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {n}
                    </button>
                  );
                })}

                {/* Next page button */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 12, fontWeight: 500, cursor: safePage === totalPages ? "not-allowed" : "pointer", opacity: safePage === totalPages ? 0.5 : 1, fontFamily: "inherit" }}
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {billRequest && (
        <MaterialIssueBillModal
          request={billRequest}
          onClose={() => setBillRequest(null)}
        />
      )}
    </div>
  );
}
