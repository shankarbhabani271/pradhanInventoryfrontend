
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FileText, IndianRupee, ShoppingCart, Clock,Eye ,CircleFadingPlus ,CircleX, FilePlus ,PackagePlus,BarChart3 , ClipboardCheck, Plus,
   ArrowDownRight, ArrowUpRight,AlertTriangle ,} from "lucide-react";


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

const Dashboard = () => {
  return (
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
    {/* End Cards */}
    
   <div className="flex">
    <div>
      <div className="p-2 flex gap-8">
        <div className="grid grid-cols-1 bg-white rounded-lg shadow-md p-4 w-150">
          <div className="flex justify-between gap-80 border-b pb-4 " >
            <div className="max-w-md ">
                Pending Approvals
            </div>
            <div>
              <p>View all</p>
            </div>

          </div>
          <div className="border-b pb-3">
                <div className="flex gap-14">
                  <div className="">
                     <div className="flex gap-3">
                      <div className="font-bold">
                          MR-2024-516
                      </div>
                      <div>
                        <div className="grid grid-cols-1 rounded-full bg-blue-200">
                          <p className="text-blue-800 pl-2 pr-2">high</p>

                        </div>
                      </div>

                     </div>
                     <div className="pb-2">
                      <p className="text-sm font-medium text-black">
                        Material request.sarah johnson
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">
                        today,10:30
                      </p>
                     </div>
                  </div>
                  <div className="flex gap-6 text-center pt-5 pl-24">
                    <div>
                           <h6>$2,450</h6>
                    </div>
                    <div>
                      <Eye />
                    </div>
                    <div className="text-emerald-400 h-0.5px">
                      <CircleFadingPlus />
                    </div>
                    <div className="text-rose-400 h-0.5px">
                        <CircleX />
                    </div>
                  </div>

                </div>
          </div>
          <div className="border-b pb-3">
               <div className="flex gap-14">
                  <div className="">
                    
                    <div className="flex gap-1.5 pt-2">
                           <div className="font-bold">
                                Mr-2024-0516
                           </div>
                           <div>
                            <div className="grid-grid-cols-1 rounded-full bg-blue-200">
                                   <p className="text-blue-800 pl-2 pr-2">
                                    high
                                   </p>
                            </div>
                           </div>
                           
                    </div>
                    <p className="text-sm font-medium text-black">
                      Material request.sarah johnson
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      today,10:30 AM
                    </p>
                  </div>
                  <div className="flex gap-6 text-center pt-5 pl-24">
                    <div>
                       <h6>$2,450</h6>
                    </div>
                    <div>
                      <Eye />
                    </div>
                    <div className="text-emerald-400 h-0.5px">
                      <CircleFadingPlus />
                    </div>
                    <div className="text-rose-400 h-0.5px">
                      <CircleX />
                    </div>
                  </div>
               </div>
          </div>
          <div className="">
            <div className="">
                   <div className="flex gap-14">
                       <div className="">
                        <div className="flex gap-1.5 pt-2">
                          <div className="font-bold">
                           Mr-2024-0516
                          </div>
                          <div className="">
                            <div className="grid grid-cols-1 rounded-full bg-blue-200">
                             <p className="text-blue-800 pl-2 pr-2">
                              high
                             </p>
                            </div>

                          </div>

                        </div>
                        <br />
                        <p className="text-sm font-medium text-black ">
                         Material Request .sarah Johnson
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">
                          Today,09:15AM
                        </p>
                       </div>
                       <div className="flex gap-6 text-center pt-5 pl-24">
                        <div>
                            <h6>$890</h6>
                        </div>
                        <div>
                          <Eye />
                        </div>
                        <div className="text-emerald-400">
                          <CircleFadingPlus />
                        </div>
                        <div  className="text-rose-400">
                          <CircleX />
                        </div>
                       </div>
                   </div>
            </div>
          </div>
              
        </div>
      </div>
    </div>
    <div>
      <div>
        <div>

        </div>
        <div className="max-w-md rounded-xl border bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quick Action</h2>
            <div className="flex items-center gap-1 text-blue-600">
              <Plus  className="w-4 h-4"/>
              Customize

            </div>
          </div>
       <div className="grid grid-cols-2 gap-4">

   {/* -- */}
   <div className="rounded-xl p-4 bg-blue-50 hover:bg-blue-100 transition cursor-pointer">
    <FilePlus className="w-6 h-6 text-blue-600 mb-2" />
    <h3 className="font-semibold text-blue-700">
      New Material Request
    </h3>
    <p className="text-sm text-blue-600">
      Create a new request for materials
    </p>
    </div>

   {/* record green */}
   <div className="rounded-xl p-4 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer">
    <PackagePlus className="w-6 h-6 text-emerald-600 mb-2" />
    <h3 className="font-semibold text-emerald-700">
      Record GRN
    </h3>
    <p className="text-sm text-emerald-600">
      Receive goods from vendor
    </p>
   </div>

   {/* qc insepction */}
   <div className="rounded-xl p-4 bg-orange-50 hover:bg-orange-100 transition cursor-pointer">
    <ClipboardCheck className="w-6 h-6 text-orange-600 mb-2" />
    <h3 className="font-semibold text-orange-700">
      QC Inspection
    </h3>
    <p className="text-sm text-orange-600">
      Start quality inspection
    </p>
   </div>

   {/* view reports */}
    <div className="rounded-xl p-4 bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
    <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
    <h3 className="font-semibold text-purple-700">
      View Reports
    </h3>
    <p className="text-sm text-purple-600">
      Access analytics & reports
    </p>
    </div>

    </div>
    </div>

      </div>
    </div>
   </div>
            
    {/* bhabani last table */}
      <div>
          <div className="flex">
    <div>
      <div className="p-2 flex gap-8">
        <div className="grid grid-cols-1 bg-white rounded-lg shadow-md p-4 w-150">
          <div className="flex gap-80 border-b pb-4 " >
            <div className="">
                Pending Approvals
            </div>
            <div>
              <p>View all</p>
            </div>

          </div>
          <div className="border-b pb-3">
                <div className="flex gap-14">
                  <div className="">
                     <div className="flex gap-3">
                      <div className="font-bold">
                          MR-2024-516
                      </div>
                      <div>
                        <div className="grid grid-cols-1 rounded-full bg-blue-200">
                          <p className="text-blue-800 pl-2 pr-2">high</p>

                        </div>
                      </div>

                     </div>
                     <div className="pb-2">
                      <p className="text-sm font-medium text-black">
                        Material request.sarah johnson
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">
                        today,10:30
                      </p>
                     </div>
                  </div>
                  <div className="flex gap-6 text-center pt-5 pl-24">
                    <div>
                           <h6>$2,450</h6>
                    </div>
                    <div>
                      <Eye />
                    </div>
                    <div className="text-emerald-400 h-0.5px">
                      <CircleFadingPlus />
                    </div>
                    <div className="text-rose-400 h-0.5px">
                        <CircleX />
                    </div>
                  </div>

                </div>
          </div>
          <div className="border-b pb-3">
               <div className="flex gap-14">
                  <div className="">
                    
                    <div className="flex gap-1.5 pt-2">
                           <div className="font-bold">
                                Mr-2024-0516
                           </div>
                           <div>
                            <div className="grid-grid-cols-1 rounded-full bg-blue-200">
                                   <p className="text-blue-800 pl-2 pr-2">
                                    high
                                   </p>
                            </div>
                           </div>
                           
                    </div>
                    <p className="text-sm font-medium text-black">
                      Material request.sarah johnson
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      today,10:30 AM
                    </p>
                  </div>
                  <div className="flex gap-6 text-center pt-5 pl-24">
                    <div>
                       <h6>$2,450</h6>
                    </div>
                    <div>
                      <Eye />
                    </div>
                    <div className="text-emerald-400 h-0.5px">
                      <CircleFadingPlus />
                    </div>
                    <div className="text-rose-400 h-0.5px">
                      <CircleX />
                    </div>
                  </div>
               </div>
          </div>
          <div className="">
            <div className="">
                   <div className="flex gap-14">
                       <div className="">
                        <div className="flex gap-1.5 pt-2">
                          <div className="font-bold">
                           Mr-2024-0516
                          </div>
                          <div className="">
                            <div className="grid grid-cols-1 rounded-full bg-blue-200">
                             <p className="text-blue-800 pl-2 pr-2">
                              high
                             </p>
                            </div>

                          </div>

                        </div>
                        <br />
                        <p className="text-sm font-medium text-black">
                          Material Request .Sarah Johnson
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">
                          today,10:30 AM
                        </p>
                       </div>
                       <div className="flex gap-6 text-center pt-5 pl-24">
                        <div>
                            <h6>$2,450</h6>
                        </div>
                        <div>
                          <Eye />
                        </div>
                        <div className="text-emerald-400">
                          <CircleFadingPlus />
                        </div>
                        <div  className="text-rose-400">
                          <CircleX />
                        </div>
                       </div>
                   </div>
            </div>
          </div>
              
        </div>
      </div>
    </div>
    <div>

    </div>
    <div>
      <div className="max-w-md bg-white rounded-xl border shadow-sm overflow-auto">

  
   <div className="flex  gap-18 justify-between items-center px-4 py-3 border-b">
    <h5 className="font-semibold text-lg">Inventory Overview</h5>
    <span className="text-blue-600 text-sm cursor-pointer">View all</span>
   </div>

 
      <div className="px-4 py-4 border-b">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-medium">Office Chairs</h3>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">45</span> / 100
        <span >
          <div>
            <ArrowUpRight className="text-green-600"/>
          </div>
        </span>
      </div>
    </div>

    <div className="h-2 bg-[#324052] rounded-full mb-2">
      <div className="h-2 bg-[#0284C5] rounded-full w-[45%]"></div>
    </div>

    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Furniture</span>
      <span>Min: 20</span>
    </div>
   </div>

 
      <div className="px-4 py-4 border-b">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-medium">Printer Paper (A4)</h3>
      <div className="flex items-center gap-2 text-sm">

        <span className="font-semibold">120</span> / 500

        <span>
          <div>
          < ArrowDownRight  className="text-red-600"/>
          </div>
        </span>
      </div>
    </div>

    <div className="h-2 bg-[#324052] rounded-full mb-2">
      <div className="h-2 bg-[#0284C5] rounded-full w-[24%]"></div>
    </div>

    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Stationery</span>
      <span>Min: 50</span>
    </div>
   </div>

  
   <div className="px-4 py-4 border-b">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-medium flex items-center gap-2">
        Safety Helmets
        <span >
          <div>
            <AlertTriangle  className="text-black "/>
          </div>
        </span>
      </h3>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">15</span> / 100
        <span>
          <div>
            <ArrowDownRight className="text-red-600"/>
          </div>
        </span>
      </div>
    </div>

    <div className="h-2 bg-[#324052] rounded-full mb-2">
      <div className="h-2 bg-[#F59E0B] rounded-full w-[67%]"></div>
    </div>

    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Safety</span>
      <span>Min: 30</span>
    </div>
  </div>

  
      <div className="px-4 py-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-medium flex items-center gap-2">
        Laptop Chargers
        <span>
          <div>
            <AlertTriangle  className="text-orange-500" />
          </div>
        </span>
      </h3>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">8</span> / 50
        <span >
          <div>
            <ArrowDownRight className="text-red-600"/>
          </div>
        </span>
      </div>
    </div>

    <div className="h-2 bg-[#324052] rounded-full mb-2">
      <div className="h-2 bg-[#F59E0B] rounded-full w-[20%]"></div>
    </div>

    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Electronics</span>
      <span>Min: 10</span>
    </div>
  </div>

 </div>

    </div>
      </div>
      
     










 </div>
  
  </div>
  
  
  );
};

export default Dashboard;
