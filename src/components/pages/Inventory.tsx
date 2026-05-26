import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/http";

type ProductUI = {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
};

const Inventory = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductUI[]>([]);

  // ✅ FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/productmenu`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ DELETE PRODUCT
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      await fetch(`${API_BASE_URL}/productmenu/${id}`, {
        method: "DELETE",
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DASHBOARD
  const totalItems = products.length;

  const totalValue = products.reduce(
    (sum, p) => sum + p.price,
    0
  );

  const lowStockItems = products.filter(p => p.stock < 20).length;

  const stockMovements = products.reduce(
    (sum, p) => sum + p.stock,
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

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex justify-between">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <Icon className={card.iconColor} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-sm">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* TABS */}
      <Tabs defaultValue="overview">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="overview">Stock</TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <input
              placeholder="Search..."
              className="h-11 w-[280px] rounded-lg border px-4"
            />
            <button className="bg-white px-4 rounded-lg">
              <Filter />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <TabsContent value="overview">
          <div className="bg-white rounded-xl border">
            <table className="w-full">

              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="p-3">ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      No Data
                    </td>
                  </tr>
                ) : (
                  products.map((item, index) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-3">{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.unit}</td>
                      <td>₹ {item.price}</td>
                      <td>{item.stock}</td>

                      <td className="flex gap-2 justify-center">
                        <button
                          onClick={() => navigate("/productmenu")}
                          className="p-2 bg-blue-100 rounded"
                        >
                          <Pencil />
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 bg-red-100 rounded"
                        >
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;