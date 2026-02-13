
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
} from "lucide-react";

/* ---------------- Dashboard Cards ---------------- */
const dashboardCards = [
  {
    title: "Open Requests",
    value: "24",
    subtitle: "+3 from yesterday",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Pending Approvals",
    value: "8",
    subtitle: "-2 from yesterday",
    icon: IndianRupee,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Active POs",
    value: "12",
    subtitle: "+5 this week",
    icon: ShoppingCart,
    iconBg: "bg-purple-100",
    iconColor: "text-green-500",
  },
  {
    title: "Low Stock Items",
    value: "5",
    subtitle: "Requires attention",
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

/* ---------------- Vendor Data ---------------- */
const vendors = [
  {
    name: "Prime Metals",
    code: "VEN-004",
    category: "Steel & Metals",
    phone: "+91 65432 10987",
    email: "contact@primemetals.com",
    location: "Chennai, Tamil Nadu",
    rating: 4.8,
    orders: { total: 234, pending: 5 },
    status: "Active",
  },
  {
    name: "ABC Supplies Ltd",
    code: "VEN-001",
    category: "Steel & Metals",
    phone: "+91 98765 43210",
    email: "sales@abcsupplies.com",
    location: "Mumbai, Maharashtra",
    rating: 4.5,
    orders: { total: 156, pending: 3 },
    status: "Active",
  },
  {
    name: "XYZ Materials",
    code: "VEN-002",
    category: "Construction",
    phone: "+91 87654 32109",
    email: "info@xyzmaterials.com",
    location: "Delhi, NCR",
    rating: 4.2,
    orders: { total: 89, pending: 1 },
    status: "Active",
  },
];

/* ---------------- Performance Data ---------------- */
const topPerformers = [
  { rank: 1, name: "Prime Metals", category: "Steel & Metals", rating: 4.8 },
  { rank: 2, name: "ABC Supplies Ltd", category: "Steel & Metals", rating: 4.5 },
  { rank: 3, name: "XYZ Materials", category: "Construction", rating: 4.2 },
];

const orderVolume = [
  { name: "Prime Metals", orders: 234, pending: 5 },
  { name: "ABC Supplies Ltd", orders: 156, pending: 3 },
  { name: "XYZ Materials", orders: 89, pending: 1 },
];

/* ---------------- Page Component ---------------- */
const VendorsPage = () => {
  return (
    <div className="p-4 space-y-6 bg-blue-50 min-h-screen">

      {/* Dashboard Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="vendors">
        <TabsList className="bg-slate-300 text-black">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* ---------------- Vendors Tab ---------------- */}
        <TabsContent value="vendors" className="mt-6 ">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Vendor Directory</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    className="w-full pl-9 py-2 border rounded-lg"
                    placeholder="Search vendors..."
                  />
                </div>
              </div>

              {vendors.map((v, i) => (
                <div key={i} className="grid grid-cols-7 border-b py-4 items-center">
                  <div>
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-sm text-gray-300">{v.code}</p>
                  </div>

                  <Badge>{v.category}</Badge>

                  <div className="text-sm space-y-1">
                    <p className="flex gap-1"><Phone size={14} /> {v.phone}</p>
                    <p className="flex gap-1"><Mail size={14} /> {v.email}</p>
                  </div>

                  <div className="flex gap-1"><MapPin size={14} /> {v.location}</div>

                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n => (
                      <Star
                        key={n}
                        size={16}
                        className={n <= Math.round(v.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"}
                      />
                    ))}
                    <span className="ml-1">{v.rating}</span>
                  </div>

                  <div>
                    <p className="font-semibold">{v.orders.total} total</p>
                    <p className="text-sm text-gray-500">{v.orders.pending} pending</p>
                  </div>

                  <Badge className="bg-emerald-100 text-emerald-700">
                    {v.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Performance Tab ---------------- */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top Performers */}
            <div className="bg-white rounded-xl border shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Top Performers</h2>

              <div className="space-y-6">
                {topPerformers.map((v) => (
                  <div key={v.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                        {v.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{v.name}</p>
                        <p className="text-sm text-gray-500">{v.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map(n => (
                        <Star
                          key={n}
                          size={16}
                          className={n <= Math.round(v.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"}
                        />
                      ))}
                      <span className="font-semibold">{v.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Volume */}
            <div className="bg-white rounded-xl border shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Order Volume</h2>

              <div className="space-y-6">
                {orderVolume.map((v, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{v.name}</p>
                        <p className="text-sm text-gray-500">{v.orders} orders</p>
                      </div>
                    </div>

                    <span className="px-4 py-1 text-sm rounded-full bg-slate-800 text-white">
                      {v.pending} pending
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default VendorsPage;
