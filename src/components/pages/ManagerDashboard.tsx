import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckSquare, Users, IndianRupee, Eye, CheckCircle2, XCircle, Plus, ClipboardList, ShieldCheck } from "lucide-react";

const dashboardCards = [
  {
    title: "Pending Material Requests",
    value: "14",
    subtitle: "5 high priority",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "My Approvals Queue",
    value: "6",
    subtitle: "Action required today",
    icon: CheckSquare,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    title: "Active Team Members",
    value: "8 Employees",
    subtitle: "Across 2 departments",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Department Monthly Budget",
    value: "₹4,50,000",
    subtitle: "62% consumed",
    icon: IndianRupee,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

const ManagerDashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12">
          <ShieldCheck size={200} />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Manager Control Room</h1>
        <p className="text-blue-100 max-w-xl">
          Review and approve material requests, monitor department spending, and track inventory requirements for your team.
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

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Team Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-850">Awaiting Team Request Approvals</h3>
              <p className="text-xs text-slate-450 mt-0.5">Approve or reject material requests initiated by your department.</p>
            </div>
            <span className="text-blue-600 font-semibold text-sm cursor-pointer hover:underline">View all</span>
          </div>

          <div className="space-y-4">
            {[
              { id: "MR-2026-904", item: "Dell Latitude 5440", requestedBy: "Rohan Sharma", date: "Today, 11:30 AM", qty: "3 Units", priority: "High" },
              { id: "MR-2026-905", item: "Ergonomic Mesh Chairs", requestedBy: "Ayesha Khan", date: "Today, 10:15 AM", qty: "5 Units", priority: "Medium" },
              { id: "MR-2026-906", item: "CAT-6 Ethernet Cables", requestedBy: "John Doe", date: "Yesterday, 4:45 PM", qty: "100 Meters", priority: "Low" },
            ].map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      item.priority === "High" ? "bg-red-100 text-red-700" :
                      item.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 mt-1">{item.item} ({item.qty})</h4>
                  <p className="text-xs text-slate-400 font-medium">Requested by {item.requestedBy} · {item.date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-2 bg-white border rounded-lg hover:bg-slate-50 text-slate-600 shadow-sm transition">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 shadow-sm transition font-bold flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 shadow-sm transition font-bold flex items-center gap-1 text-xs">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Quick Manager Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardList className="text-blue-600" />
              Quick Operations
            </h3>
            
            <div className="space-y-4">
              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-blue-50 transition cursor-pointer border border-transparent hover:border-blue-100">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-105 transition">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Raise Material Request</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Request tools, equipment, or assets for team members.</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-purple-50 transition cursor-pointer border border-transparent hover:border-purple-100">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-105 transition">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Manage Team Permissions</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Adjust role access levels or invite new crew members.</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-emerald-50 transition cursor-pointer border border-transparent hover:border-emerald-100">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-105 transition">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-750">Audit Logs</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Review chronological sequence of approvals & material usage.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Department</p>
            <p className="text-sm font-bold text-indigo-700">Engineering & Infrastructure</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;
