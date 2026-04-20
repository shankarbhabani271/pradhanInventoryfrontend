import React, { useEffect, useState } from "react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
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
  const [vendors, setVendors] = useState([]);

  // FETCH DATA
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/vendor/get");

      console.log("API:", res.data);

      if (Array.isArray(res.data)) {
        setVendors(res.data);
      } else if (res.data.vendors) {
        setVendors(res.data.vendors);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.log("ERROR:", error);
      setVendors([]);
    }
  };

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
        <TabsContent value="vendors" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg">

              <thead className="bg-blue-600 ">
                <tr className="text-white">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Secondary Phone</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Primary Address</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(vendors) && vendors.length > 0 ? (
                  vendors.map((v, i) => (
                    <tr key={i} className="border-t hover:bg-white">
                      <td className="p-3">{v?.name}</td>
                      <td className="p-3">{v?.phone}</td>
                      <td className="p-3">{v?.secondaryphone || "N/A"}</td>
                      <td className="p-3">{v?.email}</td>
                      <td className="p-3">
                        {v?.primaryaddress || v?.address || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-500">
                      No vendors found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </TabsContent>

        {/* ---------------- Performance Tab ---------------- */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-xl border shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Top Performers</h2>

              <div className="space-y-6">
                {topPerformers.map((v) => (
                  <div key={v.rank} className="flex justify-between">
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-sm text-gray-500">{v.category}</p>
                    </div>

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
                      <span>{v.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Order Volume</h2>

              {orderVolume.map((v, i) => (
                <div key={i} className="flex justify-between mb-4">
                  <p>{v.name}</p>
                  <p>{v.pending} pending</p>
                </div>
              ))}
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default VendorsPage;