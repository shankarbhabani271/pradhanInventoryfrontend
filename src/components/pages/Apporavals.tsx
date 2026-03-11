import { FileText, ChevronRight, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/* =========================
   CARD COMPONENT
========================= */
const Card = ({ priority = "high" }: { priority?: "high" | "low" }) => {
  return (
    <div className="
      w-full
      bg-[#E5EFF6]
      border border-gray-200
      rounded-xl
      p-3 sm:p-4 md:p-6
      hover:shadow-lg
      transition
      cursor-pointer
    ">
      <div className="
        flex flex-col gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">
        {/* LEFT */}
        <div className="flex gap-3 sm:gap-4 min-w-0">
          <div className="flex-shrink-0">
            <div className="
              w-10 h-10 sm:w-12 sm:h-12
              flex items-center justify-center
              rounded-xl
              border
              bg-white
            ">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-semibold break-words">
              MR-2024-0156
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words">
              Sarah Johnson
            </p>

            <span className={`
              inline-block mt-2 px-2.5 py-1 rounded-full
              text-xs sm:text-sm font-medium
              ${priority === "high"
                ? "bg-orange-100 text-orange-600"
                : "bg-green-100 text-green-600"}
            `}>
              {priority}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </div>
    </div>
  )
}

/* =========================
   LISTS
========================= */
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

/* =========================
   DETAILS PANEL
========================= */
const DetailsPanel = () => {
  return (
    <div className="
      w-full max-w-[750px] mx-auto
      bg-blue-50 rounded-xl
      p-4 sm:p-6 lg:p-8
      shadow-md
    ">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            MR-2024-0516
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            MATERIAL REQUEST
          </p>
        </div>

        <span className="
          self-start px-4 py-1 rounded-full
          text-xs sm:text-sm font-semibold
          bg-orange-100 text-orange-600
        ">
          High Priority
        </span>
      </div>

      {/* INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <div className="flex gap-3">
          <User className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Requester</p>
            <h2 className="text-lg sm:text-xl">Sarah Johnson</h2>
          </div>
        </div>

        <div className="flex gap-3">
          <User className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Department</p>
            <h2 className="text-lg sm:text-xl">Operations</h2>
          </div>
        </div>
      </div>

      {/* PURPOSE */}
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl font-medium">Purpose</h2>
        <p className="text-sm sm:text-base text-gray-700 mt-1">
          Required for new warehouse safety compliance audit
        </p>
      </div>

      {/* TABLE */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg sm:text-xl font-medium">Items</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[420px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">UOM</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Safety Helmets", "25", "pcs"],
                ["Safety Goggles", "50", "pcs"],
                ["Work Gloves", "100", "pairs"],
              ].map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{row[0]}</td>
                  <td className="p-3 text-center">{row[1]}</td>
                  <td className="p-3 text-right">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6">
        <textarea
          rows={3}
          placeholder="Add comment..."
          className="
            w-full border rounded-lg
            p-3 text-sm sm:text-base
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button className="
            w-full sm:flex-1
            bg-emerald-600 hover:bg-emerald-700
            text-white py-3 rounded-lg
          ">
            Approve
          </button>

          <button className="
            w-full sm:flex-1
            bg-red-600 hover:bg-red-700
            text-white py-3 rounded-lg
          ">
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================
   MAIN PAGE
========================= */
const Approvals = () => {
  return (
    <div className="
      min-h-screen bg-[#EFF6FF]
      p-4 sm:p-6 lg:p-8
      flex flex-col gap-6
      lg:flex-row
    ">
      {/* LEFT */}
      <Tabs defaultValue="pending" className="w-full lg:w-[420px]">
        <div className="overflow-x-auto">
          <TabsList className="
            flex min-w-[360px]
            bg-[#94A3B8]
            h-14 rounded-md p-1 gap-1
          ">
            <TabsTrigger value="pending" className="flex-1 cursor-pointer data-[state=active]:bg-white">
              Pending <span className="ml-2 text-xs bg-white px-2 rounded-full">3</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 cursor-pointer data-[state=active]:bg-white">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 cursor-pointer data-[state=active]:bg-white">Rejected</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending"><PendingList /></TabsContent>
        <TabsContent value="approved"><ApprovedList /></TabsContent>
        <TabsContent value="rejected"><RejectedList /></TabsContent>
      </Tabs>

      {/* RIGHT */}
      <DetailsPanel />
    </div>
  )
}

export default Approvals