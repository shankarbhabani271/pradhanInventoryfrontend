
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
} from "lucide-react";

/* ---------------- DASHBOARD CARDS ---------------- */
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

/* ---------------- USERS DATA ---------------- */
const users = [
  {
    initials: "JD",
    name: "John Doe",
    id: "USR-001",
    email: "john.doe@company.com",
    phone: "+91 98765 43210",
    department: "Production",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-15 10:30 AM",
    highlight: true,
  },
  {
    initials: "SW",
    name: "Sarah Wilson",
    id: "USR-002",
    email: "sarah.wilson@company.com",
    phone: "+91 87654 32109",
    department: "Warehouse",
    role: "Manager",
    status: "Active",
    lastLogin: "2024-01-15 09:15 AM",
  },
  {
    initials: "MS",
    name: "Mike Smith",
    id: "USR-003",
    email: "mike.smith@company.com",
    phone: "+91 76543 21098",
    department: "Procurement",
    role: "User",
    status: "Active",
    lastLogin: "2024-01-14 04:45 PM",
  },
  {
    initials: "PP",
    name: "Priya Patel",
    id: "USR-004",
    email: "priya.patel@company.com",
    phone: "+91 65432 10987",
    department: "QC",
    role: "Manager",
    status: "Inactive",
    lastLogin: "2024-01-10 02:00 PM",
  },
];

/* ---------------- COMPONENT ---------------- */
const User = () => {
  return (
    <div className="p-6 bg-blue-50 min-h-screen space-y-6">

      {/* Dashboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {card.title}
                </CardTitle>
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
      <Tabs defaultValue="users">
        <TabsList className="bg-[#94A3B8] rounded-xl p-1 w-fit">
          <TabsTrigger value="users" className="px-6 data-[state=active]:bg-white rounded-lg">
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="px-6 data-[state=active]:bg-white rounded-lg">
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="px-6 data-[state=active]:bg-white rounded-lg">
            Permissions Matrix
          </TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="mt-6">
          <Card className="p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">User Management</h1>
              <div className="flex gap-4">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Search users..."
                    className="w-full pl-9 py-2 border rounded-lg"
                  />
                </div>
                <Button className="bg-[#0284C7]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-7 text-sm font-semibold border-b pb-3">
              <div>User</div>
              <div>Contact</div>
              <div>Department</div>
              <div>Role</div>
              <div>Status</div>
              <div>Last Login</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Rows */}
            {users.map((u, i) => (
              <div
                key={i}
                className={`grid grid-cols-7 items-center py-5 border-b ${
                  u.highlight ? "bg-slate-300" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                    {u.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-600">{u.id}</p>
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <p className="flex gap-2"><Mail className="h-4 w-4" /> {u.email}</p>
                  <p className="flex gap-2"><Phone className="h-4 w-4" /> {u.phone}</p>
                </div>

                <div>{u.department}</div>

                <Badge className={
                  u.role === "Admin" ? "bg-red-200 text-red-600" :
                  u.role === "Manager" ? "bg-blue-200 text-blue-600" :
                  "bg-emerald-200 text-emerald-600"
                }>
                  {u.role}
                </Badge>

                <Badge className={u.status === "Active"
                  ? "bg-emerald-200 text-emerald-700"
                  : "bg-slate-400 text-slate-900"
                }>
                  {u.status}
                </Badge>

                <div className="flex gap-2 text-sm">
                  <Calendar className="h-4 w-4" /> {u.lastLogin}
                </div>

                <div className="flex justify-center">
                  <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* ROLES TAB */}
        <TabsContent value="roles" className="mt-6">
          <Card className="p-6">Roles management here</Card>
        </TabsContent>

        {/* PERMISSIONS TAB */}
        <TabsContent value="permissions" className="mt-6">
          <Card className="p-6">Permissions matrix here</Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default User;
