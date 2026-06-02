import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/http";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

function Login() {
  const [orgName, setOrgName] = useState<string>("InvenPro Pvt Ltd");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/settings/get`)
      .then(res => {
        if (res.data && res.data.success && res.data.data) {
          setOrgName(res.data.data.orgName);
          localStorage.setItem("invenpro_settings", JSON.stringify(res.data.data));
        }
      })
      .catch(err => {
        console.warn("Failed to load settings on login, using cache", err);
        const cached = localStorage.getItem("invenpro_settings");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setOrgName(parsed.orgName);
          } catch(e){}
        }
      });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      toast.warning("Please fill in all fields.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user.department) {
        localStorage.setItem("department", res.data.user.department);
      }

      const role = res.data.user.role;
      toast.success("Welcome back! Logging in...");

      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "manager") {
          navigate("/manager-dashboard");
        } else if (role === "procurement") {
          navigate("/procurement-dashboard");
        } else if (role === "inventory") {
          navigate("/inventory-dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      }, 600);
    } catch (error: any) {
      console.log(error.response?.data);
      const errMsg = error.response?.data?.message || "Invalid login credentials";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        
        {/* Left Section */}
        <div className="bg-indigo-700 text-white flex flex-col justify-center p-10">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight">
            Welcome to {orgName}
          </h1>
          <p className="text-sm text-indigo-100 font-semibold leading-relaxed">
            Manage employees, products, procurement workflows, and stocks efficiently with the smart {orgName} console.
          </p>
        </div>

        {/* Right Section */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Login
          </h2>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 flex items-start gap-3 text-sm animate-error-entry shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-900 leading-none mb-1">Login Attempt Failed</p>
                <p className="text-rose-600/90 text-xs font-semibold leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            disabled={isLoading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            disabled={isLoading}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;