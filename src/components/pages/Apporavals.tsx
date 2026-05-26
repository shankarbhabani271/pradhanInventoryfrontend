import {  ChevronRight, User,Building2, Package, Hash,CheckCircle, XCircle, Clock  } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/http";

/* =========================
   LIST COMPONENT
========================= */


interface MaterialRequest {
  _id: string;
  referenceId: string;
  requester: string;
  priority: string;
  department: string;
  productDetails: string;
  quantity: number;
  status: string;
}

interface ListProps {
  data: MaterialRequest[];
  selected: MaterialRequest | null;
  setSelected: React.Dispatch<React.SetStateAction<MaterialRequest | null>>;
}

interface DetailsProps {
  selected: MaterialRequest | null;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
}
const List = ({ data, selected, setSelected }: ListProps) => {
  return (
    <div className="space-y-4 mt-4">
      {data.length === 0 && <p>No Data</p>}

      {data.map((item) => (
        <div
          key={item._id}
          onClick={() => setSelected(item)}
          className={`bg-[#E5EFF6] p-4 rounded-xl cursor-pointer border
          ${selected?._id === item._id ? "bg-blue-100" : ""}`}
        >
          <div className="flex justify-between">
            <div>
              <h2>{item.referenceId}</h2>
              <p>{item.requester}</p>
              <button className="bg-yellow-400 text-white rounded-2xl px-3 py-1 mt-2 text-xs">
              <span>{item.priority}</span></button>
            </div>
            <ChevronRight />
          </div>
        </div>
      ))}
    </div>
  );
};

/* =========================
   DETAILS PANEL
========================= */
const DetailsPanel = ({ selected, handleApprove, handleReject }: DetailsProps) => {
  if (!selected) return <div className="p-6">Select item</div>;

  return (
   <div className="w-full max-w-[850px] mx-auto mt-10">

  {/* Card */}
  <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-xl p-8">

    {/* Top Section */}
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
          {selected.referenceId}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Material Request Overview
        </p>
      </div>

      {/* Status */}
      <span
        className={`px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm
          ${
            selected.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : selected.status === "Approved"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
      >
        {selected.status}
      </span>
    </div>

    {/* Divider */}
    <div className="border-t mb-6"></div>

    {/* Info Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">

      {/* Requester */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
        <User className="text-blue-500" />
        <div>
          <p className="text-xs text-gray-500">Requester</p>
          <p className="font-semibold text-gray-800">
            {selected.requester}
          </p>
        </div>
      </div>

      {/* Department */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
        <Building2 className="text-purple-500" />
        <div>
          <p className="text-xs text-gray-500">Department</p>
          <p className="font-semibold text-gray-800">
            {selected.department}
          </p>
        </div>
      </div>

      {/* Product */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
        <Package className="text-green-500" />
        <div>
          <p className="text-xs text-gray-500">Product</p>
          <p className="font-semibold text-gray-800">
            {selected.productDetails}
          </p>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
        <Hash className="text-orange-500" />
        <div>
          <p className="text-xs text-gray-500">Quantity</p>
          <p className="font-semibold text-gray-800">
            {selected.quantity}
          </p>
        </div>
      </div>
    </div>

    {/* Action Section */}
    {selected.status === "Pending" && (
     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-10">
        <p className="text-sm text-gray-500">
          Take action on this request
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleReject(selected._id)}
            className="px-6 py-2 rounded-xl border border-red-500 text-red-600 font-medium hover:bg-red-50 transition"
          >
            Reject
          </button>

          <button
            onClick={() => handleApprove(selected._id)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow hover:scale-105 transition"
          >
            Approve
          </button>
        </div>
      </div>
    )}
  </div>
</div>
  );
};

/* =========================
   MAIN COMPONENT
========================= */
const Approvals = () => {
const [status, setStatus] = useState<string>("Pending");

const [data, setData] = useState<MaterialRequest[]>([]);

const [selected, setSelected] =
  useState<MaterialRequest | null>(null);

  const fetchData = () => {
    fetch(`${API_BASE_URL}/material?status=${status}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data || []);
        setSelected(res.data?.[0] || null);
      });
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  const handleApprove = async (id:any) => {
    await fetch(`${API_BASE_URL}/material/${id}/approve`, {
      method: "PUT",
    });
    fetchData();
  };

  const handleReject = async (id:any) => {
    await fetch(`${API_BASE_URL}/material/${id}/reject`, {
      method: "PUT",
    });
    fetchData();
  };

  return (
    
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">

  <div className="max-w-[1200px] mx-auto grid  grid-cols-1 md:grid-cols-12 gap-6">

    {/* LEFT PANEL */}
    <div className="col-span-12 md:col-span-5 bg-white rounded-2xl shadow-lg p-4 md:p-5 border">

      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Material Requests
      </h2>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">

       <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl mb-4 text-xs md:text-sm">

          <TabsTrigger
            value="pending"
            onClick={() => setStatus("Pending")}
            className="flex items-center justify-center gap-2 text-sm"
          >
            <Clock size={16} /> Pending
          </TabsTrigger>

          <TabsTrigger
            value="approved"
            onClick={() => setStatus("Approved")}
            className="flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle size={16} /> Approved
          </TabsTrigger>

          <TabsTrigger
            value="rejected"
            onClick={() => setStatus("Rejected")}
            className="flex items-center justify-center gap-2 text-sm"
          >
            <XCircle size={16} /> Rejected
          </TabsTrigger>

        </TabsList>

        {/* Tab Content */}
       <div className="max-h-[400px] md:max-h-[520px] overflow-y-auto pr-2">

          <TabsContent value="pending">
            <List data={data} selected={selected} setSelected={setSelected} />
          </TabsContent>

          <TabsContent value="approved">
            <List data={data} selected={selected} setSelected={setSelected} />
          </TabsContent>

          <TabsContent value="rejected">
            <List data={data} selected={selected} setSelected={setSelected} />
          </TabsContent>

        </div>
      </Tabs>
    </div>

    {/* RIGHT PANEL */}
    <div className="col-span-12 md:col-span-7">

      <div className="">

        {selected ? (
          <DetailsPanel
            selected={selected}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a request to view details
          </div>
        )}

      </div>

    </div>

  </div>
</div>
  );
};

export default Approvals;