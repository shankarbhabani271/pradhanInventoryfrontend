import  { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);

      if (res.data.role === "admin") {
        navigate("/createemployee");
      } else {
        navigate("/dashboard");
      }
    }catch (error: any) {
  console.log(error.response?.data);

  alert(
    error.response?.data?.message || "Login failed"
  );
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        
        {/* Left Section */}
        <div className="bg-indigo-700 text-white flex flex-col justify-center p-10">
          <h1 className="text-4xl font-bold mb-4">
            Inventory Management System
          </h1>
          <p className="text-lg text-gray-200">
            Manage employees, products, and stock efficiently with a smart dashboard.
          </p>
        </div>

        {/* Right Section */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Login
          </h2>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;