import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, BarChart2, Package, Layers, AlertTriangle, ArrowUpRight, ArrowDownRight, ClipboardCheck, Plus, PackagePlus, Eye } from "lucide-react";

const dashboardCards = [
  {
    title: "Low Stock Items",
    value: "5 SKUs",
    subtitle: "Needs immediate reorder",
    icon: AlertTriangle,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    title: "Total Tracked Inventory",
    value: "1,420 Units",
    subtitle: "Across 14 categories",
    icon: Package,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Warehouse Occupancy",
    value: "74%",
    subtitle: "Warehouse A, B, & C",
    icon: Layers,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Monthly Stock Turn",
    value: "4.2x",
    subtitle: "+0.3x from last month",
    icon: BarChart2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

const InventoryDashboard = () => {
  return (
    <div className=" space-y-6 bg-slate-50 min-h-screen">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12">
          <Package size={200} />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Inventory Management Control</h1>
        <p className="text-blue-100 max-w-xl">
          Real-time stock monitoring, multi-warehouse space evaluation, active inventory audits, and prompt replenishment notifications.
        </p>
      </div>

      {/* Stats Cards */}
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

      {/* Tables & Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Low Stock Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-850">Critical Low Stock Alerts</h3>
              <p className="text-xs text-slate-450 mt-0.5">These products have fallen below safe safety stock reserves.</p>
            </div>
            <span className="text-rose-600 font-semibold text-sm cursor-pointer hover:underline">Replenish All</span>
          </div>

          <div className="space-y-4">
            {[
              { sku: "SKU-OFF-102", name: "Executive Ergonomic Office Chairs", stock: 15, reorderLevel: 30, category: "Furniture", status: "Critical" },
              { sku: "SKU-ELE-409", name: "65W USB-C Laptop Power Bricks", stock: 8, reorderLevel: 20, category: "Electronics", status: "Critical" },
              { sku: "SKU-SAF-221", name: "Industrial Polycarbonate Safety Helmets", stock: 12, reorderLevel: 25, category: "Safety Gear", status: "Warning" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-400">{item.sku}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      item.status === "Critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 mt-1">{item.name}</h4>
                  <p className="text-xs text-slate-450 font-medium">Category: {item.category} · Safety Threshold: {item.reorderLevel} units</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-rose-600">{item.stock} Units</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Current Stock</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 bg-white border rounded-lg hover:bg-slate-50 text-slate-600 shadow-sm transition">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition font-bold text-xs">
                      Order More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LayoutGrid className="text-blue-600" />
              Stock Operations
            </h3>
            
            <div className="space-y-4">
              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-blue-50 transition cursor-pointer border border-transparent hover:border-blue-100">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-105 transition">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Add Inventory Item</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Register new product specifications and warehouse location.</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-emerald-50 transition cursor-pointer border border-transparent hover:border-emerald-100">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-105 transition">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Log Inward GRN</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Record newly arrived shipments and updates on stock quantity.</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-purple-50 transition cursor-pointer border border-transparent hover:border-purple-100">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-105 transition">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Trigger Physical Audit</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Launch physical stock counting cycles and identify variances.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center">
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider mb-2">Total Warehouse Valuation</p>
            <p className="text-2xl font-black text-slate-800">₹42,85,400</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InventoryDashboard;
