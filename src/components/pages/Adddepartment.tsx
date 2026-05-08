import React, { useState } from "react";

const AddDepartmentForm = () => {
  const [departmentType, setDepartmentType] = useState("parent");

  const parentDepartments = ["HR", "IT", "Finance", "Sales"];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">

      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200">

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-slate-800">
            Add Department
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create parent or sub departments
          </p>
        </div>

        {/* Department Name */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Department Name
          </label>

          <input
            type="text"
            placeholder="Enter department name"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Department Type */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Department Type
          </label>

          <div className="flex gap-6 text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="departmentType"
                value="parent"
                checked={departmentType === "parent"}
                onChange={(e) => setDepartmentType(e.target.value)}
                className="accent-indigo-600"
              />
              Parent Department
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="departmentType"
                value="sub"
                checked={departmentType === "sub"}
                onChange={(e) => setDepartmentType(e.target.value)}
                className="accent-indigo-600"
              />
              Sub Department
            </label>
          </div>
        </div>

        {/* Parent Dropdown */}
        {departmentType === "sub" && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Parent Department
            </label>

            <select
              className="w-full border border-slate-300 rounded-xl px-4 py-3 
              focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option>Select Parent Department</option>

              {parentDepartments.map((dept, index) => (
                <option key={index}>{dept}</option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            className="w-full bg-red-500 hover:bg-red-600 
            text-white py-3 rounded-xl font-medium transition"
          >
            Cancel
          </button>

          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 
            text-white py-3 rounded-xl font-medium transition"
          >
            Save Department
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentForm;