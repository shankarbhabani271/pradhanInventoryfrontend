
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Filter,
} from "lucide-react"

const dashboardCards = [
  {
    title: "Total Items",
    value: "1,234",
    subtitle: "+12 this month",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Total Value",
    value: "₹234,567",
    subtitle: "+5.2% from last month",
    icon: IndianRupee,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Low Stock Items",
    value: "8",
    subtitle: "Needs attention",
    icon: ShoppingCart,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Stock Movements",
    value: "156",
    subtitle: "This month",
    icon: Clock,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
]

const inventoryData = [
  {
    code: "ITM-001",
    name: "Safety Helmets",
    category: "Safety Equipment",
    warehouse: "Main Warehouse",
    current: 45,
    max: 100,
    unit: "pcs",
    value: "$1,350",
    status: "in",
  },
  {
    code: "ITM-002",
    name: "Printer Paper (A4)",
    category: "Stationery",
    warehouse: "Main Warehouse",
    current: 120,
    max: 500,
    unit: "reams",
    value: "$480",
    status: "in",
  },
  {
    code: "ITM-003",
    name: "Work Gloves",
    category: "Safety Equipment",
    warehouse: "Site B",
    current: 15,
    max: 100,
    unit: "pairs",
    value: "$225",
    status: "low",
  },
]

const Inventory = () => {
  return (
    <div className="min-h-screen bg-blue-50 p-6 space-y-6">

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ===== TABS ===== */}
      <Tabs defaultValue="overview">

        <div className="flex items-center justify-between">
          <TabsList className="bg-[#94A3B8] h-12 rounded-xl p-1">
            <TabsTrigger value="overview" className="px-6 rounded-lg data-[state=active]:bg-white">
              Stock Overview
            </TabsTrigger>
            <TabsTrigger value="movements" className="px-6 rounded-lg data-[state=active]:bg-white">
              Movements
            </TabsTrigger>
            <TabsTrigger value="adjustments" className="px-6 rounded-lg data-[state=active]:bg-white">
              Adjustments
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <input
              placeholder="Search items..."
              className="h-11 w-[280px] rounded-lg border px-4 text-sm border 
                       hover:border-blue-500
                          data-[state=active]:border-blue-600
                     data-[state=active]:bg-blue-50
                            transition-all"
            />
            <button className=" rounded-lg bg-white text-black h-11 px-4 "><Filter className="h-5 w-5 text-gray-700"/></button>
            <button className="h-11 px-4 rounded-lg border bg-white font-medium">
              Export
            </button>
          </div>
        </div>

        {/* ===== TABLE ===== */}
        <TabsContent value="overview">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-4">

            <div className="grid grid-cols-8 bg-gray-50 px-6 py-3 text-sm 
            font-semibold text-gray-600">
              <div>Code</div>
              <div>Item</div>
              <div><p>Category</p></div>
              <div>Warehouse</div>
              <div className="col-span-2">Stock</div>
              <div>Value</div>
              <div>Status</div>
            </div>

            {inventoryData.map((item, i) => {
              const percent = Math.round((item.current / item.max) * 100)
              const barColor = percent <= 30 ? "bg-orange-500" : "bg-blue-600"

              return (
                <div
                  key={i}
                  className="grid grid-cols-8 items-center px-6 py-4 border-t hover:bg-gray-50"
                >
                  <div className="font-mono">{item.code}</div>
                  <div className="">{item.name}</div>
                  <div>{item.category}</div>
                  <div>{item.warehouse}</div>

                  <div className="col-span-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.current} {item.unit}</span>
                      <span className="text-gray-400">/ {item.max}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <div className="font-semibold">{item.value}</div>

                  <div>
                    {item.status === "in" ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                        <AlertTriangle className="h-4 w-4" />
                        Low Stock
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default Inventory
