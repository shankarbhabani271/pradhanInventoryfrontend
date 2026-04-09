import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FileText, IndianRupee, ShoppingCart, Clock,Eye ,CircleFadingPlus ,CircleX, FilePlus ,PackagePlus,BarChart3 , ClipboardCheck, Plus,
   ArrowDownRight, ArrowUpRight,AlertTriangle ,} from "lucide-react";


const dashboardCards = [
  {
    title: "Open Requests",
    value: "24",
    subtitle: "+3 from yesterday",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    subtitleColor: "text-muted-foreground",
  },
  {
    title: "Pending Approvals",
    value: "8",
    subtitle: "-2 from yesterday",
    icon: IndianRupee,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    subtitleColor: "text-muted-foreground",
  },
  {
    title: "Active POs",
    value: "12",
    subtitle: "+5 this week",
    icon: ShoppingCart,
    iconBg: "bg-purple-100",
    iconColor: "text-green-500 text-2xl",
  },
  {
    title: "Low Stock Items",
    value: "5",
    subtitle: "Requires attention",
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    valueSize: "text-5xl",
  },
];

const Dashboard = () => {
  return (
    < div className="p-4 space-y-4 bg-blue-50 min-h-screen">
      
      {/* Header */}
      <div>
       
      </div>

      {/* Cards */}
      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Card key={index} className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>

                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>

              <CardContent>
                <div className={`font-bold ${card.valueSize ?? "text-3xl"}`}>
                  {card.value}
                </div>

                <p
                  className={`mt-1 text-sm ${
                    card.subtitleColor ?? "text-muted-foreground"
                  }`}
                >
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
     </div>
    {/* End Cards */}
    
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* LEFT : Pending Approvals */}
  <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4">
    
    {/* Header */}
    <div className="flex justify-between items-center border-b pb-3 mb-4">
      <h3 className="font-semibold text-lg">Pending Approvals</h3>
      <span className="text-blue-600 text-sm cursor-pointer">View all</span>
    </div>

    {/* Item */}
    <div className="space-y-4">
      {[
        { id: "MR-2024-516", amount: "$2,450", time: "Today, 10:30 AM" },
        { id: "MR-2024-517", amount: "$2,450", time: "Today, 10:30 AM" },
        { id: "MR-2024-518", amount: "$890", time: "Today, 09:15 AM" },
      ].map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 last:border-none"
        >
          {/* Left */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{item.id}</span>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 rounded-full">
                High
              </span>
            </div>
            <p className="text-sm font-medium">
              Material Request · Sarah Johnson
            </p>
            <p className="text-xs text-muted-foreground">{item.time}</p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <span className="font-semibold">{item.amount}</span>
            <Eye className="w-4 h-4 cursor-pointer" />
            <CircleFadingPlus className="w-4 h-4 text-emerald-500 cursor-pointer" />
            <CircleX className="w-4 h-4 text-rose-500 cursor-pointer" />
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* RIGHT : Quick Actions */}
  <div className="bg-white rounded-xl border p-4">
    
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      <div className="flex items-center gap-1 text-blue-600 text-sm cursor-pointer">
        <Plus className="w-4 h-4" />
        Customize
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      <div className="rounded-xl p-4 bg-blue-50 hover:bg-blue-100 transition cursor-pointer">
        <FilePlus className="w-6 h-6 text-blue-600 mb-2" />
        <h4 className="font-semibold text-blue-700">New Material Request</h4>
        <p className="text-sm text-blue-600">
          Create a new request for materials
        </p>
      </div>

      <div className="rounded-xl p-4 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer">
        <PackagePlus className="w-6 h-6 text-emerald-600 mb-2" />
        <h4 className="font-semibold text-emerald-700">Record GRN</h4>
        <p className="text-sm text-emerald-600">
          Receive goods from vendor
        </p>
      </div>

      <div className="rounded-xl p-4 bg-orange-50 hover:bg-orange-100 transition cursor-pointer">
        <ClipboardCheck className="w-6 h-6 text-orange-600 mb-2" />
        <h4 className="font-semibold text-orange-700">QC Inspection</h4>
        <p className="text-sm text-orange-600">
          Start quality inspection
        </p>
      </div>

      <div className="rounded-xl p-4 bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
        <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
        <h4 className="font-semibold text-purple-700">View Reports</h4>
        <p className="text-sm text-purple-600">
          Access analytics & reports
        </p>
      </div>

    </div>
  </div>
</div>



{/* bhabani first table */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4">
    
    {/* Header */}
    <div className="flex justify-between items-center border-b pb-3 mb-4">
      <h3 className="font-semibold text-lg">Pending Approvals</h3>
      <span className="text-blue-600 text-sm cursor-pointer">View all</span>
    </div>

    {/* Item */}
    <div className="space-y-4">
      {[
        { id: "MR-2024-516", amount: "$2,450", time: "Today, 10:30 AM" },
        { id: "MR-2024-517", amount: "$2,450", time: "Today, 10:30 AM" },
        { id: "MR-2024-518", amount: "$890", time: "Today, 09:15 AM" },
      ].map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 last:border-none"
        >
          {/* Left */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{item.id}</span>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 rounded-full">
                High
              </span>
            </div>
            <p className="text-sm font-medium">
              Material Request · Sarah Johnson
            </p>
            <p className="text-xs text-muted-foreground">{item.time}</p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <span className="font-semibold">{item.amount}</span>
            <Eye className="w-4 h-4 cursor-pointer" />
            <CircleFadingPlus className="w-4 h-4 text-emerald-500 cursor-pointer" />
            <CircleX className="w-4 h-4 text-rose-500 cursor-pointer" />
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* RIGHT : Inventory Overview */}
 <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h5 className="font-semibold text-base sm:text-lg">
          Inventory Overview
        </h5>
        <span className="text-blue-600 text-sm cursor-pointer">
          View all
        </span>
      </div>

      {/* Inventory Items */}
      {[
        {
          name: "Office Chairs",
          value: 45,
          total: 100,
          category: "Furniture",
          min: 20,
          percent: 45,
          up: true,
        },
        {
          name: "Printer Paper (A4)",
          value: 120,
          total: 500,
          category: "Stationery",
          min: 50,
          percent: 24,
        },
        {
          name: "Safety Helmets",
          value: 15,
          total: 100,
          category: "Safety",
          min: 30,
          percent: 15,
          warning: true,
        },
        {
          name: "Laptop Chargers",
          value: 8,
          total: 50,
          category: "Electronics",
          min: 10,
          percent: 16,
          warning: true,
        },
      ].map((item, i) => (
        <div
          key={i}
          className="px-4 py-4 border-b last:border-none"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium flex items-center gap-2 text-sm sm:text-base">
              {item.name}
              {item.warning && (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              )}
            </h3>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {item.value}/{item.total}
              </span>
              {item.up ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>

          <div className="h-2 bg-slate-300 rounded-full mb-2">
            <div
              className={`h-2 rounded-full ${
                item.warning ? "bg-amber-500" : "bg-sky-600"
              }`}
              style={{ width: `${item.percent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span>{item.category}</span>
            <span>Min: {item.min}</span>
          </div>
        </div>
      ))}
    </div>


  </div>
 
    {/* bhabani last table */}
 

  {/* Main Grid */}
 
</div>

  
  
  
  
  );
};

export default Dashboard;