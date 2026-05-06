import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookCopy } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
export default function MaterialForm() {
const  navigate = useNavigate();
  // Priority Logic
  const getPriority = (value:String) => {
    if (!value) return "";

    if (value.includes("-")) {
      const [, max] = value.split("-").map(Number);

      if (max >= 20) return "Urgent";
      if (max > 10) return "High";
      if (max >= 5) return "Medium";
      if (max >= 1) return "Low";
    } else {
      const num = Number(value);

      if (num >= 20) return "Urgent";
      if (num > 10) return "High";
      if (num >= 5) return "Medium";
      if (num >= 1) return "Low";
    }

    return "";
  };

  // State
  const [formData, setFormData] = useState({
    referenceId: "",
    date: "",
    requester: "",
    department: "",
    quantity: "",
    productDetails: "",
    priority: ""
  });

  // Handle Change
  const handleChange = (e:any) => {
    const { name, value } = e.target;

    let updatedData = {
      ...formData,
      [name]: value
    };

    // Auto priority
    if (name === "quantity") {
      updatedData.priority = getPriority(value);
    }

    setFormData(updatedData);
  };

  // Reset
  const handleReset = () => {
    setFormData({
      referenceId: "",
      date: "",
      requester: "",
      department: "",
      quantity: "",
      productDetails:"",
      priority: ""
    });
  };

  // ✅ FIXED: handleSubmit must be INSIDE component
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    

     // validation 
     if(! formData.referenceId || ! formData.requester || !formData.quantity)
        return toast.error("please fill all required fields ")
    try {
      const res = await fetch("http://localhost:8080/api/material/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
       body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity) // ✅ FIX
      })
    });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }

      toast.success("Data saved successfully ✅");

      handleReset();

      navigate("/material-request"); // ✅ redirect

    } catch (error) {
      console.error(error);
      toast.error("Error saving data ❌");
      
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 space-y-5">

        <form onSubmit={handleSubmit}>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <Button className="bg-blue-300 px-3 py-3">
                <BookCopy className="w-6 h-6 text-blue-600" />
              </Button>
              <h2 className="text-2xl font-bold">Material List Details</h2>
            </div>

            <p className="font-semibold">
              Fill in the details to submit a new material request
            </p>
          </div>

          <br />

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm mb-1">Reference ID</label>
              <input
                name="referenceId"
                value={formData.referenceId}
                onChange={handleChange}
                placeholder="MR-2026-001"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Date</label>
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Requester</label>
              <input
                name="requester"
                value={formData.requester}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Medical">Medical</option>
              </select>
            </div>

          </div>

          <br />
          {/*product details */}
          <label className="block text-sm mb-1">Product Details</label>
          <input
            name="productDetails"
            value={formData.productDetails}
            onChange={handleChange}
            placeholder="Enter product details"
            className="w-full px-4 py-2 border rounded-lg"
          />

          {/* Items */}

          
          <div>
            <label className="block text-sm mb-1">Quantity</label>
            <input
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 10 or 10-20"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <br />

          {/* Priority */}
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <input
              value={formData.priority}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <br />

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <Button
              type="button"
              onClick={handleReset}
              className="bg-cyan-300 hover:bg-cyan-700"
            >
              Reset
            </Button>

            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500"
            >
              Submit Request
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}