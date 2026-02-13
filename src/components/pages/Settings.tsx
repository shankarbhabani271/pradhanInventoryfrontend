
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

import { Building2, Globe, Bell,ShieldAlert,Database, Palette,Save } from "lucide-react"

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
  return (
    <div className="bg-slate-50">
      <Tabs defaultValue="items" className="w-full pt-4 pl-6 ">

        {/* ================= Tabs Header ================= */}
        <TabsList className="bg-[#94A3B8] rounded-xl p-1 w-ful ">
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
          <div className="p-6 bg-slate-50 min-h-screen">

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
                  <Input defaultValue="InvenPro Pvt Ltd" />
                </div>

                <div>
                  <Label>Contact Email</Label>
                  <Input type="email" defaultValue="admin@invenpro.com" />
                </div>

                <div>
                  <Label>Industry</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="it">IT Services</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input defaultValue="+91 98765 43210" />
                </div>

                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <textarea
                    rows={4}
                    defaultValue="123 Industrial Area, Mumbai, Maharashtra - 400001"
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
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Asia/Kolkata (IST)" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
            <SelectItem value="america-newyork">America/New York (EST)</SelectItem>
            <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    {/* Currency */}
    <div className="flex flex-col gap-1">
      <Label>Currency</Label>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="INR (₹)" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="INR">INR (₹)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    {/* Date Format */}
    <div className="flex flex-col gap-1">
      <Label>Date Format</Label>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="DD/MM/YYYY" />
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
