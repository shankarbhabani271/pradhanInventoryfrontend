import { Outlet } from "react-router-dom";
// import { Suspense } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Bell } from "lucide-react";
import type React from "react";
// import Loader from "./components/Loader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 bg-white border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-6 w-6" />
                <div>
                  <h1 className="text-lg font-bold">Dashboard</h1>
                  
                  <p className="text-sm text-muted-foreground">
                    Welcome back! Here's what's happening today.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="hidden sm:block w-60 rounded-lg border px-3 py-2 text-sm"
                />
                <Bell className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </header>

          {/* 🔥 THIS IS THE KEY */}
          <main className="flex-1 overflow-y-auto bg-blue-50 p-4">
            {/* <Suspense fallback={<Loader />}> */}
              {children}
            {/* </Suspense> */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
