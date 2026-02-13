
import { Card, CardContent, CardHeader, CardTitle ,} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";




import { FileText, IndianRupee, ShoppingCart, Clock ,MoreHorizontal} from "lucide-react";


const dashboardCards = [
  {
    title: "Open Requests",
    value: "24",
    subtitle: "+3 from yesterday",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    subtitleColor: "text-muted-foreground",
  },
  {
    title: "Pending Approvals",
    value: "8",
    subtitle: "-2 from yesterday",
    icon: IndianRupee,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    subtitleColor: "text-muted-foreground",
  },
  {
    title: "Active POs",
    value: "12",
    subtitle: "+5 this week",
    icon: ShoppingCart,
    iconBg: "bg-purple-100",
    iconColor: "text-green-500 text-2xl",
  },
  {
    title: "Low Stock Items",
    value: "5",
    subtitle: "Requires attention",
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    valueSize: "text-5xl",
  },
];

const Procurement = () => {
  return (
    <div>
       < div className="p-4 space-y-4 bg-blue-50 min-h-screen">
            
            {/* Header */}
            <div>
             
            </div>
      
            {/* Cards */}
            {/* Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ">
              {dashboardCards.map((card, index) => {
                const Icon = card.icon;
      
                return (
                  <Card key={index} className="rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </CardTitle>
      
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.iconBg}`}
                      >
                        <Icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                    </CardHeader>
      
                    <CardContent>
                      <div className={`font-bold ${card.valueSize ?? "text-3xl"}`}>
                        {card.value}
                      </div>
      
                      <p
                        className={`mt-1 text-sm ${
                          card.subtitleColor ?? "text-muted-foreground"
                        }`}
                      >
                        {card.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
           </div>
           <div>
            <div className='pl-4 pt-4.5 flex gap-70'>
                 <Tabs defaultValue="inspections" className="w-full text-black">
        <TabsList className="bg-[#94A3B8]">
          <TabsTrigger value="inspections" className="flex-1 flex items-center justify-center
             h-full text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all">Inspections</TabsTrigger>
          <TabsTrigger value="checklists"
          className="flex-1 flex items-center justify-center
             h-full text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all"
          >Checklists</TabsTrigger>
        </TabsList>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="mt-6">
          <Card>
            <CardContent className="p-0">
               <div className='bg-blue-50'>
        <div className="p-6">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* main heading for  */}
        <div className="grid grid-cols-8 bg-gray-200 p-4 font-semibold text-sm">
          <div>Reference</div>
          <div>vender</div>
          <div>Date</div>
          <div> Delivery Date</div>
          <div>Items</div>
          <div>Amount</div>
          <div>Status</div>
          <div></div>
        </div>

        {/* bhabani 1 */}
        <div className="grid grid-cols-8 items-center p-4 border-t text-sm h-18 hover:bg-gray-100">
          <div className="font-semibold">PO-2024-0091</div>
          <div>tech Solution Ltd</div>
          <div>2024-01-15</div>
          <div>2024-01-25</div>
          <div>5</div>

          <div>
            $12,800
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              pending
            </span>
          </div>

          <div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>

        {/* bhabani 2 */}
        <div className="grid grid-cols-8 items-center p-4 border-t text-sm h-18 hover:bg-gray-100">
          <div className="font-semibold">PO-2024-0090</div>
          <div>Office Supplies Inc</div>
          <div>2024-01-14</div>
          <div>2024-01-20</div>
          <div>12</div>

          <div>
           $3,450
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
              approved
            </span>
          </div>

          <div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>
        {/* 3rd bhabani*/}
         <div className="grid grid-cols-8 items-center p-4 border-t text-sm h-18 hover:bg-gray-100">
          <div className="font-semibold">PO-2024-0089</div>
          <div>Saftey First Co</div>
          <div>2024-01-13</div>
          <div>2024-01-18</div>
          <div>8</div>

          <div>
           $5,200
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
              sent
            </span>
          </div>

          <div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>
        {/*4th bhabani  */}
         <div className="grid grid-cols-8 items-center p-4 border-t text-sm h-18 hover:bg-gray-100">
          <div className="font-semibold">PO-2024-0088</div>
          <div>Industrial parts ltd Co</div>
          <div>2024-01-12</div>
          <div>2024-01-17</div>
          <div>3</div>

          <div>
           $8,900
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
              partial
            </span>
          </div>

          <div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>
        {/*5th bhabnai */}
              <div className="grid grid-cols-8 items-center p-4 border-t text-sm h-18 hover:bg-gray-100">
          <div className="font-semibold">P0-2024-0087</div>
          <div>Electronics Hub</div>
          <div>2024-01-10</div>
          <div>2024-01-15</div>
          <div>6</div>

          <div>
           $4,300
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600 text-white">
              completed
            </span>
          </div>

          <div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>

       
       
      </div>
            </div>
           </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Checklist List */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>QC Checklists</CardTitle>
                <Button size="sm" className="bg-[#0284C5]">New Checklist</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border bg-muted/40">
                  <p className="font-medium">Steel Materials Inspection</p>
                  <p className="text-sm text-muted-foreground">
                    Raw Materials • 12 items
                  </p>
                </div>

                <div className="p-3 rounded-lg border">
                  <p className="font-medium">Electrical Components Check</p>
                  <p className="text-sm text-muted-foreground">
                    Electrical • 8 items
                  </p>
                </div>

                <div className="p-3 rounded-lg border">
                  <p className="font-medium">Safety Equipment Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Safety • 15 items
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Inspection Checklist Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Visual inspection for defects",
                  "Dimension verification",
                  "Weight measurement",
                  "Material composition test",
                  "Surface finish check",
                  "Packaging condition",
                  "Documentation verification",
                  "Batch/Serial number verification",
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="checkbox" className="accent-blue-600" />
                    {item}
                  </label>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-[#0284C5]">Mark as Pass</Button>
                  <Button variant="destructive" className="flex-1 bg-fuchsia-500">
                    Mark as Fail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
                <div>
                        <button className=' border-black rounded-sm bg-blue-600 pl-4 pr-4 pt-1 pb-1'>
                            <h1 className='text-white'>+ Create PO </h1>
                        </button>
                </div>
                
            </div>
            <div>
                <div>
         
        </div>

       
      </div>
      
    </div>
   
    </div>
    
    </div>
  )
}

export default Procurement
