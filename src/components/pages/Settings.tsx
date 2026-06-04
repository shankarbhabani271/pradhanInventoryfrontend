
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

import {
  Building2, Globe, Bell, ShieldAlert, Database, Palette, Save,
  Upload, Trash2, RefreshCw, Settings2, ChevronRight,
  Zap, Shield, Plug, Brush, CheckCircle2, AlertCircle, ImagePlus,
  Lock, Key,
} from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
import { API_BASE_URL } from "../../config/http"
import { getSavedSettings, saveSettingsLocal, buildLogoUrl } from "../../utils/settingsHelper"

/* ── Tab definitions ── */
const TABS = [
  { key: "general",      label: "General",       icon: Settings2, badge: null },
  { key: "notification", label: "Notifications", icon: Bell,      badge: "6"  },
  { key: "security",     label: "Security",      icon: Shield,    badge: null },
  { key: "integrations", label: "Integrations",  icon: Plug,      badge: null },
  { key: "appearance",   label: "Appearance",    icon: Brush,     badge: null },
]

const THEMES = [
  { name: "Ocean",   from: "#0284C5", to: "#3B82F6" },
  { name: "Violet",  from: "#7C3AED", to: "#A855F7" },
  { name: "Emerald", from: "#059669", to: "#10B981" },
  { name: "Sunset",  from: "#EA580C", to: "#F59E0B" },
  { name: "Rose",    from: "#E11D48", to: "#F43F5E" },
  { name: "Slate",   from: "#334155", to: "#64748B" },
]

/* ── Reusable styled pieces ── */
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
    {children}
  </p>
)

const Field = ({
  label, children,
}: {
  label: string; children: React.ReactNode
}) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    {children}
  </div>
)

const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-200 dark:border-slate-600
      bg-white dark:bg-slate-700/60
      text-slate-800 dark:text-slate-100
      placeholder:text-slate-400 dark:placeholder:text-slate-500
      px-4 py-2.5 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
      transition-all duration-150 ${props.className ?? ""}`}
  />
)

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border border-slate-200 dark:border-slate-600
      bg-white dark:bg-slate-700/60
      text-slate-800 dark:text-slate-100
      placeholder:text-slate-400 dark:placeholder:text-slate-500
      px-4 py-2.5 text-sm resize-none
      focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
      transition-all duration-150 ${props.className ?? ""}`}
  />
)

const Card = ({
  accent, children,
}: {
  accent: string; children: React.ReactNode
}) => (
  <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60
    rounded-2xl shadow-lg dark:shadow-slate-900/50 overflow-hidden">
    <div className="h-1" style={{ background: accent }} />
    <div className="p-6">{children}</div>
  </div>
)

const CardHeader = ({
  gradient, icon: Icon, title, subtitle,
}: {
  gradient: string; icon: React.ElementType; title: string; subtitle: string
}) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
      style={{ background: gradient }}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
)

const ToggleRow = ({
  icon: Icon, title, description, defaultChecked = false,
}: {
  icon?: React.ElementType; title: string; description: string; defaultChecked?: boolean
}) => (
  <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
    <Switch defaultChecked={defaultChecked}
      className="data-[state=checked]:bg-blue-600 shrink-0" />
  </div>
)

const StyledSelect = ({
  value, onValueChange, placeholder, children,
}: {
  value: string; onValueChange: (v: string) => void;
  placeholder: string; children: React.ReactNode
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 h-10 text-sm focus:ring-blue-500/30">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
      <SelectGroup>{children}</SelectGroup>
    </SelectContent>
  </Select>
)

const GradBtn = ({
  onClick, disabled, children, gradient = "linear-gradient(135deg,#2563EB,#4F46E5)",
}: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode; gradient?: string
}) => (
  <button
    onClick={onClick} disabled={disabled}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
      shadow-lg transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-60"
    style={{ background: gradient }}
  >
    {children}
  </button>
)

