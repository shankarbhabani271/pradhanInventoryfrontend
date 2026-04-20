import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// dashboard cards
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

const Masters = () => {
  const navigate = useNavigate();

  // ✅ STATE INSIDE COMPONENT
  const [products, setProducts] = useState([]);

  // ✅ FETCH FUNCTION
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/productmenu");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ LOAD DATA
  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:8080/api/productmenu/${id}`, {
        method: "DELETE",
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-blue-50 min-h-screen">

      {/* CARDS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${card.iconBg}`}>
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

      {/* ADD BUTTON */}
      <div className="flex items-center justify-between gap-4 mb-4">

  {/* SEARCH BOX */}
  <input
    type="text"
    placeholder="Search product..."
    className="w-full max-w-sm px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  {/* BUTTON */}
  <button
    onClick={() => navigate("/productmenu")}
    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
  >
    <Plus className="h-4 w-4" />
    Add New
  </button>

</div>
        

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
        <table className="w-full text-left border-collapse">

          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No Data Found
                </td>
              </tr>
            ) : (
              products.map((item, index) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">

                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className="p-3">₹ {item.price}</td>
                  <td className="p-3">{item.stock}</td>

                  <td className="p-3 flex justify-center gap-3">

                    {/* EDIT */}
                    <button
                      onClick={() => navigate("/productmenu")}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default Masters;