//import { Outlet } from "react-router-dom";
// import { Suspense } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Bell } from "lucide-react";
import type React from "react";
// import Loader from "./components/Loader";

import { useState, useEffect } from "react";
import { getSavedSettings } from "./utils/settingsHelper";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState(getSavedSettings());
  const [theme, setTheme] = useState(() => localStorage.getItem("invenpro_theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("invenpro_theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeUpdate = () => {
      setTheme(localStorage.getItem("invenpro_theme") || "light");
    };
    window.addEventListener("invenpro_theme_changed", handleThemeUpdate);
    return () => {
      window.removeEventListener("invenpro_theme_changed", handleThemeUpdate);
    };
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getSavedSettings());
    };
    window.addEventListener("invenpro_settings_updated", handleUpdate);
    return () => {
      window.removeEventListener("invenpro_settings_updated", handleUpdate);
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-300">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b dark:border-slate-800/80">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Dashboard</h1>
                    <span className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                      {settings.orgName}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400 font-semibold">
                    Welcome back! Here's what's happening today at {settings.orgName}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="hidden sm:block w-60 rounded-lg border dark:border-slate-800 px-3 py-2 text-sm bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Bell className="h-6 w-6 text-gray-700 dark:text-slate-355 text-slate-700 dark:text-slate-200" />
              </div>
            </div>
          </header>

          {/* 🔥 THIS IS THE KEY */}
          <main className="flex-1 overflow-y-auto bg-blue-50 dark:bg-slate-950 p-4 transition-colors duration-300">
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
