import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { API_BASE_URL } from "../../config/http";






import {
  Funnel,Plus ,MoreHorizontal
}from "lucide-react";
import { useNavigate } from "react-router-dom";



const MaterialRequest = () => {
  interface MaterialData {
  _id: string;
  referenceId: string;
  requester: string;
  department: string;
  date: string;
  productDetails: string;
  quantity: number;
  priority: string;
  status?: string;
}

const [data, setData] = useState<MaterialData[]>([]);
  
    

  useEffect(() => {
    fetch(`${API_BASE_URL}/material`)
      .then((res) => res.json())
      .then((res) => {
        console.log("API DATA",res);
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);
  const navigate = useNavigate();
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
      <button 
      
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-black bg-white shadow-sm hover:bg-gray-100">
        <Funnel className="h-5 w-5 text-gray-700" />
      </button>
    </div>

    {/* Right section */}
    <div className="flex justify-start md:justify-end">
      <button
      onClick={()=>navigate("/material")}
      className="flex items-center gap-2 rounded-lg bg-[#0284C5] px-4 py-2 font-medium text-white hover:bg-[#0271aa]">
        <Plus className="h-4 w-4" />
        <span>New Request</span>
      </button>
    </div>

  </div>
</div>

  <div className="bg-blue-50 min-h-screen p-4">
  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

  <table className="w-full border rounded-xl overflow-hidden">

  <thead className="bg-[#0284C5] text-sm font-semibold text-white">
    <tr>
      <th className="p-3 text-left">Reference</th>
      <th className="p-3 text-left">Requester</th>
      <th className="p-3 text-left">Department</th>
      <th className="p-3 text-left">Date</th>
        <th className="p-3 text-left">Product Details</th>
      <th className="p-3 text-left">Quantity</th>
      <th className="p-3 text-left">Priority</th>
     
      <th className="p-3 text-center">Action</th>
      <th className="p-3 text-left">Status</th>
    </tr>
  </thead>

  <tbody>
    {data.map((row) => (
      <tr
        key={row._id}
        className="border-t hover:bg-gray-50 text-sm"
      >
        <td className="p-3 font-semibold">
          {row.referenceId} {/* ✅ FIX */}
        </td>

        <td className="p-3">
          {row.requester}
        </td>

        <td className="p-3">
          {row.department}
        </td>

        <td className="p-3">
          {row.date}
        </td>
        <td className="p-3">
          {row.productDetails}
        </td>

        <td className="p-3">
          {row.quantity} {/* ✅ FIX */}
        </td>

        <td className="p-3">
          <button onClick={() => navigate("/apporavals")}>  
          <span className="px-3 py-1 rounded-full text-xs bg-yellow-400 text-white">
            {row.priority}
          </span>
          </button>
        </td>
      <td className="p-3">
  <button onClick={() => navigate("/apporavals")}>
    <span className="px-3 py-1 rounded-full text-xs bg-blue-400 text-white">
      {row.status || "Pending"}
    </span>
  </button>
</td>
       

        <td className="p-3 text-center">
          <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
        </td>
      </tr>
    ))}
  </tbody>
</table>

  </div>
</div>



    </div>
    
  )
}

export default MaterialRequest

