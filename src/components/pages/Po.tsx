import React, { useState } from "react";

const po = () => {
  const count = localStorage.getItem("count")
   ? parseInt(localStorage.getItem("count")!) : 0;

  const setCount = () => {
    const countt = localStorage.getItem("count") ? 
    parseInt(localStorage.getItem("count")!) : 0;
    localStorage.setItem("count",countt+1)
  }
  const setCountt = ()=>{
    const count = localStorage.getItem("count") ?
    parseInt(localStorage.getItem("count")!) : 0;
    localStorage.setItem("count",count-1)
  }
  const setCounttt = ()=>{
    localStorage.setItem("count","0")
  }
  return (
    <div className="w-full min-h-screen">
      <h1>Counter:{count}</h1>

      <div className="flex gap-20 pt-40">
        <div>
<button onClick={() => setCount(count + 1)} className="bg-blue-900 rounded-full px-4 py-2 text-white hover:bg-black ">Increase</button>
        </div>
        <div>
<button onClick={() => setCountt(count-1)} className="bg-blue-900 rounded-full px-4 py-2 text-white hover:bg-black ">Decrease</button>
        </div>
        <div>
<button onClick={() => setCounttt()} className="bg-blue-900 rounded-full px-4 py-2 text-white hover:bg-black ">Reset</button>
        </div>

      </div>
    </div>
  )
}

export default po
