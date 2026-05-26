import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, FileText, Truck, IndianRupee, Eye, PlusCircle, ArrowRightLeft, FileSpreadsheet, Send, TrendingUp } from "lucide-react";

const dashboardCards = [
  {
    title: "Open Requisitions",
    value: "18 Reqs",
    subtitle: "8 need immediate RFQ",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Active Purchase Orders",
    value: "12 POs",
    subtitle: "4 pending delivery",
    icon: ShoppingCart,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Registered Vendors",
    value: "34 Active",
    subtitle: "2 onboarding today",
    icon: Truck,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Procurement Volume (MTD)",
    value: "₹8,90,000",
    subtitle: "+18% vs last month",
    icon: IndianRupee,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
];

const ProcurementDashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12">
          <Truck size={200} />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Procurement Headquarters</h1>
        <p className="text-emerald-100 max-w-xl">
          Manage corporate suppliers, streamline purchasing requests, track deliverables, and maintain optimal vendor relations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="rounded-2xl border-none shadow-sm hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-extrabold text-3xl text-slate-800 mt-1">{card.value}</div>
                <p className="mt-1 text-sm text-slate-400 font-medium">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Requisitions List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-850">Recent Purchase Requisitions</h3>
              <p className="text-xs text-slate-450 mt-0.5">Ready to be converted into Purchase Orders or RFQs.</p>
            </div>
            <span className="text-emerald-600 font-semibold text-sm cursor-pointer hover:underline">View all</span>
          </div>

          <div className="space-y-4">
            {[
              { id: "PR-2026-081", title: "Cisco Firewall Router Upgrade", dept: "IT Security", date: "Today, 2:40 PM", estCost: "₹1,85,000", status: "Approved" },
              { id: "PR-2026-082", title: "Steel Racks (Heavy Duty)", dept: "Warehouse Dept", date: "Today, 1:15 PM", estCost: "₹85,000", status: "Approved" },
              { id: "PR-2026-083", title: "Corporate Stationery & Printing", dept: "HR & Ops", date: "Yesterday, 3:30 PM", estCost: "₹24,000", status: "Approved" },
            ].map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{req.id}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                      {req.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 mt-1">{req.title}</h4>
                  <p className="text-xs text-slate-450 font-medium">Department: {req.dept} · {req.date}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{req.estCost}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Est. Budget</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 bg-white border rounded-lg hover:bg-slate-50 text-slate-600 shadow-sm transition">
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                    <button className="py-2 px-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition font-bold flex items-center gap-1.5 text-xs">
                      <Send className="w-3.5 h-3.5" /> Issue PO
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" />
              Procurement Actions
            </h3>
            
            <div className="space-y-4">
              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-emerald-50 transition cursor-pointer border border-transparent hover:border-emerald-100">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-105 transition">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Draft Purchase Order</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Generate and release a formal PO to an approved vendor.</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-indigo-50 transition cursor-pointer border border-transparent hover:border-indigo-100">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:scale-105 transition">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Onboard New Supplier</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Invite new vendor partners and collect compliance credentials.</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-blue-50 transition cursor-pointer border border-transparent hover:border-blue-100">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Export Spend Analytics</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Download quarterly purchasing reports for leadership review.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center">
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider mb-2">Vendor Compliance Rate</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-black text-emerald-600">97.8%</span>
              <span className="text-xs text-slate-400 font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">High Standard</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProcurementDashboard;
