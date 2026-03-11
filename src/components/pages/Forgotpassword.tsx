import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendOtp } from "../../api/otpApi";
interface SignupData {
  otp: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<SignupData>({
    otp: "",
    email: "",
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.email) {
      alert("Please enter email");
      return;
    }

    try {
      const res = await sendOtp(data.email);

      console.log(res);

      alert(res.message); // OTP sent message

      navigate("/sendotp", {
        state: { email: data.email },
      });
    } catch (error) {
      console.log(error);
      alert("OTP send failed");
    }
  };

  return (
    <section id="signup ">
      <div className="mx-auto container p-12 ">
        <div className="bg-white max-w-sm py-2 mx-auto p-4 w-full rounded shadow">
          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4">
            {/* Email */}
            <div className="grid mb-3">
              <label>Email :</label>
              <div className="bg-slate-100 p-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={data.email}
                  onChange={handleOnchange}
                  className="w-full outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 w-full rounded-full mx-auto block text-center hover:scale-105 transition-all"
            >
              Continue
            </button>
          </form>

          {/* Login link */}
          <p className="my-4 text-center">
            Already have account ?{" "}
            <Link to="/login" className="hover:text-red-600">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Signup;
