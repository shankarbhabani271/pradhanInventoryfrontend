
import { FileText, ChevronRight, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Card = ({ priority = "high" }: { priority?: "high" | "low" }) => {
  return (
    <div className="bg-[#E5EFF6] border rounded-xl p-6 flex justify-between items-center hover:shadow-lg cursor-pointer min-h-[110px]">
      <div className="flex gap-4">
        <button className="flex items-center justify-center w-12 h-12 border rounded-xl bg-white">
          <FileText className="w-6 h-6 text-gray-700" />
        </button>

        <div>
          <h1 className="text-xl ">MR-2024-0156</h1>
          <p className="text-base text-gray-600">Sarah Johnson</p>

          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              priority === "high"
                ? "bg-orange-100 text-orange-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {priority}
          </span>
        </div>
      </div>

      <ChevronRight className="w-6 h-6" />
    </div>
  )
}

const PendingList = () => (
  <div className="space-y-4 mt-4">
    <Card priority="high" />
    <Card priority="high" />
    <Card priority="low" />
  </div>
)

const ApprovedList = () => (
  <div className="space-y-4 mt-4">
    <Card priority="low" />
    <Card priority="low" />
  </div>
)

const RejectedList = () => (
  <div className="space-y-4 mt-4">
    <Card priority="high" />
  </div>
)

const DetailsPanel = () => {
  return (
    <div className="bg-blue-50 rounded-xl p-8 w-[750px] shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl ">MR-2024-0516</h1>
          <p className="text-base text-gray-600">MATERIAL REQUEST</p>
        </div>

        <span className="px-4 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-600">
          High Priority
        </span>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="flex gap-3">
          <User />
          <div>
            <p className="text-sm text-gray-600">Requester</p>
            <h1 className="  text-xl">Sarah Johnson</h1>
          </div>
        </div>

        <div className="flex gap-3">
          <User />
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <h1 className="text-xl">Operations</h1>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl">Purpose</h2>
        <p className="text-base text-gray-700">
          Required for new warehouse safety compliance audit
        </p>
      </div>

      <div className="mt-8">
        <h2 className=" mb-3 text-xl">Items</h2>

        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3  text-left text-xl">Item</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">UOM</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="p-3">Safety Helmets</td>
              <td className="p-3 text-center">25</td>
              <td className="p-3 text-right">pcs</td>
            </tr>

            <tr className="border-t">
              <td className="p-3">Safety Goggles</td>
              <td className="p-3 text-center">50</td>
              <td className="p-3 text-right">pcs</td>
            </tr>

            <tr className="border-t">
              <td className="p-3">Work Gloves</td>
              <td className="p-3 text-center">100</td>
              <td className="p-3 text-right">pairs</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className=" mb-2 text-xl">Add Comment</h2>

        <textarea
          rows={3}
          placeholder="Type your message..."
          className="w-full border rounded-lg p-3"
        />

        <div className="flex gap-4 mt-4">
          <button className="flex-1 bg-emerald-600 text-white py-3 rounded-lg text-xl ">
            Approve
          </button>

          <button className="flex-1 bg-red-600 text-white py-3 rounded-lg text-xl ">
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

const Approvals = () => {
  return (
    <div className="p-8 flex gap-10 w-full bg-slate-50 min-h-screen">

      <Tabs defaultValue="pending" className="w-[480px]">

        <TabsList className="flex items-center bg-[#94A3B8] text-black h-16 rounded-sm p-1 gap-1">

          <TabsTrigger
            value="pending"
            className="flex-1 flex items-center justify-center
             gap-2 h-full  rounded-sm text-black text-
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black
                data-[state=active]:shadow-md
                 transition-all"
          >
            Pending
            <span className="bg-blue-100 text-blue-700 text-sm  px-2 py-0.5 rounded-full">
              3
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="approved"
            className="flex-1 flex items-center justify-center
             h-full text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all"
          >
            Approved
          </TabsTrigger>

          <TabsTrigger
            value="rejected"
            className="flex-1 flex items-center 
            justify-center h-full text- text-black rounded-sm
             hover:white data-[state=active]:bg-white
              data-[state=active]:text-black 
              data-[state=active]:shadow-md transition-all"
          >
            Rejected
          </TabsTrigger>

        </TabsList>

        <TabsContent value="pending">
          <PendingList />
        </TabsContent>

        <TabsContent value="approved">
          <ApprovedList />
        </TabsContent>

        <TabsContent value="rejected">
          <RejectedList />
        </TabsContent>

      </Tabs>

      <DetailsPanel />

    </div>
  )
}

export default Approvals
