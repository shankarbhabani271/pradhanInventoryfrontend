
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


import {
  Funnel,Plus ,MoreHorizontal
}from "lucide-react";



const MaterialRequest = () => {
  return (
    <div>
      <div className='flex gap-75  bg-blue-50' >
      <div className="flex gap-4  pt-4 pl-4.5">
        <div>
          <input
            type="text"
            placeholder="Search..."
            className="w-70 rounded-lg border border-black bg-white py-2 pl-10 pr-4 text-sm placeholder-gray-400"
          />
        </div>

        <div>
         <Select>
        <SelectTrigger className="w-[150px] text-black-50 border-black">
          <SelectValue placeholder="Select material" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="iron">All Status</SelectItem>
          <SelectItem value="steel">Draft</SelectItem>
          <SelectItem value="plastic">Pending</SelectItem>
          <SelectItem value="plastic">Approved</SelectItem>
          <SelectItem value="plastic">Rejected</SelectItem>
          <SelectItem value="plastic">Completed</SelectItem>
        </SelectContent>
      </Select>
        </div>

        <div>
           <button className="flex items-center justify-center w-10 h-10 border border-black rounded-lg bg-white shadow-sm hover:bg-gray-100">
      <Funnel className="w-5 h-5 text-gray-700" />
    </button>
        </div>
      </div>
      <div className='pt-4.5'>
       <button className="flex items-center gap-2 px-4 py-2 bg-[#0284C5] text-white font-medium rounded-lg ">
  <Plus className="w-4 h-4" />
  <span>New Request</span>
</button>
      </div>
    </div>
    <div className='bg-blue-50'>
        <div className="p-6">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* main heading for  */}
        <div className="grid grid-cols-8 bg-gray-200 p-4 font-semibold text-sm">
          <div>Reference</div>
          <div>Requester</div>
          <div>Department</div>
          <div>Date</div>
          <div>Items</div>
          <div>Priority</div>
          <div>Status</div>
          <div></div>
        </div>

        {/* bhabani 1 */}
        <div className="grid grid-cols-8 items-center p-4 border-t text-sm h-18 hover:bg-gray-100">
          <div className="font-semibold">MR-2024-0156</div>
          <div>Sarah Johnson</div>
          <div>Operations</div>
          <div>2024-01-15</div>
          <div>5</div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
              high
            </span>
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
          <div className="font-semibold">MR-2024-0155</div>
          <div>Mike Chen</div>
          <div>IT</div>
          <div>2024-01-14</div>
          <div>3</div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              medium
            </span>
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
          <div className="font-semibold">MR-2024-0154</div>
          <div>Emily Davis</div>
          <div>HR</div>
          <div>2024-01-14</div>
          <div>8</div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              low
            </span>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
              completed
            </span>
          </div>

          <div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>
        {/*4th bhabani  */}
         <div className="grid grid-cols-8 items-center p-4 border-t text-sm h-18 hover:bg-gray-100">
          <div className="font-semibold">MR-2024-0153</div>
          <div>john Smith</div>
          <div>Finance</div>
          <div>2024-01-13</div>
          <div>2</div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              medium
            </span>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
              rejected
            </span>
          </div>

          <div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>
        {/*5th bhabnai */}
              <div className="grid grid-cols-8 items-center p-4 border-t text-sm h-18 hover:bg-gray-100">
          <div className="font-semibold">MR-2024-0152</div>
          <div>lisa Wong</div>
          <div>marketing</div>
          <div>2024-01-12</div>
          <div>4</div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              high
            </span>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
              draft
            </span>
          </div>

          <div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>

       
       
      </div>
    </div>
    </div>
  

    </div>
    
  )
}

export default MaterialRequest

