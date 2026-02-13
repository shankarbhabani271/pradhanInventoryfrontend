




import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock,
 
  MoreHorizontal,
  Filter,
 
    
} from "lucide-react";

const dashboardCards = [
  {
    title: "Open Requests",
    value: "24",
    subtitle: "+3 from yesterday",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Pending Approvals",
    value: "8",
    subtitle: "-2 from yesterday",
    icon: IndianRupee,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Active POs",
    value: "12",
    subtitle: "+5 this week",
    icon: ShoppingCart,
    iconBg: "bg-purple-100",
    iconColor: "text-green-500",
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

const inventoryData = [
  {
    code: "ITM-001",
    name: "Safety Helmets",
    category: "Safety Equipment",
    warehouse: "Main Warehouse",
    current: 45,
    max: 100,
    unit: "pcs",
    value: "$1,350",
    status: "in",
  },
  {
    code: "ITM-002",
    name: "Printer Paper (A4)",
    category: "Stationery",
    warehouse: "Main Warehouse",
    current: 120,
    max: 500,
    unit: "reams",
    value: "$480",
    status: "in",
  },
  {
    code: "ITM-003",
    name: "Work Gloves",
    category: "Safety Equipment",
    warehouse: "Site B",
    current: 15,
    max: 100,
    unit: "pairs",
    value: "$225",
    status: "low",
  },
]
{inventoryData.map(() => null)}


const Returns = () => {
  return (
   <div className="p-4 space-y-4 bg-blue-50 min-h-screen">
         {/* Cards */}
         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
   
                   <p className="mt-1 text-sm text-muted-foreground">
                     {card.subtitle}
                   </p>
                 </CardContent>
               </Card>
             );
              })}
         </div>
         <div>
           
    </div>
     <Tabs defaultValue="overview">

        <div className="flex items-center justify-between">
          <TabsList className="bg-[#94A3B8] h-12 rounded-xl p-1 text-black">
            <TabsTrigger value="overview" className="flex-1 flex items-center justify-center
             h-full text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all" >
              Stock Overview
            </TabsTrigger>
            <TabsTrigger value="movements" className="px-6 rounded-lg data-[state=active]:bg-white">
              Movements
            </TabsTrigger>
            <TabsTrigger value="adjustments" className="px-6 rounded-lg data-[state=active]:bg-white">
              Adjustments
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <input
              placeholder="Search items..."
              className="h-11 w-[280px] rounded-lg border px-4 text-sm border 
                       hover:border-blue-500
                          data-[state=active]:border-blue-600
                     data-[state=active]:bg-blue-50
                            transition-all"
            />
            <button className=" rounded-lg bg-white text-black h-11 px-4 "><Filter className="h-5 w-5 text-gray-700"/></button>
            <button className="h-11 px-4 rounded-lg border bg-white font-medium">
              Export
            </button>
          </div>
         </div>

         {/* ===== TABLE ===== */}
         <TabsContent value="overview">
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
  
    
    
         </TabsContent>
         <TabsContent  value="movements" className='pt-12'>
              <div className='rounded-xl w-240 h-40 bg-white pt-15 pl-90'>
                  <h2>Showing pending returns only</h2>
              </div>
         </TabsContent>
         <TabsContent  value="adjustments" className='pt-12'>
              <div className='rounded-xl w-240 h-40 bg-white pt-15 pl-90'>
                  <h2>Showing pending returns only</h2>
              </div>
         </TabsContent>


          </Tabs>
        </div>
   
  )
}

export default Returns
