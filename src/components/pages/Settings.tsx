
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const themes = [
  { name: "Glacier", color: "bg-sky-600" },
  { name: "Ocean", color: "bg-blue-500" },
  { name: "Forest", color: "bg-emerald-500" },
  { name: "Sunset", color: "bg-orange-500" },
]

import { Building2, Globe, Bell, ShieldAlert, Database, Palette, Save } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { API_BASE_URL } from "../../config/http"
import { getSavedSettings, saveSettingsLocal } from "../../utils/settingsHelper"

/* ================= Notification Item ================= */
const NotificationItem = ({
  title,
  description,
  defaultChecked = false,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) => {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="space-y-1">
        <Label className="text-base font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Switch
        defaultChecked={defaultChecked}
        className="
          h-6 w-11 rounded-full
          data-[state=checked]:bg-blue-700
          data-[state=unchecked]:bg-slate-200
          [&>span]:h-5
          [&>span]:w-5
          [&>span]:rounded-full
          [&>span]:bg-white
        "
      />
    </div>
  )
}

/* ================= Settings Page ================= */
const Settings = () => {
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/settings/get`)
      .then(res => {
        if (res.data && res.data.success && res.data.data) {
          const s = res.data.data;
          setOrgName(s.orgName || "");
          setContactEmail(s.contactEmail || "");
          setIndustryType(s.industryType || "");
          setPhone(s.phone || "");
          setAddress(s.address || "");
          setTimezone(s.timezone || "");
          setCurrency(s.currency || "");
          setDateFormat(s.dateFormat || "");
          saveSettingsLocal(s); // Update local cache
        }
      })
      .catch(err => {
        console.warn("Failed to load settings from API, loading local cache", err);
        const s = getSavedSettings();
        setOrgName(s.orgName);
        setContactEmail(s.contactEmail);
        setIndustryType(s.industryType);
        setPhone(s.phone);
        setAddress(s.address);
        setTimezone(s.timezone);
        setCurrency(s.currency);
        setDateFormat(s.dateFormat);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSaveSettings = async () => {
    // Client-side validations
    if (!orgName.trim() || orgName.trim().length < 3) {
      toast.error("Failed to save settings. Organization Name must be at least 3 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail.trim() || !emailRegex.test(contactEmail.trim())) {
      toast.error("Failed to save settings. Please provide a valid Contact Email.");
      return;
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!phone.trim() || !phoneRegex.test(phone.trim())) {
      toast.error("Failed to save settings. Please provide a valid Phone Number containing digits.");
      return;
    }

    if (!address.trim()) {
      toast.error("Failed to save settings. Address is required.");
      return;
    }

    if (!timezone) {
      toast.error("Failed to save settings. Time Zone is required.");
      return;
    }

    if (!currency) {
      toast.error("Failed to save settings. Currency is required.");
      return;
    }

    if (!dateFormat) {
      toast.error("Failed to save settings. Date Format is required.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        orgName: orgName.trim(),
        contactEmail: contactEmail.trim(),
        industryType: industryType.trim() || "Inventory Management",
        phone: phone.trim(),
        address: address.trim(),
        timezone,
        currency,
        dateFormat
      };

      const res = await axios.put(`${API_BASE_URL}/settings/update`, payload);

      if (res.data && res.data.success) {
        toast.success("Organization settings updated successfully.");
        saveSettingsLocal(res.data.data);
      } else {
        toast.error("Failed to save settings. Please try again.");
      }
    } catch (err: any) {
      console.error("Save Settings Error:", err);
      const msg = err.response?.data?.message || "Failed to save settings. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#EFF6FF]">
      <Tabs defaultValue="general" className="w-full pt-4 pl-6  ">

        {/* ================= Tabs Header ================= */}
        <TabsList className="bg-[#94A3B8] rounded-xl p-1 w-ful  ">
          <TabsTrigger value="general" className=" text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all">general</TabsTrigger>
          <TabsTrigger value="notification" className=" text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all">Notification</TabsTrigger>
          <TabsTrigger value="security" className=" text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all">Security</TabsTrigger>
          <TabsTrigger value="integrations" className=" text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all">Integrations</TabsTrigger>
          <TabsTrigger value="Appearance" className=" text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all">Appearnce</TabsTrigger>
        </TabsList>

        {/* ================= ITEMS ================= */}
        <TabsContent value="general" className="mt-6">
          <div className="p-6 bg-[#EFF6FF]min-h-screen">

            <Card className="p-6 rounded-xl mb-6">
              <div className="flex items-start gap-4 mb-6">
                <Button variant="secondary">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </Button>
                <div>
                  <h2 className="text-2xl font-semibold">Organization Details</h2>
                  <p className="text-muted-foreground">
                    Basic information about your organization
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Organization Name</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Organization Name" />
                </div>

                <div>
                  <Label>Contact Email</Label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="admin@organization.com" />
                </div>

                <div>
                  <Label>Industry</Label>
                  <Select value={industryType} onValueChange={(val) => setIndustryType(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="IT Services">IT Services</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Inventory Management">Inventory Management</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact Phone" />
                </div>

                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <textarea
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Company Address"
                    className="w-full rounded-md border bg-slate-50 px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-xl bg-slate-50">
              <div className="flex items-start gap-4 mb-6">
                <Button variant="secondary">
                  <Globe className="w-6 h-6 text-blue-600" />
                </Button>
                <div>
                  <h2 className="text-2xl font-semibold">Regional Settings</h2>
                  <p className="text-muted-foreground">
                    Configure timezone, currency and formats
                  </p>
                </div>
                
              </div>
              <div className="w-full">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  
                  {/* Timezone */}
                  <div className="flex flex-col gap-1">
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={(val) => setTimezone(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="America/New York (EST)">America/New York (EST)</SelectItem>
                          <SelectItem value="Europe/London (GMT)">Europe/London (GMT)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency */}
                  <div className="flex flex-col gap-1">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="INR (₹)">INR (₹)</SelectItem>
                          <SelectItem value="USD ($)">USD ($)</SelectItem>
                          <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Format */}
                  <div className="flex flex-col gap-1">
                    <Label>Date Format</Label>
                    <Select value={dateFormat} onValueChange={(val) => setDateFormat(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Date Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </div>
            </Card>

            {/* Save Settings Action Button */}
            <div className="w-full flex flex-col sm:flex-row sm:justify-end pt-6">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isLoading}
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition duration-200 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? "Saving..." : "Save Settings"}</span>
              </Button>
            </div>

          </div>
        </TabsContent>

        {/* ================= CATEGORIES ================= */}
        <TabsContent value="notification" className="mt-6">
          <Card className="p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Bell />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Email Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Configure which events trigger email alerts
                </p>
              </div>
            </div>

            <NotificationItem title="Material Request Submitted" description="When a new material request is created" defaultChecked />
            <NotificationItem title="Approval Required" description="When items need your approval" defaultChecked />
            <NotificationItem title="PO Generated" description="When a purchase order is created" defaultChecked />
            <NotificationItem title="GRN Received" description="When goods are received at warehouse" defaultChecked />
            <NotificationItem title="QC Status Update" description="When quality check status changes" />
            <NotificationItem title="Low Stock Alert" description="When inventory falls below threshold" />
          </Card>
        </TabsContent>

        {/* ================= WAREHOUSES ================= */}
        <TabsContent value="security" className="mt-6">
           <Card className="p-6 rounded-xl">
          <div>
            <div className="flex gap-3">
              <div className="pt-3">
         <Button className="bg-red-100 pt-2"> <ShieldAlert className="w-6 h-6 text-red-500" /></Button>
              </div>
              <div>
                <h1 className="text-2xl">Password Policy</h1>
                <p>Set Requirements for user passwords</p>
              </div>
            </div>
            <br />
            <div className="flex gap-20">
              <div>
               
               <Label>Minimum Length</Label><br/>
                <Input defaultValue="8" className="w-100" />
              </div>
              <div>
                     <Label>Password Expiry (days)</Label><br />
                <Input defaultValue="90"  className="w-100 "/>
              </div>
            </div>
             <NotificationItem
              title="Require Uppercase"
              description="At least one uppercase letter"
              defaultChecked
            />
            <NotificationItem
              title=" Required Number"
              description="At least one number"
              defaultChecked
            />
            <NotificationItem
              title="Require Special Charcters"
              description="At least one special character"
              defaultChecked
            />
            <NotificationItem
              title="Two-factor Authentication"
              description="Enable 2FA for all users"
              defaultChecked
            />
            
          </div>
          </Card>
        </TabsContent>

        {/* ================= DEPARTMENTS ================= */}
        <TabsContent value="integrations" className="mt-6">
           <Card className="p-6 rounded-xl">
         <div className="space-y-10 p-4 md:p-6">

  {/* ================= External Integrations ================= */}
  <div className="space-y-6">

    {/* Header */}
    <div className="flex items-start gap-4">
      <Button>
        <Database className="w-6 h-6 text-emerald-500" />
      </Button>

      <div>
        <h1 className="text-2xl">External Integrations</h1>
        <p>Connect with third-party services</p>
      </div>
    </div>

    {/* Card 1 */}
    <div className="rounded-xl border-2 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="pl-2 md:pl-8">
          <h1 className="pt-1">ERP System</h1>
          <p>SAP Business One</p>
        </div>
        <Button className="w-full md:w-auto bg-blue-50 text-black">Configure</Button>
      </div>
    </div>

    {/* Card 2 */}
    <div className="rounded-xl border-2 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="pl-2 md:pl-8">
          <h1>Accounting Software</h1>
          <p>Connect to Tally or QuickBooks</p>
        </div>
        <Button className="w-full md:w-auto bg-[#0284C5]">Connect</Button>
      </div>
    </div>

    {/* Card 3 */}
    <div className="rounded-xl border-2 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="pl-2 md:pl-8">
          <h1>Accounting Software</h1>
          <p>Connect to Tally or QuickBooks</p>
        </div>
        <Button className="w-full md:w-auto bg-blue-50 text-black">Connect</Button>
      </div>
    </div>

    {/* Card 4 */}
    <div className="rounded-xl border-2 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="pl-2 md:pl-8">
          <h1>Accounting Software</h1>
          <p>Connect to Tally or QuickBooks</p>
        </div>
        <Button className="w-full md:w-auto bg-[#0284C5]">Connect</Button>
      </div>
    </div>

    {/* Card 5 */}
    <div className="rounded-xl border-2 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="pl-2 md:pl-8">
          <h1>Accounting Software</h1>
          <p>Connect to Tally or QuickBooks</p>
        </div>
        <Button className="w-full md:w-auto bg-blue-50 text-black">Connect</Button>
      </div>
    </div>

  </div>

  {/* api setting */}
  <div className="border-2 rounded-xl p-6 space-y-6">

    <div>
      <h1 className="text-2xl">API Settings</h1>
      <p>Manage API keys and webhooks</p>
    </div>

    {/* api key */}
    <div className="flex flex-col md:flex-row gap-4 md:items-end">
      <div className="w-full">
        <Label>Minimum Length</Label>
        <Input
          defaultValue="**8***"
          className="w-full bg-blue-50"
        />
      </div>
      <Button className="w-full md:w-auto bg-blue-50 text-black">
        Regenerate
      </Button>
    </div>

    {/* Webhook */}
    <div>
      <Label>Minimum Length</Label>
      <Input
        defaultValue="please write"
        className="w-full bg-blue-50"
      />
    </div>

  </div>

</div>

          </Card>
        </TabsContent>
         <TabsContent value="Appearance" className="mt-6">
          <Card className="p-6 rounded-xl">
           <div>
            <div className="flex gap-2">
              <div className="pt-3"> <Button className="bg-pink-50">< Palette  className="h-7 w-7 text-pink-500"/></Button></div>
              <div> 
                <h1 className="text-2xl">Theme Settings</h1>
                <p>Customize the look and feel</p>
              </div>

            </div>
            <div><div>
      <h2 className="text-lg font-semibold mb-4">Color Theme</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {themes.map((theme) => (
          <Card
            key={theme.name}
            className="
              h-28
              flex flex-col items-center justify-center
              cursor-pointer
              rounded-xl
              bg-slate-50
              hover:shadow-md
              transition
            "
          >
            <div
              className={`h-20 w-12 rounded-full mb-3 ${theme.color}`}
            />
            <p className="text-base font-medium">{theme.name}</p>
          </Card>
        ))}
      </div>
    </div><div>
      <div className="space-y-3">
        <NotificationItem
          title="Dark Mode"
          description="Use dark color scheme"
          defaultChecked
        />

        <NotificationItem
          title="Compact Mode"
          description="Reduce spacing for more content"
          defaultChecked
        />
      </div>
    </div>
    
    </div>
           </div>
           
           <div>
         
           </div>
          </Card>
          <br />
          <div>
            <div className="rounded-xl border-2 w-auto">
          <h1 className="text-2xl pl-4 pt-4">Branding</h1>
          <p className="pl-4">Upload your company logo</p>
       
          <div className="pt-12 pl-4 ">
          <div className="flex gap-4">
            <div>
              <Button>Setting</Button>
            </div>
            <div className="pb-2"> <Button className="bg-blue-50 text-black">Upload logo</Button><br />
            <p>PNG, JPG up to 2MB. Recommended size: 200x200px</p>
            </div>
          </div>
          </div>
         </div>

          
           <div className="w-full flex flex-col sm:flex-row sm:justify-end pt-4 pb-4" >
          <Button className="bg-blue-800 ">< Save />
           <span></span>
           <p>save changes</p>
       
           </Button>
      </div>
          </div>

        </TabsContent>
        </Tabs>
     
    </div>
  )
}

export default Settings
