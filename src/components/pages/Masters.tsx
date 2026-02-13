
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock, Search, Plus, MoreHorizontal,
  
} from "lucide-react"


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



const items = [
  {
    id: "ITM-001",
    name: "Steel Pipes 2inch",
    category: "Steel & Metals",
    uom: "Pcs",
    hsn: "7304",
    status: "Active",
  },
  {
    id: "ITM-002",
    name: "Copper Wire 10mm",
    category: "Electrical",
    uom: "Mtrs",
    hsn: "7408",
    status: "Active",
  },
  {
    id: "ITM-003",
    name: "PVC Fittings",
    category: "Plumbing",
    uom: "Pcs",
    hsn: "3917",
    status: "Active",
  },
  {
    id: "ITM-004",
    name: "Cement Bags 50kg",
    category: "Construction",
    uom: "Bags",
    hsn: "2523",
    status: "Inactive",
  },
];



const Masters = () => {
  return (

 <div  className="p-4 space-y-4 bg-blue-50 min-h-screen">
      
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
     <div>
        <Tabs defaultValue="items" className="w-full">

      {/* Tabs Header */}
      <TabsList className="bg-[#94A3B8] rounded-xl p-1 w-fit">
        <TabsTrigger
          value="items"
          className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
        >
          Items
        </TabsTrigger>

        <TabsTrigger
          value="categories"
          className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
        >
          Categories
        </TabsTrigger>

        <TabsTrigger
          value="warehouses"
          className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
        >
          Warehouses
        </TabsTrigger>

        <TabsTrigger
          value="departments"
          className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
        >
          Departments
        </TabsTrigger>
      </TabsList>

      {/* Items */}
      <TabsContent value="items" className="mt-6">
          <div className="p-6 bg-slate-50 min-h-screen">
      <Card className="p-6 rounded-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Item Master</h1>

          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search items..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none"
              />
            </div>

            <Button className="bg-[#0284C7] hover:bg-[#0369A1]">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-7 text-sm font-semibold text-gray-600 border-b pb-3">
          <div>Item ID</div>
          <div>Name</div>
          <div>Category</div>
          <div>UOM</div>
          <div>HSN Code</div>
          <div>Status</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Rows */}
        {items.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-7 items-center py-5 border-b last:border-none"
          >
            <div className="font-medium">{item.id}</div>
            <div>{item.name}</div>

            <div>
              <Badge variant="outline">{item.category}</Badge>
            </div>

            <div>{item.uom}</div>
            <div>{item.hsn}</div>

            <div>
              <Badge
                className={
                  item.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-300 text-slate-800"
                }
              >
                {item.status}
              </Badge>
            </div>

            <div className="flex justify-center">
              <MoreHorizontal className="h-5 w-5 cursor-pointer text-gray-600" />
            </div>
          </div>
        ))}
      </Card>
    </div>
      </TabsContent>

      {/* Categories */}
      <TabsContent value="categories" className="mt-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">Categories</h2>
          <p>Categories content goes here.</p>
        </div>
      </TabsContent>

      {/* Warehouses */}
      <TabsContent value="warehouses" className="mt-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">Warehouses</h2>
          <p>Warehouses content goes here.</p>
        </div>
      </TabsContent>

      {/* Departments */}
      <TabsContent value="departments" className="mt-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">Departments</h2>
          <p>Departments content goes here.</p>
        </div>
      </TabsContent>

    </Tabs>
     </div>
     </div>


  )
}

export default Masters
