import React from 'react'


import { Card, CardHeader, CardTitle, CardContent,  CardDescription, } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,TabsTrigger,

} from "@/components/ui/tabs"

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


const User = () => {
  return (
    <div className="p-3 sm:p-4 bg-blue-50 min-h-screen space-y-6  w-full">

      {/* ================= DASHBOARD CARDS ================= */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="text-2xl sm:text-3xl font-bold">{card.value}</div>
                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
         <Tabs defaultValue="overview" className="w-full">
      <TabsList className='bg-[#666c78] text-black'>
        <TabsTrigger value="overview" className='cursor-pointer data-[state=active]:bg-white '>Overview</TabsTrigger>
        <TabsTrigger value="analytics" className='cursor-pointer data-[state=active]:bg-white' >Analytics</TabsTrigger>
        <TabsTrigger value="reports" className='cursor-pointer data-[state=active]:bg-white'>Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
           <div className="p-4 sm:p-6 bg-slate-50 min-h-screen w-full overflow-x-hidden">
      <div className="bg-white   shadow-sm p-4 sm:p-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold">
            User Management
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium">
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {/* ================= TABLE HEADER (DESKTOP) ================= */}
        <div className="hidden md:grid grid-cols-7 text-sm font-semibold text-gray-600 border-b pb-3">
          <div>User</div>
          <div>Contact</div>
          <div>Department</div>
          <div>Role</div>
          <div>Status</div>
          <div>Last Login</div>
          <div className="text-center">Actions</div>
        </div>

        {/* ================= TABLE ROWS (DESKTOP) ================= */}
        <div className="hidden md:block">
          {users.map((u, i) => (
            <div
              key={i}
              className="grid grid-cols-7 items-center py-5 border-b text-sm"
            >
              {/* USER */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {u.initials}
                </div>
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-gray-500">{u.id}</div>
                </div>
              </div>

              {/* CONTACT */}
              <div className="space-y-1">
                <div className="flex gap-2 items-center">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {u.email}
                </div>
                <div className="flex gap-2 items-center">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {u.phone}
                </div>
              </div>

              <div>{u.department}</div>

              {/* ROLE */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                  u.role === "Admin"
                    ? "bg-red-100 text-red-600"
                    : u.role === "Manager"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {u.role}
              </span>

              {/* STATUS */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                  u.status === "Active"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-300 text-gray-800"
                }`}
              >
                {u.status}
              </span>

              {/* LAST LOGIN */}
              <div className="flex gap-2 items-center">
                <Calendar className="h-4 w-4 text-gray-500" />
                {u.lastLogin}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-center">
                <MoreHorizontal className="h-5 w-5 cursor-pointer text-gray-600" />
              </div>
            </div>
          ))}
        </div>

        {/* ================= MOBILE CARD VIEW ================= */}
        <div className="md:hidden space-y-4 mt-4">
          {users.map((u, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 bg-white shadow-sm space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="font-semibold">{u.name}</div>
                <MoreHorizontal className="h-5 w-5" />
              </div>

              <div className="text-sm text-gray-600">{u.email}</div>
              <div className="text-sm">{u.phone}</div>

              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
                  {u.role}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    u.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-300 text-gray-800"
                  }`}
                >
                  {u.status}
                </span>
              </div>

              <div className="text-sm flex gap-2 items-center">
                <Calendar className="h-4 w-4 text-gray-500" />
                {u.lastLogin}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
         
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Track performance and user engagement metrics. Monitor trends and
              identify growth opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Page views are up 25% compared to last month.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and download your detailed reports. Export data in
              multiple formats for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 5 reports ready and available to export.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and options. Customize your
              experience to fit your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Configure notifications, security, and themes.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
      </div>
      </div>

  )
}

export default User
