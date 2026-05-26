import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText, CheckCircle, Clock, Eye, ShieldAlert, Plus, HelpCircle, UserCheck } from "lucide-react";

const EmployeeDashboard = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const name = user?.name || "Employee";
  const email = user?.email || "employee@example.com";
  const department = localStorage.getItem("department") || "Operations";

  const dashboardCards = [
    {
      title: "My Material Requests",
      value: "5 Raised",
      subtitle: "3 approved, 2 pending",
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Approved Requests",
      value: "3 Delivered",
      subtitle: "Check warehouse pickup",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Awaiting Verification",
      value: "2 Pending",
      subtitle: "Under manager review",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Account Trust Status",
      value: "Verified",
      subtitle: "Active workspace profile",
      icon: UserCheck,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12">
          <User size={200} />
        </div>
        <h1 className="text-3xl font-extrabold mb-1">Welcome back, {name}!</h1>
        <p className="text-indigo-100 max-w-xl">
          Quickly raise material requisitions, track active approvals, and keep your workspace profile details up to date.
        </p>
      </div>

      {/* Cards Grid */}
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: My Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-850">My Material Requisitions</h3>
              <p className="text-xs text-slate-450 mt-0.5">Track status updates on materials you requested.</p>
            </div>
            <span className="text-indigo-600 font-semibold text-sm cursor-pointer hover:underline">View history</span>
          </div>

          <div className="space-y-4">
            {[
              { id: "MR-2026-102", item: "Logitech MX Master 3S Mouse", qty: "1 Unit", date: "May 25, 2026", status: "Pending", color: "bg-amber-100 text-amber-800" },
              { id: "MR-2026-098", item: "HDMI Adapter Splitter & Cable", qty: "2 Pcs", date: "May 22, 2026", status: "Approved", color: "bg-emerald-100 text-emerald-800" },
              { id: "MR-2026-088", item: "Post-it Notes & Dry Erase Markers", qty: "5 Packs", date: "May 15, 2026", status: "Delivered", color: "bg-blue-100 text-blue-800" },
            ].map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{req.id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${req.color}`}>
                      {req.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 mt-1">{req.item} · {req.qty}</h4>
                  <p className="text-xs text-slate-450 font-medium">Initiated on {req.date}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <button className="py-2 px-4 bg-white border rounded-lg hover:bg-slate-50 text-slate-600 shadow-sm transition font-semibold text-xs flex items-center gap-1.5">
                    <Eye className="w-4.5 h-4.5" /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Profile & Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="text-indigo-600" />
              My Account Details
            </h3>

            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-bold text-slate-700">{email}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Department</p>
                <p className="text-sm font-bold text-slate-700">{department}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Workplace Security Clear</p>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Authorized User
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition font-bold text-sm flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> New Material Request
              </button>
              <button className="w-full py-3 bg-white border hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm transition font-bold text-sm flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" /> Help Center
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center text-xs text-slate-400">
            Powered by InvenPro Employee Console
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;
