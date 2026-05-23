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

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

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

const inventoryData = [
  {
    code: "4589172131",
    name: "Steel Pipes 2inch",
    category: "Batch-2024-001 SN-78945",
    warehouse: "Warehouse A-Rack 3",
    value: "2024-01-15 10:30 AM",
    status: "in",
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
];

function NativeSelectDemo() {
  return (
    <NativeSelect className="w-80">
      <NativeSelectOption value="">Select status</NativeSelectOption>
      <NativeSelectOption value="standard">
        Standard (2x1)
      </NativeSelectOption>
      <NativeSelectOption value="large">
        Large (3x1)
      </NativeSelectOption>
      <NativeSelectOption value="small">
        Small (1x1)
      </NativeSelectOption>
    </NativeSelect>
  );
}

const BarcodeTracking = () => {
  return (
    <div className="p-4 bg-blue-50 min-h-screen space-y-4">

      {/* Dashboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Card key={index}>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </CardHeader>

              <CardContent>
                <h2 className="text-3xl font-bold">{card.value}</h2>
                <p className="text-sm text-gray-500">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="Registry">

        <TabsList className="bg-gray-200">
          <TabsTrigger value="Registry">Barcode Registry</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
        </TabsList>

        {/* Registry */}
        <TabsContent value="Registry">
          <div className="bg-white rounded-xl mt-4 p-4">

            <div className="grid grid-cols-7 font-bold border-b pb-3">
              <div>Barcode</div>
              <div>Item</div>
              <div>Batch</div>
              <div>Location</div>
              <div>Status</div>
              <div>Last Scan</div>
              <div>Action</div>
            </div>

            {inventoryData.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-7 py-4 border-b items-center"
              >
                <div>{item.code}</div>
                <div>{item.name}</div>
                <div>{item.category}</div>
                <div>{item.warehouse}</div>

                <div>
                  {item.status === "in" ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      In Stock
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      Low Stock
                    </span>
                  )}
                </div>

                <div>{item.value}</div>

                <div>
                  <Printer className="cursor-pointer h-5 w-5" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Movements */}
        <TabsContent value="movements">
          <div className="bg-white rounded-xl p-6 mt-4">
            <h1 className="text-2xl mb-4">Barcode Scanner</h1>

            <div className="bg-gray-200 h-40 rounded-xl flex flex-col justify-center items-center">
              <ScanLine className="h-12 w-12" />
              <p>Point camera at barcode</p>
            </div>

            <div className="flex gap-4 mt-6">
              <input
                type="text"
                placeholder="Enter barcode"
                className="border p-3 rounded-lg w-80"
              />

              <button className="bg-blue-600 text-white px-5 rounded-lg flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Adjustments */}
        <TabsContent value="adjustments">
          <div className="bg-white rounded-xl p-6 mt-4">
            <h1 className="text-2xl mb-4">Generate Barcode Label</h1>

            <div className="grid md:grid-cols-2 gap-6">
              
              <div>
                <input
                  type="text"
                  placeholder="Search items"
                  className="border p-3 rounded-lg w-full"
                />

                <div className="mt-4">
                  <NativeSelectDemo />
                </div>

                <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Generate Label
                </button>
              </div>

              <div className="bg-gray-200 rounded-xl p-6 text-center">
                <QRCode value="ITM-002" size={120} />
                <h2 className="mt-4 text-xl font-bold">
                  4589712345001
                </h2>
                <p>Steel Pipes 2inch</p>
                <p>BATCH-2024-001</p>
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default BarcodeTracking;