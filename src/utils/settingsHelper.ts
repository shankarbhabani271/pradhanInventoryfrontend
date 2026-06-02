export interface InvenProSettings {
  orgName: string;
  contactEmail: string;
  industryType: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  dateFormat: string;
}

export const DEFAULT_SETTINGS: InvenProSettings = {
  orgName: "InvenPro Pvt Ltd",
  contactEmail: "admin@invenpro.com",
  industryType: "Inventory Management",
  phone: "+91 98765 43210",
  address: "123 Industrial Area, Mumbai, Maharashtra - 400001",
  timezone: "Asia/Kolkata (IST)",
  currency: "INR (₹)",
  dateFormat: "DD/MM/YYYY"
};

// Retrieve settings from local cache
export const getSavedSettings = (): InvenProSettings => {
  try {
    const cached = localStorage.getItem("invenpro_settings");
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Error reading settings from localStorage", e);
  }
  return DEFAULT_SETTINGS;
};

// Save settings to local cache and alert components
export const saveSettingsLocal = (settings: InvenProSettings) => {
  try {
    localStorage.setItem("invenpro_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("invenpro_settings_updated"));
  } catch (e) {
    console.error("Error writing settings to localStorage", e);
  }
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