const OutlineBtn = ({
  onClick, disabled, children,
}: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode
}) => (
  <button
    onClick={onClick} disabled={disabled}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
      border border-slate-200 dark:border-slate-600
      text-slate-700 dark:text-slate-200
      bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600
      transition-all duration-150 disabled:opacity-60"
  >
    {children}
  </button>
)

const DangerBtn = ({
  onClick, disabled, children,
}: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode
}) => (
  <button
    onClick={onClick} disabled={disabled}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
      text-red-500 dark:text-red-400
      bg-red-50 dark:bg-red-900/20
      border border-red-100 dark:border-red-800/40
      hover:bg-red-100 dark:hover:bg-red-900/30
      transition-all duration-150 disabled:opacity-60"
  >
    {children}
  </button>
)

/* ═══════════════════════ MAIN ═══════════════════════ */
const Settings = () => {
  const [activeTab, setActiveTab] = useState("general")

  const [orgName,      setOrgName]      = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [industryType, setIndustryType] = useState("")
  const [phone,        setPhone]        = useState("")
  const [address,      setAddress]      = useState("")
  const [timezone,     setTimezone]     = useState("")
  const [currency,     setCurrency]     = useState("")
  const [dateFormat,   setDateFormat]   = useState("")
  const [isLoading,    setIsLoading]    = useState(false)

  const [logoUrl,         setLogoUrl]         = useState("")
  const [logoPreview,     setLogoPreview]     = useState<string | null>(null)
  const [logoFile,        setLogoFile]        = useState<File | null>(null)
  const [logoError,       setLogoError]       = useState("")
  const [isDragging,      setIsDragging]      = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [selectedTheme,   setSelectedTheme]   = useState(0)

  const ALLOWED_TYPES = ["image/png","image/jpeg","image/jpg","image/svg+xml"]
  const ALLOWED_EXTS  = [".png",".jpg",".jpeg",".svg"]
  const MAX_SIZE      = 2 * 1024 * 1024

  // Permissions Check
  const token = localStorage.getItem("token")
  const decodeJwt = (t: string) => {
    try {
      const base64Url = t.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      return JSON.parse(atob(base64))
    } catch (e) { return null }
  }
  const claims = token ? decodeJwt(token) : null
  const role = (claims?.role || localStorage.getItem("role") || "").toLowerCase()
  const canManageLogo = ["admin", "super_admin", "owner"].includes(role)

  const validateFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve("The selected file is not a valid image.")
        return
      }
      if (file.size > MAX_SIZE) {
        resolve("Maximum file size allowed is 2 MB.")
        return
      }
      
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve("")
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve("The selected file is not a valid image.")
      }
      img.src = url
    })
  }, [])

  const applyFile = useCallback(async (file: File) => {
    if (!canManageLogo) {
      setLogoError("You do not have permission to upload, replace, or modify the organization logo.")
      return
    }
    try {
      const err = await validateFile(file)
      if (err) { setLogoError(err); setLogoFile(null); setLogoPreview(null); return }
      setLogoError(""); setLogoFile(file)
      const r = new FileReader()
      r.onload = (e) => setLogoPreview(e.target?.result as string)
      r.readAsDataURL(file)
    } catch (e) {
      setLogoError("The uploaded image is corrupted or cannot be processed.")
      setLogoFile(null)
      setLogoPreview(null)
    }
  }, [validateFile, canManageLogo])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false)
    if (!canManageLogo) return
    const f = e.dataTransfer.files?.[0]; if (f) applyFile(f)
  }, [applyFile, canManageLogo])

  const handleUploadLogo = async () => {
    if (!canManageLogo) {
      toast.error("You do not have permission to upload, replace, or modify the organization logo.")
      return
    }
    if (!logoFile) return
    setIsUploadingLogo(true)
    try {
      const fd = new FormData(); fd.append("logo", logoFile)
      const res = await axios.post(`${API_BASE_URL}/settings/upload-logo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      if (res.data?.success) {
        const url = res.data.logoUrl || res.data.data?.logoUrl;
        const v = Date.now()
        setLogoUrl(url); setLogoPreview(null); setLogoFile(null)
        saveSettingsLocal({ logoUrl: url, logoVersion: v })
        toast.success("Logo saved — all branding locations updated instantly.")
      } else toast.error(res.data?.message || "Upload failed.")
    } catch (err: any) { toast.error(err.response?.data?.message || "Upload failed.")
    } finally { setIsUploadingLogo(false) }
  }

  const handleRemoveLogo = async () => {
    if (!canManageLogo) {
      toast.error("You do not have permission to upload, replace, or modify the organization logo.")
      return
    }
    if (logoPreview && !logoUrl) {
      setLogoPreview(null); setLogoFile(null); setLogoError(""); return
    }
    setIsLoading(true)
    try {
      const res = await axios.delete(`${API_BASE_URL}/settings/remove-logo`)
      if (res.data?.success) {
        setLogoUrl(""); setLogoPreview(null); setLogoFile(null)
        saveSettingsLocal({ logoUrl: "", logoVersion: 0 })
        toast.success("Logo removed.")
      } else toast.error(res.data?.message || "Removal failed.")
    } catch (err: any) { toast.error(err.response?.data?.message || "Removal failed.")
    } finally { setIsLoading(false) }
  }

  useEffect(() => {
    setIsLoading(true)
    axios.get(`${API_BASE_URL}/settings/get`)
      .then(res => {
        if (res.data?.success && res.data?.data) {
          const s = res.data.data
          setOrgName(s.orgName||""); setContactEmail(s.contactEmail||"")
          setIndustryType(s.industryType||""); setPhone(s.phone||"")
          setAddress(s.address||""); setTimezone(s.timezone||"")
          setCurrency(s.currency||""); setDateFormat(s.dateFormat||"")
          setLogoUrl(s.logoUrl||""); saveSettingsLocal(s)
        }
      })
      .catch(() => {
        const s = getSavedSettings()
        setOrgName(s.orgName); setContactEmail(s.contactEmail)
        setIndustryType(s.industryType); setPhone(s.phone)
        setAddress(s.address); setTimezone(s.timezone)
        setCurrency(s.currency); setDateFormat(s.dateFormat)
        setLogoUrl(s.logoUrl||"")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = async () => {
    if (!orgName.trim()||orgName.trim().length<3){toast.error("Org name ≥ 3 chars");return}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())){toast.error("Valid email required");return}
    if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())){toast.error("Valid phone required");return}
    if (!address.trim()){toast.error("Address required");return}
    if (!timezone){toast.error("Timezone required");return}
    if (!currency){toast.error("Currency required");return}
    if (!dateFormat){toast.error("Date format required");return}
    setIsLoading(true)
    try {
      let currentLogoUrl = logoUrl
      let currentVersion = savedV

      // Upload selected logo first as part of Save Settings
      if (logoFile && canManageLogo) {
        const fd = new FormData(); fd.append("logo", logoFile)
        const uploadRes = await axios.post(`${API_BASE_URL}/settings/upload-logo`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        if (uploadRes.data?.success) {
          currentLogoUrl = uploadRes.data.logoUrl || uploadRes.data.data?.logoUrl;
          currentVersion = Date.now()
          setLogoUrl(currentLogoUrl)
          setLogoPreview(null)
          setLogoFile(null)
        } else {
          toast.error(uploadRes.data?.message || "Logo upload failed.")
          setIsLoading(false)
          return
        }
      }

      const res = await axios.put(`${API_BASE_URL}/settings/update`,{
        orgName:orgName.trim(),contactEmail:contactEmail.trim(),
        industryType:industryType.trim()||"Inventory Management",
        phone:phone.trim(),address:address.trim(),timezone,currency,dateFormat
      })
      if(res.data?.success){
        // Fetch latest settings from API to sync all clients and local state
        const freshRes = await axios.get(`${API_BASE_URL}/settings/get`)
        if (freshRes.data?.success && freshRes.data?.data) {
          const freshSettings = freshRes.data.data
          console.log("Saved Organization Settings:", freshSettings)
          saveSettingsLocal(freshSettings)
          setOrgName(freshSettings.orgName || "")
          setLogoUrl(freshSettings.logoUrl || "")
        }
        toast.success("Settings saved successfully.")
      }
      else toast.error("Failed to save.")
    }catch(err:any){toast.error(err.response?.data?.message||"Failed to save.")}
    finally{setIsLoading(false)}
  }

  const savedV = getSavedSettings().logoVersion??0
  const logoSrc = logoPreview ? logoPreview : buildLogoUrl(logoUrl,savedV,API_BASE_URL)

  return (
    /* Force the page to have a consistent background in both light/dark */
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* Top bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-3">
          <span>Admin</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Settings</span>
        </div>

        <div className="flex items-center justify-between
          bg-white dark:bg-slate-800/90
          border border-slate-200 dark:border-slate-700/60
          rounded-2xl px-6 py-4 shadow-md dark:shadow-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: "linear-gradient(135deg,#3B82F6,#6366F1)" }}>
              <Settings2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Manage preferences, branding &amp; system configuration
              </p>
            </div>
          </div>

          {activeTab === "general" && (
            <GradBtn onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4" />
              {isLoading ? "Saving…" : "Save Settings"}
            </GradBtn>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-5 px-6 pb-8">

        {/* ── Tab sidebar ── */}
        <div className="w-52 shrink-0">
          <div className="bg-white dark:bg-slate-800/90
            border border-slate-200 dark:border-slate-700/60
            rounded-2xl shadow-md dark:shadow-slate-900/50 p-2 sticky top-4">
            {TABS.map(({ key, label, icon: Icon, badge }) => {
              const active = activeTab === key
              return (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                    transition-all duration-150 mb-1 last:mb-0
                    ${active
                      ? "text-white shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    }`}
                  style={active ? { background: "linear-gradient(135deg,#3B82F6,#6366F1)" } : {}}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                  <span className="flex-1 text-left">{label}</span>
                  {badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      ${active ? "bg-white/25 text-white" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"}`}>
                      {badge}
                    </span>
                  )}
                  {active && <ChevronRight className="h-3.5 w-3.5 text-white/70" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ═══ GENERAL ═══ */}
          {activeTab === "general" && (
            <>
              {/* Logo Card */}
              <Card accent="linear-gradient(90deg,#3B82F6,#6366F1,#8B5CF6)">
                <CardHeader gradient="linear-gradient(135deg,#3B82F6,#6366F1)"
                  icon={ImagePlus} title="Organization Logo"
                  subtitle="Appears across header, sidebar, login & reports" />

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Drop zone */}
                  <div
                    id="logo-drop-zone"
                    onClick={() => { if (canManageLogo) logoInputRef.current?.click() }}
                    onDragOver={(e) => { e.preventDefault(); if (canManageLogo) setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center
                      rounded-2xl border-2 border-dashed transition-all duration-300
                      min-h-[200px] w-full lg:w-72 shrink-0 group
                      ${!canManageLogo
                        ? "border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/20 cursor-not-allowed"
                        : isDragging
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01] cursor-pointer"
                          : logoSrc
                            ? "border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 cursor-pointer"
                            : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer"
                      }`}
                  >
                    <input ref={logoInputRef} id="logo-file-input" type="file"
                      disabled={!canManageLogo}
                      accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) applyFile(f); e.target.value = "" }} />

                    {logoSrc ? (
                      <div className="flex flex-col items-center gap-3 p-5">
                        <div className="relative">
                          <img key={logoSrc} src={logoSrc} alt="Logo preview"
                            className="max-h-28 max-w-[200px] object-contain rounded-xl shadow-sm"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                          {canManageLogo && (
                            <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                              <span className="bg-white dark:bg-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                                <RefreshCw className="h-3 w-3" /> Change
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-center px-8 py-10">
                        <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)" }}>
                          <Upload className="h-7 w-7 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {canManageLogo ? "Click or drag & drop" : "Logo Upload Restricted"}
                          </p>
                        </div>
                      </div>
                    )}
                    {isDragging && canManageLogo && (
                      <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-blue-500/10">
                        <div className="bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xl">
                          Drop here ✓
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right */}
                  <div className="flex flex-col gap-5 flex-1">
                    {/* Status / Permission Message */}
                    {!canManageLogo && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                          You do not have permission to upload, replace, or modify the organization logo.
                        </p>
                      </div>
                    )}
                    {canManageLogo && logoUrl && !logoFile && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Logo is live across the application</p>
                      </div>
                    )}
                    {canManageLogo && logoFile && !logoError && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                        <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Preview ready — click "Save Settings" at top to publish</p>
                      </div>
                    )}
                    {logoError && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">{logoError}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {canManageLogo && (
                      <div>
                        <FieldLabel>Actions</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          <OutlineBtn onClick={() => logoInputRef.current?.click()} disabled={isLoading}>
                            <Upload className="h-4 w-4" /> {!logoUrl && !logoPreview ? "Upload logo" : "Replace"}
                          </OutlineBtn>
                          {(logoUrl || logoPreview) && (
                            <DangerBtn onClick={handleRemoveLogo} disabled={isLoading}>
                              <Trash2 className="h-4 w-4" /> Remove
                            </DangerBtn>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    <div>
                      <FieldLabel>Recommended Sizes</FieldLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label:"Header",     size:"200 × 60 px", cls:"bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/40 text-blue-700 dark:text-blue-400"    },
                          { label:"Sidebar",    size:"180 × 50 px", cls:"bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/40 text-violet-700 dark:text-violet-400" },
                          { label:"Login page", size:"250 × 80 px", cls:"bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/40 text-sky-700 dark:text-sky-400"          },
                          { label:"Reports",    size:"150 × 50 px", cls:"bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400" },
                        ].map(({ label, size, cls }) => (
                          <div key={label} className={`border rounded-xl px-3 py-2.5 ${cls}`}>
                            <p className="text-xs font-bold">{label}</p>
                            <p className="text-[11px] font-mono opacity-80 mt-0.5">{size}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </Card>

              {/* Org Details */}
              <Card accent="linear-gradient(90deg,#6366F1,#8B5CF6)">
                <CardHeader gradient="linear-gradient(135deg,#6366F1,#8B5CF6)"
                  icon={Building2} title="Organization Details"
                  subtitle="Basic information about your organization" />
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Organization Name">
                    <Inp value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="InvenPro Pvt Ltd" />
                  </Field>
                  <Field label="Contact Email">
                    <Inp type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="admin@org.com" />
                  </Field>
                  <Field label="Industry">
                    <StyledSelect value={industryType} onValueChange={setIndustryType} placeholder="Select industry">
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="IT Services">IT Services</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Inventory Management">Inventory Management</SelectItem>
                    </StyledSelect>
                  </Field>
                  <Field label="Phone">
                    <Inp value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Address">
                      <Textarea rows={3} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Company Address" />
                    </Field>
                  </div>
                </div>
              </Card>

              {/* Regional */}
              <Card accent="linear-gradient(90deg,#0D9488,#0891B2)">
                <CardHeader gradient="linear-gradient(135deg,#0D9488,#0891B2)"
                  icon={Globe} title="Regional Settings"
                  subtitle="Configure timezone, currency and date formats" />
                <div className="grid sm:grid-cols-3 gap-5">
                  <Field label="Timezone">
                    <StyledSelect value={timezone} onValueChange={setTimezone} placeholder="Select Timezone">
                      <SelectItem value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New York (EST)">America/New York (EST)</SelectItem>
                      <SelectItem value="Europe/London (GMT)">Europe/London (GMT)</SelectItem>
                    </StyledSelect>
                  </Field>
                  <Field label="Currency">
                    <StyledSelect value={currency} onValueChange={setCurrency} placeholder="Select Currency">
                      <SelectItem value="INR (₹)">INR (₹)</SelectItem>
                      <SelectItem value="USD ($)">USD ($)</SelectItem>
                      <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                    </StyledSelect>
                  </Field>
                  <Field label="Date Format">
                    <StyledSelect value={dateFormat} onValueChange={setDateFormat} placeholder="Date Format">
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </StyledSelect>
                  </Field>
                </div>
              </Card>
            </>
          )}

          {/* ═══ NOTIFICATIONS ═══ */}
          {activeTab === "notification" && (
            <Card accent="linear-gradient(90deg,#F59E0B,#EF4444)">
              <CardHeader gradient="linear-gradient(135deg,#F59E0B,#EF4444)"
                icon={Bell} title="Email Notifications"
                subtitle="Configure which events trigger email alerts" />
              <ToggleRow icon={Bell} title="Material Request Submitted"  description="When a new material request is created"        defaultChecked />
              <ToggleRow icon={Bell} title="Approval Required"           description="When items need your approval"                defaultChecked />
              <ToggleRow icon={Bell} title="Purchase Order Generated"    description="When a purchase order is created"             defaultChecked />
              <ToggleRow icon={Bell} title="GRN Received"               description="When goods are received at warehouse"         defaultChecked />
              <ToggleRow icon={Bell} title="QC Status Update"           description="When quality check status changes" />
              <ToggleRow icon={Bell} title="Low Stock Alert"            description="When inventory falls below threshold" />
              <ToggleRow icon={Bell} title="Vendor Invoice Due"         description="When a vendor invoice approaches due date" />
              <ToggleRow icon={Bell} title="Budget Threshold Exceeded"  description="When spending exceeds set budget limits" />
            </Card>
          )}

          {/* ═══ SECURITY ═══ */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <Card accent="linear-gradient(90deg,#EF4444,#EC4899)">
                <CardHeader gradient="linear-gradient(135deg,#EF4444,#EC4899)"
                  icon={ShieldAlert} title="Password Policy"
                  subtitle="Set requirements for user passwords" />
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <Field label="Minimum Length">
                    <Inp type="number" defaultValue="8" />
                  </Field>
                  <Field label="Password Expiry (days)">
                    <Inp type="number" defaultValue="90" />
                  </Field>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-2">
                  <ToggleRow icon={Key}  title="Require Uppercase"         description="At least one uppercase letter"    defaultChecked />
                  <ToggleRow icon={Key}  title="Require Number"            description="At least one number"             defaultChecked />
                  <ToggleRow icon={Key}  title="Require Special Character" description="At least one special character"  defaultChecked />
                  <ToggleRow icon={Lock} title="Two-Factor Authentication" description="Enable 2FA for all users"        defaultChecked />
                </div>
              </Card>
              <Card accent="linear-gradient(90deg,#7C3AED,#6366F1)">
                <CardHeader gradient="linear-gradient(135deg,#7C3AED,#6366F1)"
                  icon={Shield} title="Session & Access"
                  subtitle="Control user session and access controls" />
                <ToggleRow icon={Shield} title="Auto Logout on Inactivity" description="Logout after 30 min of inactivity" defaultChecked />
                <ToggleRow icon={Shield} title="IP Restriction"            description="Restrict access to whitelisted IPs" />
                <ToggleRow icon={Shield} title="Audit Logging"             description="Log all admin actions for review"  defaultChecked />
              </Card>
            </div>
          )}

          {/* ═══ INTEGRATIONS ═══ */}
          {activeTab === "integrations" && (
            <div className="space-y-5">
              <Card accent="linear-gradient(90deg,#059669,#0891B2)">
                <CardHeader gradient="linear-gradient(135deg,#059669,#0891B2)"
                  icon={Database} title="External Integrations"
                  subtitle="Connect with third-party services and tools" />
                <div className="space-y-3">
                  {[
                    { name:"ERP System",          sub:"SAP Business One",            configured:true  },
                    { name:"Accounting Software", sub:"Tally / QuickBooks",           configured:false },
                    { name:"Shipping Provider",   sub:"FedEx / DHL",                 configured:false },
                    { name:"Payment Gateway",     sub:"Razorpay / Stripe",            configured:false },
                    { name:"Analytics",           sub:"Google Analytics / Mixpanel",  configured:false },
                  ].map(({ name, sub, configured }) => (
                    <div key={name}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl
                        border border-slate-100 dark:border-slate-700/60
                        bg-white/60 dark:bg-slate-700/30
                        hover:border-blue-200 dark:hover:border-blue-700/60
                        hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${configured ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                          <Plug className={`h-4 w-4 ${configured ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
                        </div>
                      </div>
                      {configured ? (
                        <span className="text-xs font-bold px-4 py-1.5 rounded-lg
                          bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400
                          border border-emerald-200 dark:border-emerald-800/40">✓ Configured</span>
                      ) : (
                        <GradBtn>Connect</GradBtn>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
              <Card accent="linear-gradient(90deg,#F59E0B,#EF4444)">
                <CardHeader gradient="linear-gradient(135deg,#F59E0B,#EF4444)"
                  icon={Zap} title="API Settings"
                  subtitle="Manage API keys and webhooks" />
                <div className="space-y-4">
                  <Field label="API Key">
                    <div className="flex gap-2">
                      <Inp defaultValue="sk-••••••••••••••••••••••••" className="font-mono" />
                      <OutlineBtn>Regenerate</OutlineBtn>
                    </div>
                  </Field>
                  <Field label="Webhook URL">
                    <Inp placeholder="https://your-server.com/webhook" />
                  </Field>
                </div>
              </Card>
            </div>
          )}

          {/* ═══ APPEARANCE ═══ */}
          {activeTab === "appearance" && (
            <div className="space-y-5">
              <Card accent="linear-gradient(90deg,#EC4899,#8B5CF6)">
                <CardHeader gradient="linear-gradient(135deg,#EC4899,#8B5CF6)"
                  icon={Palette} title="Theme & Appearance"
                  subtitle="Customize the look and feel of InvenPro" />
                <FieldLabel>Color Theme</FieldLabel>
                <div className="grid grid-cols-6 gap-3 mb-8">
                  {THEMES.map((t, i) => (
                    <button key={t.name} onClick={() => setSelectedTheme(i)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                        ${selectedTheme===i
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 scale-105 shadow-lg"
                          : "border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                        }`}>
                      <div className="h-10 w-10 rounded-xl shadow-md"
                        style={{ background: `linear-gradient(135deg,${t.from},${t.to})` }} />
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.name}</span>
                      {selectedTheme===i && (
                        <div className="h-1 w-6 rounded-full" style={{ background: `linear-gradient(90deg,${t.from},${t.to})` }} />
                      )}
                    </button>
                  ))}
                </div>
                <FieldLabel>Display Preferences</FieldLabel>
                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-2">
                  <ToggleRow icon={Brush} title="Dark Mode"    description="Use dark color scheme across the app"        defaultChecked />
                  <ToggleRow icon={Brush} title="Compact Mode" description="Reduce spacing to show more content at once" defaultChecked />
                  <ToggleRow icon={Brush} title="Animations"   description="Enable micro-animations and transitions"     defaultChecked />
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Settings
