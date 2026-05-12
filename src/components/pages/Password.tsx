import React, { useState } from "react";
import { Lock, Eye, Phone, Camera, Droplet } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
const UpdatePasswordProfile = () => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);



  const [profileImage, setProfileImage] =
    useState<string>("");

  const [mobile, setMobile] =
    useState("");

  const [bloodGroup, setBloodGroup] =
    useState("");


  // image upload
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setProfileImage(
          reader.result as string
        );
      };

      reader.readAsDataURL(file);
    }
  };


  // save data
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/password/create-profile",
        {
          profileImage,
          mobile,
          bloodGroup
        }
      );

      if (res.data.success) {
        toast.success("Profile Saved Successfully");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-purple-100 flex items-center justify-center p-6">

      {/* Main Container */}
      <div className="bg-white w-full max-w-7xl rounded-3xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left Section */}
        <div>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="text-purple-600" size={35} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-center mb-2">
            Update Password
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Change your temporary password to continue
          </p>

          {/* Old Password */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Old Password</label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                placeholder="Enter old password"
                className="w-full border rounded-xl px-12 py-3 outline-none"
              />
              <Lock className="absolute left-4 top-3 text-gray-400" size={20} />
              <Eye
                className="absolute right-4 top-3 text-gray-400 cursor-pointer"
                onClick={() => setShowOld(!showOld)}
              />
            </div>
          </div>

          {/* New Password */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full border rounded-xl px-12 py-3 outline-none"
              />
              <Lock className="absolute left-4 top-3 text-gray-400" size={20} />
              <Eye
                className="absolute right-4 top-3 text-gray-400 cursor-pointer"
                onClick={() => setShowNew(!showNew)}
              />
            </div>
          </div>

          {/* Password Strength */}


          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                className="w-full border rounded-xl px-12 py-3 outline-none"
              />
              <Lock className="absolute left-4 top-3 text-gray-400" size={20} />
              <Eye
                className="absolute right-4 top-3 text-gray-400 cursor-pointer"
                onClick={() => setShowConfirm(!showConfirm)}
              />
            </div>
          </div>

          {/* Password Rules */}


          {/* Buttons */}
          <div className="flex gap-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl w-full">
              Update Password
            </button>

            <button className="border px-8 py-3 rounded-xl w-full">
              Cancel
            </button>
          </div>

          <p className="text-center mt-5 text-purple-600 cursor-pointer">
            ← Back to Login
          </p>
        </div>

        {/* Right Section */}
        <div className="border-l pl-8">
          <h2 className="text-2xl font-semibold mb-6">Profile Picture</h2>

          {/* Upload Section */}
          <div className="flex flex-col items-center mb-8">

            <label className="w-40 h-40 border-2 border-dashed border-purple-300 rounded-full flex items-center justify-center relative cursor-pointer overflow-hidden">

              {/* Show uploaded image preview */}
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Camera
                  className="text-purple-600"
                  size={40}
                />
              )}

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              {/* Plus button */}
              <div className="absolute bottom-3 right-3 bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                +
              </div>
            </label>

            <p className="mt-4 text-gray-500 text-sm">
              Upload your profile picture
            </p>

            <p className="text-gray-400 text-xs">
              JPG, PNG (Max 2MB)
            </p>
          </div>

          {/* Mobile Number */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value)
                }
                className="w-full border rounded-xl px-12 py-3 outline-none"
              />
              <Phone className="absolute left-4 top-3 text-gray-400" size={20} />
            </div>
          </div>

          {/* Blood Group */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">
              Blood Group
            </label>

            <div className="relative">
              <select
                value={bloodGroup}
                onChange={(e) =>
                  setBloodGroup(e.target.value)
                }
                className="w-full border rounded-xl px-12 py-3 outline-none"
              >
                <option value="">
                  Select blood group
                </option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>

              <Droplet
                className="absolute left-4 top-3 text-gray-400"
                size={20}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-purple-600 text-white py-3 rounded-xl"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordProfile;