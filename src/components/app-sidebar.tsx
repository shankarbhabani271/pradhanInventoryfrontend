import {Settings,LogOut,Bell, BarChart3 ,Users,Truck,Package,Scan,ArrowLeftRight, 
  ClipboardCheck,Boxes,LayoutDashboard,FileText,CheckCircle,
   ChevronDown , ShoppingCart} from "lucide-react"

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


// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
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
    icon:  ShoppingCart,

    children: [
      {
        title: "Purchase requisition",
        url: "/procurement",
      },
      {
        title: "RFQ & Quotations",
        url: "/rfq-request/list",
      },
      {
        title: "Purchase Order",
        url: "/purchase-request/create",
      },
    ],
  },
  {
    title: "Inventory",
    icon:   LayoutDashboard,

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
    url: "/barcode&tracking",
    icon: Scan,
  },
   {
    title: "Returns (RTV)",
    url: "/returns",
    icon: ArrowLeftRight,
  },
   {
    title: "Vendors",
    url: "/vendors",
    icon: Truck,
  },
  {
    title: "Masters",
    icon:   Package,

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
    url: "/user",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3 ,
  },
{
    title: "Settings",
    url: "/settings",
    icon: Settings ,
  },
  
 
]

export function AppSidebar() {
  
const navigate = useNavigate();

const handleLogout = async () => {
  await logoutUser();   // call backend logout
  navigate("/login");   // redirect
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
        <h1 className="text-lg font-bold text-black">
          InvenPro
        </h1>
      </div>
    </div>

    {/* ===== SCROLLABLE MENU ===== */}
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <SidebarContent>
        <SidebarGroup>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.children ? (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full text-sm font-medium">
                            <Icon className="w-5 h-5" />
                            <span className="flex-1">{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

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
            <span className="text-white font-semibold">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium text-black">John Doe</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Bell className="h-5 w-5 cursor-pointer text-black" />
          <LogOut className="h-5 w-5 cursor-pointer hover:text-red-500" 
           onClick={handleLogout}/>
        </div>
      </div>
    </div>

  </div>
</Sidebar>

  )
}
