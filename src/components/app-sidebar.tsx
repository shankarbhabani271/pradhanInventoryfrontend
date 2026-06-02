import { Settings, LogOut, Bell, BarChart3, Users, Truck, Package, Scan, ArrowLeftRight, 
  ClipboardCheck, Boxes, LayoutDashboard, FileText, CheckCircle,
  ChevronDown, ShoppingCart } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  
  SidebarGroup,
  SidebarGroupContent,
 
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { logoutUser } from "@/utils/logout";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react";
import { getSavedSettings } from "../utils/settingsHelper";


// Dynamic sidebar items based on role
const getSidebarItems = (role: string) => {
  const adminItems = [
    {
      title: "Dashboard",
      url: "/admin-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Material Request",
      url: "/material-request",
      icon: FileText,
    },
    {
      title: "Apporavals",
      url: "/apporavals",
      icon: CheckCircle,
    },
    {
      title: "Procurement",
      url: "/procurement",
      icon: ShoppingCart,
      children: [
        {
          title: "Purchase Requisition",
          url: "/procurement",
        },
        {
          title: "Purchase Request Center",
          url: "/poo",
        },
        {
          title: "Purchase Requests List",
          url: "/purchase-request-list",
        },
      ],
    },
    {
      title: "Inventory",
      icon: LayoutDashboard,
      children: [
        {
          title: "Stock Overview",
          url: "/Inventory",
        },
        {
          title: "GRN (inward)",
          url: "/Stock-request/list",
        },
        {
          title: "Material Issue",
          url: "/stock-request/create",
        },
        {
          title: "Stock Adjustment",
          url: "/stock-request/create",
        },
      ],
    },
    {
      title: "QC Management",
      url: "/qcmanagement",
      icon: ClipboardCheck,
    },
    {
      title: "Barcode & Tracking",
      url: "/barcode-tracking",
      icon: Scan,
    },
    {
      title: "Returns (RTV)",
      url: "/returns",
      icon: ArrowLeftRight,
    },
    {
      title: "Vendors",
      url: "/procurement/vendor",
      icon: Truck,
    },
    {
      title: "Masters",
      icon: Package,
      children: [
        {
          title: "Stock Overview",
          url: "/masters",
        },
        {
          title: "GRN (inward)",
          url: "/Stock-request/list",
        },
        {
          title: "Material Issue",
          url: "/stock-request/create",
        },
        {
          title: "Stock Adjustment",
          url: "/stock-request/create",
        },
      ],
    },
    {
      title: "Users & Roles",
      icon: Users,
      children: [
        {
          title: "User List",
          url: "/user",
        },
        {
          title: "Invite Employee",
          url: "/createemployee",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  if (role === "admin") {
    return adminItems;
  }

  if (role === "manager") {
    return [
      {
        title: "Dashboard",
        url: "/manager-dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Material Request",
        url: "/material-request",
        icon: FileText,
      },
      {
        title: "Apporavals",
        url: "/apporavals",
        icon: CheckCircle,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ];
  }

  if (role === "procurement") {
    return [
      {
        title: "Dashboard",
        url: "/procurement-dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Procurement",
        url: "/procurement",
        icon: ShoppingCart,
        children: [
          {
            title: "Purchase Requisition",
            url: "/procurement",
          },
          {
            title: "Purchase Request Center",
            url: "/poo",
          },
          {
            title: "Purchase Requests List",
            url: "/purchase-request-list",
          },
        ],
      },
      {
        title: "Vendors",
        url: "/procurement/vendor",
        icon: Truck,
      },
      {
        title: "QC Management",
        url: "/qcmanagement",
        icon: ClipboardCheck,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ];
  }

  if (role === "inventory") {
    return [
      {
        title: "Dashboard",
        url: "/inventory-dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Inventory",
        icon: LayoutDashboard,
        children: [
          {
            title: "Stock Overview",
            url: "/Inventory",
          },
          {
            title: "GRN (inward)",
            url: "/Stock-request/list",
          },
          {
            title: "Material Issue",
            url: "/stock-request/create",
          },
          {
            title: "Stock Adjustment",
            url: "/stock-request/create",
          },
        ],
      },
      {
        title: "QC Management",
        url: "/qcmanagement",
        icon: ClipboardCheck,
      },
      {
        title: "Barcode & Tracking",
        url: "/barcode-tracking",
        icon: Scan,
      },
      {
        title: "Returns (RTV)",
        url: "/returns",
        icon: ArrowLeftRight,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ];
  }

  // default / employee
  return [
    {
      title: "Dashboard",
      url: "/employee-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Create Request",
      url: "/material-request",
      icon: FileText,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];
};

export function AppSidebar() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSavedSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getSavedSettings());
    };
    window.addEventListener("invenpro_settings_updated", handleUpdate);
    return () => {
      window.removeEventListener("invenpro_settings_updated", handleUpdate);
    };
  }, []);

  const role = localStorage.getItem("role") || "employee";
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  const name = user?.name || (role === "admin" ? "Admin User" : "Employee");
  const email = user?.email || "";
  const filteredItems = getSidebarItems(role);

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "JD";

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    await logoutUser(); // call backend logout
    navigate("/login", { replace: true }); // redirect
    window.location.reload();
  };

  return (
    <Sidebar className="h-screen ">
      {/* Wrapper */}
      <div className="flex h-full flex-col">
        {/* ===== HEADER (STICKY) ===== */}
        <div className="sticky top-0 z-50 border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0284C5]">
              <Boxes className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-black max-w-[130px] truncate" title={settings.orgName}>
              {settings.orgName}
            </h1>
          </div>
        </div>

        {/* ===== SCROLLABLE MENU ===== */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.title}>
                        {item.children ? (
                          <Collapsible className="w-full">
                            {item.url ? (
                              <div className="flex items-center justify-between w-full rounded-md hover:bg-slate-100/80 group">
                                <SidebarMenuButton asChild className="flex-1 text-sm font-medium">
                                  <Link to={item.url}>
                                    <Icon className="w-5 h-5" />
                                    <span>{item.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                                <CollapsibleTrigger asChild>
                                  <button className="p-2 text-slate-500 hover:text-slate-900 focus:outline-none shrink-0">
                                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                  </button>
                                </CollapsibleTrigger>
                              </div>
                            ) : (
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton className="w-full text-sm font-medium">
                                  <Icon className="w-5 h-5" />
                                  <span className="flex-1">{item.title}</span>
                                  <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                            )}

                            <CollapsibleContent>
                              <ul className="ml-6 mt-2 space-y-1">
                                {item.children.map((sub) => (
                                  <li key={sub.title}>
                                    <Link
                                      to={sub.url}
                                      className="block rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-[#d2e0f4] hover:text-black"
                                    >
                                      {sub.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <SidebarMenuButton asChild>
                            <Link to={item.url}>
                              <Icon className="w-5 h-5" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </div>

        {/* ===== FOOTER (FIXED) ===== */}
        <div className="border-t bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#0284C5] flex items-center justify-center">
                <span className="text-white font-semibold">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-black max-w-[120px] truncate">{name}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Bell className="h-5 w-5 cursor-pointer text-black" />
              <LogOut
                className="h-5 w-5 cursor-pointer hover:text-red-500"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
