import  { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Phone,
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ Dashboard Cards
const dashboardCards = [
  {
    title: "Total Users",
    value: "24",
    subtitle: "+3 this month",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Admins",
    value: "6",
    subtitle: "Across departments",
    icon: IndianRupee,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Managers",
    value: "10",
    subtitle: "Active",
    icon: ShoppingCart,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Inactive Users",
    value: "3",
    subtitle: "Needs review",
    icon: Clock,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

const User = () => {
  interface UserType {
  _id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  description: string;
}

const [userList, setUserList] = useState<UserType[]>([]);
  const navigate = useNavigate();

  // ✅ State


  // ✅ Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/userdetails");
      const data = await res.json();
      setUserList(data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // ✅ Load data on page start
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className=" min-h-screen space-y-6">

      {/* ================= DASHBOARD ================= */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-500">{card.title}</h3>
                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                  <Icon className={card.iconColor} size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-2">{card.value}</h2>
              <p className="text-sm text-gray-400">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* ================= USER TABLE ================= */}
      <div className="bg-white rounded-xl shadow p-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>

          <div className="flex gap-3">
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search users..."
                className="outline-none text-sm"
              />
            </div>

            <button
              onClick={() => navigate("/userdetails")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm border-collapse">
          <thead className="text-white border-b bg-blue-500">
            <tr>
              <th className="text-left py-3 px-2">User</th>
              <th className="text-left py-3 px-2">Phone</th>
              <th className="text-left py-3 px-2">Email</th>
              <th className="text-left py-3 px-2">Company</th>
              <th className="text-left py-3 px-2">Description</th>
            </tr>
          </thead>

          <tbody>
            {userList.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">

                {/* User */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>
                </td>

                {/* Phone */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Phone size={14} /> {user.phone}
                  </div>
                </td>

                {/* Email */}
                <td className="py-3 px-2">{user.email}</td>

                {/* Company */}
                <td className="py-3 px-2">{user.company}</td>

                {/* Description */}
                <td className="py-3 px-2">{user.description}</td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {userList.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No users found
          </p>
        )}
      </div>
    </div>
  );
};

export default User;