import  { useEffect, useState } from "react";

const Po = () => {
  // state
  const [count, setCounttt] = useState<number>(0);

  // load localStorage data
  useEffect(() => {
    const savedCount = localStorage.getItem("count");

    if (savedCount) {
      setCounttt(parseInt(savedCount));
    }
  }, []);

  // save to localStorage
  useEffect(() => {
    localStorage.setItem("count", count.toString());
  }, [count]);

  const increaseCount = () => {
    setCounttt(count + 1);
  };

  const decreaseCount = () => {
    if (count > 0) {
      setCounttt(count - 1);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Purchase Order Counter
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={decreaseCount}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          -
        </button>

        <h2 className="text-xl">{count}</h2>

        <button
          onClick={increaseCount}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Po;