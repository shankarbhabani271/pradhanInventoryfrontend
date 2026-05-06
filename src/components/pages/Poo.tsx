import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

function PurchaseRequest() {
  const [items, setItems] = useState([
    { productName: "", qty: 1, price: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { productName: "", qty: 1, price: 0 }]);
  };

  const removeItem = (index:number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const totalQty = items.reduce(
    (sum, item) => sum + Number(item.qty),
    0
  );

  const totalAmount = items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  return (
    <div className="min-h-screen p-4 md:p-6">

      {/* Vendor Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden mb-6">
        
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 text-white">
          <div className="flex justify-between items-center flex-wrap gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xl">
                HP
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  HP Solutions
                </h2>
                <p className="text-sm text-blue-100">
                  Laptops & Computers
                </p>
              </div>
            </div>

            <span className="bg-green-500 px-4 py-1 rounded-full text-sm">
              Active Vendor
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-sm">Phone</p>
            <h3 className="font-semibold">+91-9988776655</h3>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-sm">GST Number</p>
            <h3 className="font-semibold">07HP9012H3X7</h3>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-sm">Location</p>
            <h3 className="font-semibold">Delhi, India</h3>
          </div>
        </div>
      </div>

      {/* Purchase Form */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6">

        <h1 className="text-2xl font-bold mb-6">
          Create Purchase Request
        </h1>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <input
            type="date"
            className="border p-3 rounded-xl"
          />
          <input
            type="date"
            className="border p-3 rounded-xl"
          />
        </div>

        {/* Department */}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <select className="border p-3 rounded-xl">
            <option>Select Department</option>
            <option>IT</option>
            <option>HR</option>
            <option>Finance</option>
          </select>

          <input
            type="text"
            placeholder="Requested By"
            className="border p-3 rounded-xl"
          />
        </div>

        {/* Priority */}
        <div className="mb-6">
          <p className="font-semibold mb-3">Priority</p>

          <div className="flex gap-4 flex-wrap">
            <button className="px-5 py-2 bg-green-100 text-green-700 rounded-full">
              Low
            </button>

            <button className="px-5 py-2 bg-yellow-100 text-yellow-700 rounded-full">
              Medium
            </button>

            <button className="px-5 py-2 bg-red-100 text-red-700 rounded-full">
              High
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Product Items
          </h2>

          {items.map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-xl mb-4"
            >
              <input
                type="text"
                placeholder="Product Name"
                className="border p-2 rounded-lg"
              />

              <input
                type="number"
                placeholder="Qty"
                className="border p-2 rounded-lg"
              />

              <input
                type="number"
                placeholder="Price"
                className="border p-2 rounded-lg"
              />

              <div className="flex items-center font-bold text-blue-600">
                ₹0
              </div>

              <button
                onClick={() => removeItem(index)}
                className="bg-red-100 text-red-600 rounded-lg flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-100"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>

        {/* Delivery */}
        <input
          type="text"
          placeholder="Delivery Address"
          className="w-full border p-3 rounded-xl mb-4"
        />

        <textarea
          rows={4}
          placeholder="Special Instructions"
          className="w-full border p-3 rounded-xl mb-6"
        ></textarea>

        {/* Summary */}
        <div className="bg-blue-50 p-5 rounded-xl mb-6 flex flex-col md:flex-row justify-between">
          <h3 className="font-semibold">
            Total Quantity: {totalQty}
          </h3>

          <h3 className="font-bold text-blue-700">
            Total Amount: ₹{totalAmount}
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 flex-wrap">
          <button className="px-6 py-3 border rounded-xl">
            Cancel
          </button>

          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseRequest;