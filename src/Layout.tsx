import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Bell, Boxes } from "lucide-react";
import type React from "react";

import { useState, useEffect } from "react";
import { getSavedSettings, buildLogoUrl } from "./utils/settingsHelper";
import { API_BASE_URL } from "./config/http";

/* ── Org logo with guaranteed Boxes fallback ─────────────────────────────── */
const OrgLogo = ({
  logoSrc,
  orgName,
}: {
  logoSrc: string;
  orgName: string;
}) => {
  const [failed, setFailed] = useState(false);

  // Reset when src changes (new upload)
  useEffect(() => { setFailed(false); }, [logoSrc]);

  if (logoSrc && !failed) {
    return (
      <img
        key={logoSrc}
        src={logoSrc}
        alt={orgName}
        className="object-contain rounded"
        style={{ maxWidth: 160, maxHeight: 44 }}
        onError={(e) => {
          console.log("Logo failed to load", e);
          setFailed(true);
        }}
      />
    );
  }

  // Fallback: blue box with Boxes icon
  return (
    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#0284C5] shrink-0">
      <Boxes className="h-5 w-5 text-white" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState(getSavedSettings());
  const [theme, setTheme] = useState(
    () => localStorage.getItem("invenpro_theme") || "light"
  );

  /* Apply dark/light class to <html> */
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("invenpro_theme", theme);
  }, [theme]);

  /* Listen for theme toggle */
  useEffect(() => {
    const handler = () =>
      setTheme(localStorage.getItem("invenpro_theme") || "light");
    window.addEventListener("invenpro_theme_changed", handler);
    return () => window.removeEventListener("invenpro_theme_changed", handler);
  }, []);

  /* Live settings (including logoUrl / logoVersion) via CustomEvent */
  useEffect(() => {
    const handler = (e: Event) => {
      const updated = (e as CustomEvent).detail;
      setSettings(updated ?? getSavedSettings());
    };
    window.addEventListener("invenpro_settings_updated", handler);
    return () => window.removeEventListener("invenpro_settings_updated", handler);
  }, []);

  const logoSrc = buildLogoUrl(
    settings.logoUrl,
    settings.logoVersion ?? 0,
    API_BASE_URL
  );

  console.log("Settings object:", settings);
  console.log("Logo URL:", settings.logoUrl);
  console.log("Generated URL via buildLogoUrl:", logoSrc);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-300">
        <AppSidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* ═════════ STICKY TOP HEADER ═════════ */}
          <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5">

              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-6 w-6 text-slate-600 dark:text-slate-300 shrink-0" />

                {/* Org logo — shows image or Boxes fallback */}
                <OrgLogo logoSrc={logoSrc} orgName={settings.orgName} />

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-none">
                      Dashboard
                    </h1>
                    <span className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 rounded-full px-2.5 py-0.5 uppercase tracking-wider hidden sm:inline">
                      {settings.orgName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 hidden sm:block">
                    Welcome back! Here's what's happening today.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search..."
                  className="hidden md:block w-52 rounded-lg border border-slate-200 dark:border-slate-700
                    px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800
                    text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
                />
                <div className="relative">
                  <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
                </div>
              </div>

            </div>
          </header>

          {/* ═════════ PAGE CONTENT ═════════ */}
          <main className="flex-1 overflow-y-auto bg-blue-50 dark:bg-slate-950 p-4 transition-colors duration-300">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
