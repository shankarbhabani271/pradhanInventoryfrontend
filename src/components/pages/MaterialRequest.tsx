
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const rows = [
  {
    ref: "MR-2024-0156",
    requester: "Sarah Johnson",
    department: "Operations",
    date: "2024-01-15",
    items: 5,
    priority: "High",
    priorityStyle: "bg-red-100 text-red-600",
    status: "Pending",
    statusStyle: "bg-orange-100 text-orange-600",
  },
  {
    ref: "MR-2024-0155",
    requester: "Mike Chen",
    department: "IT",
    date: "2024-01-14",
    items: 3,
    priority: "Medium",
    priorityStyle: "bg-yellow-100 text-yellow-600",
    status: "Approved",
    statusStyle: "bg-green-100 text-green-600",
  },
  {
    ref: "MR-2024-0154",
    requester: "Emily Davis",
    department: "HR",
    date: "2024-01-14",
    items: 8,
    priority: "Low",
    priorityStyle: "bg-blue-100 text-blue-600",
    status: "Completed",
    statusStyle: "bg-green-100 text-green-600",
  },
  {
    ref: "MR-2024-0153",
    requester: "John Smith",
    department: "Finance",
    date: "2024-01-13",
    items: 2,
    priority: "Medium",
    priorityStyle: "bg-yellow-100 text-yellow-600",
    status: "Rejected",
    statusStyle: "bg-red-100 text-red-600",
  },
  {
    ref: "MR-2024-0152",
    requester: "Lisa Wong",
    department: "Marketing",
    date: "2024-01-12",
    items: 4,
    priority: "High",
    priorityStyle: "bg-red-100 text-red-600",
    status: "Draft",
    statusStyle: "bg-gray-100 text-gray-600",
  },
];





import {
  Funnel,Plus ,MoreHorizontal
}from "lucide-react";



const MaterialRequest = () => {
  return (
    <div>
      <div className="w-full bg-blue-50 px-4 py-3">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    
    {/* Left section */}
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      
      {/* Search */}
      <div className="relative w-full sm:w-[260px]">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border border-black bg-white py-2 pl-4 pr-4 text-sm placeholder-gray-400"
        />
      </div>

      {/* Select */}
      <Select>
        <SelectTrigger className="w-full sm:w-[160px] border-black">
          <SelectValue placeholder="Select material" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter button */}
      <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-black bg-white shadow-sm hover:bg-gray-100">
        <Funnel className="h-5 w-5 text-gray-700" />
      </button>
    </div>

    {/* Right section */}
    <div className="flex justify-start md:justify-end">
      <button className="flex items-center gap-2 rounded-lg bg-[#0284C5] px-4 py-2 font-medium text-white hover:bg-[#0271aa]">
        <Plus className="h-4 w-4" />
        <span>New Request</span>
      </button>
    </div>

  </div>
</div>

  <div className="bg-blue-50 min-h-screen p-4">
  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

    {/* HEADER – DESKTOP ONLY */}
    <div className="hidden lg:grid grid-cols-8 bg-gray-200 p-4 text-sm font-semibold">
      <div>Reference</div>
      <div>Requester</div>
      <div>Department</div>
      <div>Date</div>
      <div>Items</div>
      <div>Priority</div>
      <div>Status</div>
      <div></div>
    </div>

    {/* ROWS */}
    {rows.map((row, index) => (
      <div
        key={index}
        className="
          border-t p-4 hover:bg-gray-50
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-4
          lg:grid-cols-8
        "
      >
        <div className="min-w-0 break-words">
          <p className="lg:hidden text-xs text-gray-500">Reference</p>
          <p className="font-semibold">{row.ref}</p>
        </div>

        <div className="min-w-0 break-words">
          <p className="lg:hidden text-xs text-gray-500">Requester</p>
          <p>{row.requester}</p>
        </div>

        <div className="min-w-0 break-words">
          <p className="lg:hidden text-xs text-gray-500">Department</p>
          <p>{row.department}</p>
        </div>

        <div>
          <p className="lg:hidden text-xs text-gray-500">Date</p>
          <p>{row.date}</p>
        </div>

        <div>
          <p className="lg:hidden text-xs text-gray-500">Items</p>
          <p>{row.items}</p>
        </div>

        <div>
          <p className="lg:hidden text-xs text-gray-500">Priority</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${row.priorityStyle}`}
          >
            {row.priority}
          </span>
        </div>

        <div>
          <p className="lg:hidden text-xs text-gray-500">Status</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${row.statusStyle}`}
          >
            {row.status}
          </span>
        </div>

        <div className="flex lg:justify-center">
          <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>
      </div>
    ))}

  </div>
</div>



    </div>
    
  )
}

export default MaterialRequest

