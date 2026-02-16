import QRCode from "react-qr-code";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Printer,
  ScanLine,
  Search,
} from "lucide-react";

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
    valueSize: "text-5xl",
  },
];

const inventoryData = [
  {
    code: "4589172131",
    name: "Steel Pipes 2inch",
    category: "Batch-2024-001 SN-78945",
    warehouse: " Warehouse A-Rack 3",

    value: "2024-01-15 10:30 AM",
    Status: "in",
  },
  {
    code: "ITM-002",
    name: "Printer Paper (A4)",
    category: "Stationery",
    warehouse: "Main Warehouse",
    value: "2024-01-14 02:15 PM",
    status: "in",
  },
  {
    code: "ITM-003",
    name: "Work Gloves",
    category: "Safety Equipment",
    warehouse: "Site B",
    value: "2024-01-13 09:45 AM",
    status: "low",
  },
  {
    code: "ITM-003",
    name: "Work Gloves",
    category: "Safety Equipment",
    warehouse: "Site B",
    value: "2024-01-13 09:45 AM",
    status: "low",
  },
];

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export function NativeSelectDemo() {
  return (
    <NativeSelect className="w-80">
      <NativeSelectOption value="">Select status</NativeSelectOption>
      <NativeSelectOption value="todo">Standard (2"x1")</NativeSelectOption>
      <NativeSelectOption value="in-progress">
        Large (3" x 1")
      </NativeSelectOption>
      <NativeSelectOption value="done">Small (3"x1")</NativeSelectOption>
    </NativeSelect>
  );
}

{
  /* */
}

const BarcodeTracking = () => {
  return (
    <div className="p-4 space-y-4 bg-blue-50 min-h-screen">
      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

                <p className="mt-1 text-sm text-muted-foreground">
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div>
        <Tabs defaultValue="overview">
          <div className="flex items-center justify-between">
            <TabsList className="bg-[#94A3B8] h-12 rounded-xl p-1 text-black">
              <TabsTrigger
                value="Registry"
                className="flex-1 flex items-center justify-center
             h-full text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all"
              >
                Barcode Registry
              </TabsTrigger>
              <TabsTrigger
                value="movements"
                className="px-6 rounded-lg data-[state=active]:bg-white"
              >
                Movements
              </TabsTrigger>
              <TabsTrigger
                value="adjustments"
                className="px-6 rounded-lg data-[state=active]:bg-white"
              >
                Adjustments
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="Registry">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-4">
              <div
                className="grid grid-cols-8 bg-gray-50 px-6 py-3 text-sm 
                          font-semibold text-gray-600"
              >
                <div>Barcode</div>
                <div>Itemname</div>
                <div>
                  <p>Batch/Serial</p>
                </div>
                <div>Location</div>

                <div>Status</div>
                <div>Last Scanned</div>

                <div>Actions</div>
              </div>

              {inventoryData.map((item, i) => {
                return (
                  <div
                    key={i}
                    className="grid grid-cols-8 items-center px-6 py-4 border-t hover:bg-gray-50"
                  >
                    <div className="font-mono pr-8">{item.code}</div>
                    <div className="">{item.name}</div>
                    <div>{item.category}</div>
                    <div>{item.warehouse}</div>
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

                    <div className="font-semibold  ">{item.value}</div>

                    <div>
                      {/* {item.action} */}
                      <div className="flex justify-center pl-25">
                        <Printer className="h-4 w-4 cursor-pointer text-black " />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="movements">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-100 mt-4">
              <div>
                <h1 className="text-2xl pl-4 pt-4">Barcode Scanner</h1>
              </div>
              <div className="pl-60 pt-8">
                <div className="bg-[#C5CED9] rounded-xl shadow-sm border overflow-auto w-110 h-50 ">
                  <div className="pl-45 pt-15">
                    <ScanLine className="w-15 h-15" />
                  </div>
                  <h1 className="pl-15 pt-4">
                    Point camera at barcode or enter manually
                  </h1>
                </div>
                <div>
                  <div className="flex gap-7">
                    <div>
                      <h1 className="text-xl">Manual Entry</h1>

                      <input
                        type="text"
                        placeholder="Enter barcode number....."
                        className="flex-1 px-4 py-3 text-sm focus:outline-none text-black bg-blue-100 rounded-xl w-80"
                      />
                    </div>
                    <div className="pr-6 pt-7">
                      <button className="flex items-center gap-3 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <Search className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="adjustments">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-100 mt-4">
              <h1 className="text-2xl pl-4 pt-4">Generate Barcode Labels</h1>
              <div className="flex gap-8">
                <div className="pl-4">
                  <br />
                  <h2>select Items</h2>
                  <input
                    type="text"
                    placeholder="search items....."
                    className="flex-1 px-4 py-3 text-sm focus:outline-none text-black bg-blue-100 rounded-xl w-80"
                  />
                  <br />
                  <h1 className="pt-5">Label format</h1>

                  <div className="rounded-xl w-90">
                    <NativeSelectDemo />
                  </div>
                  <br />
                  <div>
                    <h2>Quantity</h2>
                    <div className="rounded-xl w-90">
                      <NativeSelectDemo />
                    </div>
                    <br />
                    <button className="w-90 flex items-center justify-center gap-3 px-5.5 py-2.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition shadow">
                      <Printer className="h-4 w-4" />
                      <span>Generate Labels</span>
                    </button>
                  </div>
                </div>
                <div className="rounded-xl w-120 h-80 bg-[#C5CED9] pl-4">
                  <div className="rounded-xl w-120 h-80 bg-[#C5CED9]">
                    <div className="bg-[#C5CED9] pl-40 pt-12 rounded-xl">
                      <QRCode value="ITM-002" size={120} />
                    </div>
                    <div className=" pt-4">
                      <h2 className="text-2xl pl-36">4589712345001</h2>
                      <p className="pl-40">Steel Pipes 2inch</p>
                      <p className="pl-40">BATCH-2024-001</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BarcodeTracking;
