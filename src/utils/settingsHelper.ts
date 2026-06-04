export interface InvenProSettings {
  orgName: string;
  contactEmail: string;
  industryType: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  logoUrl: string;
  logoVersion: number; // epoch ms — bumped on every upload/remove for cache-busting
}

export const DEFAULT_SETTINGS: InvenProSettings = {
  orgName: "InvenPro Pvt Ltd",
  contactEmail: "admin@invenpro.com",
  industryType: "Inventory Management",
  phone: "+91 98765 43210",
  address: "123 Industrial Area, Mumbai, Maharashtra - 400001",
  timezone: "Asia/Kolkata (IST)",
  currency: "INR (₹)",
  dateFormat: "DD/MM/YYYY",
  logoUrl: "",
  logoVersion: 0,
};

// Retrieve settings from local cache
export const getSavedSettings = (): InvenProSettings => {
  try {
    const cached = localStorage.getItem("invenpro_settings");
    if (cached) {
      const parsed = JSON.parse(cached);
      // Back-fill logoVersion if missing (older cache)
      if (!parsed.logoVersion) parsed.logoVersion = 0;
      return parsed;
    }
  } catch (e) {
    console.error("Error reading settings from localStorage", e);
  }
  return { ...DEFAULT_SETTINGS };
};

// Save settings to local cache and broadcast to all listeners
export const saveSettingsLocal = (settings: Partial<InvenProSettings>) => {
  try {
    const current = getSavedSettings();
    const merged: InvenProSettings = { ...current, ...settings };
    localStorage.setItem("invenpro_settings", JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("invenpro_settings_updated", { detail: merged }));
  } catch (e) {
    console.error("Error writing settings to localStorage", e);
  }
};

/**
 * Build a cache-busted absolute URL for the org logo.
 * Returns "" if no logo is set (caller should show default fallback).
 *
 * @param logoUrl   - e.g. "/uploads/logos/org-logo-1234.png"
 * @param version   - epoch timestamp; bumped on every upload/remove
 * @param apiBase   - e.g. "https://backend.onrender.com/api"
 */
export const buildLogoUrl = (
  logoUrl: string,
  version: number,
  apiBase: string,
): string => {
  if (!logoUrl) return "";
  const base = apiBase.replace(/\/api\/?$/, "");
  const path = logoUrl.startsWith("http") ? logoUrl : `${base}${logoUrl}`;
  return version ? `${path}?v=${version}` : path;
};


// Parse and format any date based on settings
export const formatDate = (dateInput: any, dateFormat: string = "DD/MM/YYYY"): string => {
  if (!dateInput) return "";
  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    const parsedStr = String(dateInput).trim();
    if (!parsedStr) return "";
    
    // Parse DD/MM/YYYY or DD-MM-YYYY format specifically
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(parsedStr)) {
      const parts = parsedStr.split("/");
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(parsedStr)) {
      const parts = parsedStr.split("-");
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      date = new Date(parsedStr);
    }
  }

  if (isNaN(date.getTime())) {
    return String(dateInput); // Fallback to raw input
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (dateFormat === "MM/DD/YYYY") {
    return `${month}/${day}/${year}`;
  } else if (dateFormat === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  } else {
    return `${day}/${month}/${year}`;
  }
};

// Extract Currency symbol
export const getCurrencySymbol = (currencySetting: string): string => {
  if (currencySetting.includes("INR") || currencySetting.includes("₹")) return "₹";
  if (currencySetting.includes("USD") || currencySetting.includes("$")) return "$";
  if (currencySetting.includes("EUR") || currencySetting.includes("€")) return "€";
  return "₹"; // Default
};

// Calculate Date and Time for Timezone
export const getFormattedDateTimeForTimezone = (timezone: string, dateFormat: string) => {
  let ianaName = "Asia/Kolkata";
  if (timezone.includes("Asia/Kolkata")) ianaName = "Asia/Kolkata";
  else if (timezone.includes("America/New York") || timezone.includes("America/New_York")) ianaName = "America/New_York";
  else if (timezone.includes("Europe/London")) ianaName = "Europe/London";

  const now = new Date();

  // Format Time
  let timeStr = "";
  try {
    timeStr = now.toLocaleTimeString("en-US", {
      timeZone: ianaName,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  } catch (e) {
    timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  }

  // Format Date in timezone
  try {
    const tzDateParts = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaName,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(now);

    const month = tzDateParts.find(p => p.type === "month")?.value || "01";
    const day = tzDateParts.find(p => p.type === "day")?.value || "01";
    const year = tzDateParts.find(p => p.type === "year")?.value || "2026";
    
    if (dateFormat === "MM/DD/YYYY") {
      return { date: `${month}/${day}/${year}`, time: timeStr };
    } else if (dateFormat === "YYYY-MM-DD") {
      return { date: `${year}-${month}-${day}`, time: timeStr };
    } else {
      return { date: `${day}/${month}/${year}`, time: timeStr };
    }
  } catch (e) {
    return { date: formatDate(now, dateFormat), time: timeStr };
  }
};
