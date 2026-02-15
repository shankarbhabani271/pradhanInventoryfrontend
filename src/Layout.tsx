import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Bell } from "lucide-react";
import { Oval } from "react-loader-spinner";

export default function Layout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ make state update async
    const start = setTimeout(() => {
      setLoading(true);
    }, 0);

    const stop = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [location.pathname]);

  return (
    <SidebarProvider>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <Oval
            height={80}
            width={80}
            color="#327fcd"
            secondaryColor="#32cd32"
            strokeWidth={4}
            ariaLabel="loading"
          />
        </div>
      )}

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

          <main className="flex-1 overflow-y-auto bg-blue-50 p-4 sm:p-6">
            {!loading && children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}
