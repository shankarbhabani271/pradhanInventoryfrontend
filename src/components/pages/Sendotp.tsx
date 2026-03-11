import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

interface SignupData {
  otp: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [showpassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [data, setData] = useState<SignupData>({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  // handle input change
  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data.otp.length !== 6) {
      alert("Please enter a valid 6 digit OTP");
      return;
    }

    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("Signup Data:", data);
  };

  return (
    <section id="signup">
      <div className="mx-auto container p-5 ">
        <div className="bg-white max-w-sm py-5 mx-auto p-4 w-full rounded shadow">
          <form onSubmit={handleSubmit} className="mt-4">
            {/* OTP */}
            <div className="grid mb-3">
              <label>Enter OTP :</label>

              <div className="bg-slate-100 p-2 rounded">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter OTP"
                  name="otp"
                  value={data.otp}
                  onChange={handleOnchange}
                  className="w-full outline-none bg-transparent text-center tracking-widest"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label>Password :</label>
              <div className="bg-slate-100 p-2 flex items-center">
                <input
                  type={showpassword ? "text" : "password"}
                  placeholder="Enter password"
                  name="password"
                  value={data.password}
                  onChange={handleOnchange}
                  className="w-full outline-none bg-transparent"
                />

                <div
                  className="cursor-pointer text-lg"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showpassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label>Confirm Password :</label>
              <div className="bg-slate-100 p-2 flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={handleOnchange}
                  className="w-full outline-none bg-transparent"
                />

                <div
                  className="cursor-pointer text-lg"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="pt-3">
              
              
<Link to="/material-request">
  <button
    type="button"
    className="bg-blue-600 text-white text-2xl px-6 py-2 w-full rounded-full hover:scale-110 transition-all"
  >
    Enter
  </button>
</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signup;
