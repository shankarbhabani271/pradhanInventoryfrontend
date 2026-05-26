import { useState } from "react";
import { Mail, Building2, UserCog, CheckCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "../../config/http";

export default function EmployeeForm() {
  const [formData, setFormData] = useState({
    email: "",
    department: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setIsSuccess(false); // Reset success box on input change
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
    setIsSuccess(false);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/employees/send-invite`,
        formData
      );

      if (res.data.success) {
        toast.success("Employee registered successfully!");
        setRegisteredEmail(formData.email);
        setIsSuccess(true);
        
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
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition font-semibold"
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
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="procurement">Procurement (Vendor Manager)</option>
                  <option value="inventory">Inventory (Store Keeper)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              className="px-6 py-3 border rounded-xl hover:bg-gray-100 transition font-semibold"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              {isLoading ? "Registering..." : "Register Employee"}
            </button>
          </div>
          
          {/* Premium Success Feedback */}
          {isSuccess && (
            <div className="mt-8 p-6 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-start gap-4 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
                <CheckCircle className="animate-pulse" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-emerald-900 font-bold text-lg mb-1">
                  Employee Registered Successfully
                </h3>
                <p className="text-emerald-700/90 text-sm leading-relaxed">
                  An invitation email with a secure setup link has been dispatched to{" "}
                  <span className="font-semibold text-emerald-800">{registeredEmail}</span>. The employee will be able to set their password and activate their account.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}