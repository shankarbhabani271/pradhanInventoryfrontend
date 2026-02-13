import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
// import { AppSidebar } from "@/components/app-sidebar"
import { Bell } from "lucide-react";

export default function Layout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen overflow-hidden flex w-full ">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center w-full border rounded-sm px-4 py-4">

  {/* Title */}
  <div className="flex items-center gap-4 flex-1 ">
    <SidebarTrigger  className="h-2 w-2"/>

    <div>
      <h1 className="text-1xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        Welcome back! Here's what's happening today.
      </p>
    </div>
  </div>

  {/* Bell */}
  <div className="flex items-center gap-4">
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        className="w-60 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm
                   placeholder-gray-400 "
      />
    </div>

    <div className="relative inline-flex">
      <Bell className="w-6 h-6 text-gray-700" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center
                       rounded-full bg-red-600 text-[10px] font-semibold text-white">
        3
      </span>
    </div>
  </div>

</div>

         
          <main className=""> {children}</main>
        </main>
      </div>
      
    </SidebarProvider>
   
    
  );
}
