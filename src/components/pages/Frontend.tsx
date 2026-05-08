import React, { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Play,
  LayoutDashboard,
  Plus,
  ArrowDown
} from "lucide-react";

const WorkspaceDashboard = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const todayDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full min-h-screen bg-[#f8f6f2]">
      
      {/* Main Wrapper */}
      <div className="w-full min-h-screen bg-white">

        {/* Navbar */}
       
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">

          {/* Left Section */}
          <div className="border-r border-gray-200 p-8 md:p-16 flex flex-col justify-center relative">
            
            <div className="inline-flex items-center gap-2 bg-[#f5f1eb] px-4 py-2 rounded-full text-sm w-fit mb-6">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Good Afternoon
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
              Welcome <br />
              back,
            </h1>

            <h2 className="text-4xl md:text-5xl italic font-serif text-green-700 mt-4">
              Bhabani Patra
            </h2>

            <p className="text-gray-500 text-lg mt-6 max-w-md">
              Your workspace is synced. Pick up where you left off and make today count.
            </p>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-md">
              <button className="border rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-gray-50">
                <Play size={18} />
                Continue
              </button>

              <button className="border rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-gray-50">
                <LayoutDashboard size={18} />
                Dashboard
              </button>

              
            </div>

            {/* Arrow */}
            
          </div>

          {/* Right Section */}
          <div className="flex flex-col">

            {/* Clock Section */}
            <div className="flex-1 border-b border-gray-200 p-8 md:p-16 flex flex-col justify-center">
              <p className="uppercase tracking-[4px] text-gray-400 text-sm mb-4">
                Current Time — IST
              </p>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif">
                {time}
              </h1>

              <p className="text-xl text-gray-500 mt-4">
                {todayDate}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {[
                {
                  icon: "✓",
                  number: "12",
                  label: "Tasks Done",
                  color: "bg-green-500",
                  bg: "bg-green-100",
                },
                {
                  icon: "⚡",
                  number: "7",
                  label: "Day Streak",
                  color: "bg-yellow-500",
                  bg: "bg-yellow-100",
                },
                {
                  icon: "📊",
                  number: "72%",
                  label: "Daily Goal",
                  color: "bg-blue-500",
                  bg: "bg-blue-100",
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-3xl p-6 shadow-sm"
                >
                  <div
                    className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4`}
                  >
                    {card.icon}
                  </div>

                  <h2 className="text-3xl font-semibold">
                    {card.number}
                  </h2>

                  <p className="text-gray-500 mt-2">
                    {card.label}
                  </p>

                  <div className="w-full h-1 bg-gray-200 rounded-full mt-4">
                    <div
                      className={`h-full rounded-full ${card.color} w-3/4`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard;