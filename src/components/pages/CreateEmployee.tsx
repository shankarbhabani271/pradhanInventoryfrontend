import React, { useState } from "react";
import { Mail, Building2, UserCog } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function EmployeeForm() {
  const [formData, setFormData] = useState({
    email: "",
    department: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { email, department, role } = formData;

    if (!email || !department || !role) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    setGeneratedLink(""); // Reset previous link
    try {
      const res = await axios.post(
        "http://localhost:8080/api/employees/send-invite",
        formData
      );

      if (res.data.success) {
        toast.success(`Invite generated for ${formData.email}`);
        
        // Display the link on the screen so the admin can copy it!
        if (res.data.link) {
          setGeneratedLink(res.data.link);
        }
        
        setFormData({
          email: "",
          department: "",
          role: "",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-yellow-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl p-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Invite Employee
              </h1>
              <p className="text-gray-500">
                Send an invitation to register securely
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate("/adddepartment")}
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition"
              >
                Add Department
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block mb-2 font-medium">Employee Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="employee@company.com"
                  className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block mb-2 font-medium">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                  className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block mb-2 font-medium">Role</label>
              <div className="relative">
                <UserCog className="absolute left-3 top-3 text-gray-400" size={18} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition appearance-none"
                  required
                >
                  <option value="">Select Role</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Employee</option>
                  <option>Vendor Manager</option>
                  <option>Store Keeper</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              className="px-6 py-3 border rounded-xl hover:bg-gray-50 transition"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? "Generating..." : "Register Employee"}
            </button>
          </div>
          
          {/* Output Link */}
          {generatedLink && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-green-800 font-semibold mb-2">Invitation Link Generated!</h3>
              <p className="text-green-700 text-sm mb-3">
                Since email is not set up, please copy this link and send it to the employee, or open it yourself to continue the flow:
              </p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink} 
                  className="w-full p-2 bg-white border border-green-300 rounded text-gray-700 font-mono text-sm"
                />
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}