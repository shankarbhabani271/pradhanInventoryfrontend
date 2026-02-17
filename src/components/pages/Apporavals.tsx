
import { FileText, ChevronRight, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Card = ({ priority = "high" }: { priority?: "high" | "low" }) => {
  return (
   <div
  className="
    bg-[#E5EFF6] border rounded-xl p-4 sm:p-6
    hover:shadow-lg cursor-pointer
    min-h-[110px]
    transition
  "
>
  <div
    className="
      flex flex-col gap-4
      sm:flex-row sm:items-center sm:justify-between
    "
  >
    {/* LEFT CONTENT */}
    <div className="flex gap-4 min-w-0">
      {/* Icon */}
      <button className="flex-shrink-0 flex items-center justify-center w-12 h-12 border rounded-xl bg-white">
        <FileText className="w-6 h-6 text-gray-700" />
      </button>

      {/* Text */}
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-medium break-words">
          MR-2024-0156
        </h1>

        <p className="text-sm sm:text-base text-gray-600 break-words">
          Sarah Johnson
        </p>

        <span
          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
            priority === "high"
              ? "bg-orange-100 text-orange-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {priority}
        </span>
      </div>
    </div>

    {/* RIGHT ICON */}
    <div className="flex justify-end sm:justify-center">
      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
    </div>
  </div>
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
    <div className="bg-blue-50 rounded-xl p-4 sm:p-6 lg:p-8 
                w-full max-w-[750px] mx-auto shadow-md">

  {/* HEADER */}
  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
    <div>
      <h1 className="text-xl sm:text-2xl font-semibold">
        MR-2024-0516
      </h1>
      <p className="text-sm sm:text-base text-gray-600">
        MATERIAL REQUEST
      </p>
    </div>

    <span className="self-start px-4 py-1 rounded-full text-xs sm:text-sm font-semibold 
                     bg-orange-100 text-orange-600">
      High Priority
    </span>
  </div>

  {/* REQUESTER + DEPARTMENT */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 sm:mt-8">
    <div className="flex gap-3 items-start">
      <User className="w-5 h-5 mt-1 text-gray-600" />
      <div>
        <p className="text-xs sm:text-sm text-gray-600">Requester</p>
        <h1 className="text-lg sm:text-xl break-words">
          Sarah Johnson
        </h1>
      </div>
    </div>

    <div className="flex gap-3 items-start">
      <User className="w-5 h-5 mt-1 text-gray-600" />
      <div>
        <p className="text-xs sm:text-sm text-gray-600">Department</p>
        <h1 className="text-lg sm:text-xl break-words">
          Operations
        </h1>
      </div>
    </div>
  </div>

  {/* PURPOSE */}
  <div className="mt-6 sm:mt-8">
    <h2 className="text-lg sm:text-xl font-medium">Purpose</h2>
    <p className="text-sm sm:text-base text-gray-700 mt-1">
      Required for new warehouse safety compliance audit
    </p>
  </div>

  {/* ITEMS TABLE */}
  <div className="mt-6 sm:mt-8">
    <h2 className="mb-3 text-lg sm:text-xl font-medium">Items</h2>

    {/* Mobile safe table */}
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[420px]">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left text-sm sm:text-base">Item</th>
            <th className="p-3 text-center text-sm sm:text-base">Qty</th>
            <th className="p-3 text-right text-sm sm:text-base">UOM</th>
          </tr>
        </thead>

        <tbody>
          {[
            ["Safety Helmets", "25", "pcs"],
            ["Safety Goggles", "50", "pcs"],
            ["Work Gloves", "100", "pairs"],
          ].map(([item, qty, uom], i) => (
            <tr key={i} className="border-t">
              <td className="p-3 text-sm sm:text-base">{item}</td>
              <td className="p-3 text-center">{qty}</td>
              <td className="p-3 text-right">{uom}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* COMMENTS + ACTIONS */}
  <div className="mt-6 sm:mt-8">
    <h2 className="mb-2 text-lg sm:text-xl font-medium">Add Comment</h2>

    <textarea
      rows={3}
      placeholder="Type your message..."
      className="w-full border rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
    />

    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <button className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 
                         text-white py-3 rounded-lg text-base sm:text-xl">
        Approve
      </button>

      <button className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 
                         text-white py-3 rounded-lg text-base sm:text-xl">
        Reject
      </button>
    </div>
  </div>
</div>

  )
}

const Approvals = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 
                bg-slate-50 min-h-screen
                flex flex-col gap-6
                lg:flex-row">

  {/* LEFT – TABS */}
  <Tabs
    defaultValue="pending"
    className="
      w-full
      lg:w-[420px]
      xl:w-[480px]
      flex-shrink-0
    "
  >
    {/* TAB HEADER */}
    <div className="overflow-x-auto">
      <TabsList
        className="
          flex min-w-[360px]
          bg-[#94A3B8]
          h-14 sm:h-16
          rounded-sm p-1 gap-1
        "
      >
        <TabsTrigger
          value="pending"
          className="
            flex-1 flex items-center justify-center gap-2
            h-full rounded-sm
            text-sm sm:text-base
            hover:bg-white
            data-[state=active]:bg-white
            data-[state=active]:text-black
            data-[state=active]:shadow-md
            transition-all
          "
        >
          Pending
          <span className="bg-blue-100 text-blue-700 text-xs sm:text-sm px-2 py-0.5 rounded-full">
            3
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="approved"
          className="
            flex-1 flex items-center justify-center
            h-full rounded-sm
            text-sm sm:text-base
            hover:bg-white
            data-[state=active]:bg-white
            data-[state=active]:text-black
            data-[state=active]:shadow-md
            transition-all
          "
        >
          Approved
        </TabsTrigger>

        <TabsTrigger
          value="rejected"
          className="
            flex-1 flex items-center justify-center
            h-full rounded-sm
            text-sm sm:text-base
            hover:bg-white
            data-[state=active]:bg-white
            data-[state=active]:text-black
            data-[state=active]:shadow-md
            transition-all
          "
        >
          Rejected
        </TabsTrigger>
      </TabsList>
    </div>

    {/* TAB CONTENT */}
    <div className="mt-4">
      <TabsContent value="pending">
        <PendingList />
      </TabsContent>

      <TabsContent value="approved">
        <ApprovedList />
      </TabsContent>

      <TabsContent value="rejected">
        <RejectedList />
      </TabsContent>
    </div>
  </Tabs>

  {/* RIGHT – DETAILS PANEL */}
  <div className="w-full min-w-0">
    <DetailsPanel />
  </div>

</div>

  )
}

export default Approvals
