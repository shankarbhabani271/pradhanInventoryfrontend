import {Settings,LogOut,Bell, BarChart3 ,Users,Truck,Package,Scan,ArrowLeftRight, 
  ClipboardCheck,Boxes,LayoutDashboard,FileText,CheckCircle,
   ChevronDown , ShoppingCart} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
    title: "MaterialRequest",
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
    title: "QCmanagement",
    url: "/qcmanagement",
    icon: ClipboardCheck,
  },
  {
    title: "Barcode&Tracking",
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
  return (
    <Sidebar className="">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="border-b p-8 ">
             <div className="flex items-center gap-3 ">
    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0284C5]">
      <Boxes className="h-6 w-6 text-white" />
    </div>
    <div>
      <h1 className="text-lg font-semibold leading-none font-bold text-black">InvenPro</h1>
      
    </div>
  </div>
          </SidebarGroupLabel>
          <br />

          <SidebarGroupContent  className="text-[18px] font-medium text-6xl pl-6 ">
            <SidebarMenu className="text-5xl hover:text-blue-800">
              {items.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.children ? (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full font-medium  text-[14px] ">
  
                            <Icon className="w-5 h-12" />
                            <span className="flex-1">{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="text-black">
                          <ul className="ml-6 mt-1 space-y-1">
                            {item.children.map((sub) => (
                              <li key={sub.title} >
                                <a
                                  href={sub.url}
                                  className=" text-block rounded-md px-2 py-1 text-[15px] font-medium text-muted-foreground text-black hover:bg-[#0284C5] hover:text-accent-foreground"
>
                                
                                  {sub.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
       <SidebarFooter className="border-t p-3">
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span><button className="rounded-full bg-blue-950 pl-2 pr-2 pt-1 pb-1">
        <h1 className="text-white text-2xl">JD</h1>
        </button></span>
        <div className="pr-4">
          <h1 className=" text-black">John doe</h1>
          <h6 className="text-card-foreground">
            Admin
          </h6>
        </div>
      <div className="flex gap-2">
        <Bell className="h-6 w-6 cursor-pointer text-black" />
        <LogOut className="h-4 w-4 cursor-pointer hover:text-red-500" />
      </div>
    </div>
  </SidebarFooter>
    </Sidebar>
  )
}
