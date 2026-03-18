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
import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";



type ProductUI = {
  id: string;
  code: string;
  name: string;
  category: string;
  warehouse: string;
  current: number;
  max: number;
  unit: string;
  value: string;
  status: string;
};

const Inventory = () => {
  const [products, setProducts] = useState<ProductUI[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();

      const formatted: ProductUI[] = res.data.map((item: any) => {
        const p = item.product;
        const variants = item.variants || [];

        const totalStock = variants.reduce(
          (sum: number, v: any) => sum + (v.stock || 0),
          0
        );

        return {
          id: p._id,
          code: p._id.slice(-5),
          name: p.name,
          category:
            typeof p.category === "object"
              ? p.category?.name
              : p.category || "N/A",
          warehouse: "Main Warehouse",
          current: totalStock,
          max: 100,
          unit: "pcs",
          value: p.price || 0,
          status: totalStock < 20 ? "low" : "in",
        };
      });

      setProducts(formatted);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();

    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Dashboard calculations
  const totalItems = products.length;

  const totalValue = products.reduce(
    (sum: number, p) => sum + p.value,
    0
  );

  const lowStockItems = products.filter(p => p.status === "low").length;

  const stockMovements = products.reduce(
    (sum: number, p) => sum + p.current,
    0
  );

  const dashboardCards = [
    {
      title: "Total Items",
      value: totalItems,
      subtitle: "All products",
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Value",
      value: `₹${totalValue}`,
      subtitle: "Inventory worth",
      icon: IndianRupee,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems,
      subtitle: "Needs attention",
      icon: ShoppingCart,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Stock Movements",
      value: stockMovements,
      subtitle: "Total stock units",
      icon: Clock,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];



  return (
    <div className="min-h-screen bg-blue-50 p-6 space-y-6">
      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ===== TABS ===== */}
      <Tabs defaultValue="overview">
        <div className="flex items-center justify-between">
          <TabsList className="bg-[#94A3B8] h-12 rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="px-6 rounded-lg data-[state=active]:bg-white"
            >
              Stock Overview
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

          <div className="flex gap-3">
            <input
              placeholder="Search items..."
              className="h-11 w-[280px] rounded-lg border px-4 text-sm border hover:border-blue-500 transition-all"
            />
            <button className="rounded-lg bg-white text-black h-11 px-4">
              <Filter className="h-5 w-5 text-gray-700" />
            </button>
            <button className="h-11 px-4 rounded-lg border bg-white font-medium">
              Export
            </button>
          </div>
        </div>

        {/* ===== TABLE ===== */}
        <TabsContent value="overview">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-4">
            <div className="grid grid-cols-8 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-600">
              <div>Code</div>
              <div>Item</div>
              <div>Category</div>
              <div>Warehouse</div>
              <div className="col-span-2">Stock</div>
              <div>Value</div>
              <div>Status</div>
            </div>

            {products?.map((item) => {
              const percent = item.max
                ? Math.round((item.current / item.max) * 100)
                : 0;

              const barColor =
                percent <= 30 ? "bg-orange-500" : "bg-blue-600";

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-8 items-center px-6 py-4 border-t hover:bg-gray-50"
                >
                  <div className="font-mono">{item.code}</div>
                  <div>{item.name}</div>
                  <div>{item.category}</div>
                  <div>{item.warehouse}</div>

                  <div className="col-span-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {item.current} {item.unit}
                      </span>
                      <span className="text-gray-400">
                        / {item.max}
                      </span>
                    </div>

                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
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
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default Inventory;