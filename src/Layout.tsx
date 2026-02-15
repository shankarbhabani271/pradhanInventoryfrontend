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
  <div className="flex h-screen w-full">

    {/* ================= SIDEBAR ================= */}
    <AppSidebar />

    {/* ================= MAIN AREA ================= */}
    <div className="flex flex-1 flex-col">

      {/* ---------- HEADER (FIXED) ---------- */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">

          {/* Left */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-6 w-6" />

            <div>
              <h1 className="text-lg font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back! Here's what's happening today.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="hidden sm:block w-60 rounded-lg border px-3 py-2 text-sm"
            />

            <div className="relative cursor-pointer">
              <Bell className="h-6 w-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center
                               justify-center rounded-full bg-red-600 text-[10px]
                               font-semibold text-white">
                3
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ---------- DASHBOARD CONTENT (SCROLLS) ---------- */}
      <main className="flex-1 overflow-y-auto bg-blue-50 p-4 sm:p-6">
        {children}
      </main>

    </div>
  </div>
</SidebarProvider>

   
    
  );
}
