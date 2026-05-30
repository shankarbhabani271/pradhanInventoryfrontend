import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/http";
import { toast } from "sonner";

import { useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  ArrowLeft,
  Plus,
  Info,
  MessageSquare,
  Star,
  FileText,
  Tag,
  ImagePlus,
  SlidersHorizontal,
  Package,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";

// ─── Stock Badge ──────────────────────────────────────────────────────────────
const StockBadge = ({ stock }: { stock: string }) => {
  const n = parseInt(stock) || 0;
  if (!stock || n === 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <AlertTriangle className="h-3.5 w-3.5" /> Out of stock
      </span>
    );
  if (n <= 10)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <AlertCircle className="h-3.5 w-3.5" /> Low stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <CheckCircle className="h-3.5 w-3.5" /> In stock
    </span>
  );
};

// ─── Stock Bar ────────────────────────────────────────────────────────────────
const StockBar = ({ stock }: { stock: string }) => {
  const n = parseInt(stock) || 0;
  if (!stock || n === 0) return null;
  const pct = Math.min((n / 100) * 100, 100);
  const color = n <= 10 ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>0</span>
        <span>100+</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Productmenu = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    optionalName: "",
    details: "",
    category: "",
    unit: "",
    price: "",
    stock: "",
    discount: "",
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const maxLength = 2000;

  const sizes = ["XS", "S", "M", "L", "XL", "2XL"];
  const colors = [
    { name: "Red", value: "red", hex: "#ef4444" },
    { name: "Blue", value: "blue", hex: "#3b82f6" },
    { name: "Black", value: "black", hex: "#111111" },
    { name: "White", value: "white", hex: "#e5e7eb", border: true },
    { name: "Green", value: "green", hex: "#22c55e" },
  ];

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  const effectivePrice =
    formData.price && formData.discount
      ? (parseFloat(formData.price) * (1 - parseFloat(formData.discount) / 100)).toFixed(2)
      : null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const toggleColor = (color: string) =>
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );

  const handleReset = () => {
    setFormData({ name: "", optionalName: "", details: "", category: "", unit: "", price: "", stock: "", discount: "" });
    setSelectedSizes([]);
    setSelectedColors([]);
    setDescription("");
    setImage(null);
    setPreview("");
    setRating(0);
    setHover(0);
    setReview("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        discount: Number(formData.discount) || 0,
        sizes: selectedSizes,
        colors: selectedColors,
        description,
        rating,
        review,
      };
      const res = await fetch(`${API_BASE_URL}/productmenu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Product added successfully! 🎉");
        navigate("/masters");
      } else {
        toast.error("Failed to add product ❌");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#EFF6FF] p-6 space-y-4">

      {/* Back */}
      <a href="/masters" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-6 w-6" />
       <div className="text-2xl"> Back to page</div>
      </a>

      {/* Header */}
      <div className="bg-[#0f1623] rounded-2xl p-5 flex items-center gap-4">
        <div className="bg-blue-600 text-white p-3 rounded-xl shrink-0">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Add new product</h1>
          <p className="text-sm text-blue-200/60 mt-0.5">Fill out the sections below to create a new product.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* BASIC INFO */}
        <Card icon={<Info className="h-4 w-4" />} title="Basic information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Product name">
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Classic White Tee" />
            </Field>
            <Field label="Optional name">
              <Input name="optionalName" value={formData.optionalName} onChange={handleChange} placeholder="Alias or SKU" />
            </Field>
            <Field label="Details">
              <Input name="details" value={formData.details} onChange={handleChange} placeholder="Short detail" />
            </Field>
            <Field label="Category">
              <Input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Apparel" />
            </Field>
            <Field label="Unit">
              <Input name="unit" value={formData.unit} onChange={handleChange} placeholder="pcs / kg / box" />
            </Field>
          </div>
        </Card>

        {/* STOCK */}
        <Card icon={<Package className="h-4 w-4" />} title="Stock">
          <Field label="Quantity in stock">
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="max-w-[180px]"
              />
              <StockBadge stock={formData.stock} />
            </div>
            <StockBar stock={formData.stock} />
          </Field>
        </Card>

        {/* PRICING */}
        <Card icon={<Tag className="h-4 w-4" />} title="Pricing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  type="number"
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </Field>
            <Field label="Discount (%)">
              <div className="relative">
                <input
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                  type="number"
                  className="w-full pl-3 pr-7 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </Field>
          </div>
          {effectivePrice && (
            <div className="mt-3 px-4 py-2.5 bg-blue-50 rounded-xl flex items-center justify-between">
              <span className="text-xs text-blue-600 font-medium">Effective price after discount</span>
              <span className="text-sm font-semibold text-blue-700">₹{effectivePrice}</span>
            </div>
          )}
        </Card>

        {/* OPTIONS */}
        <Card icon={<SlidersHorizontal className="h-4 w-4" />} title="Product options">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedSizes.includes(size)
                      ? "bg-[#0f1623] text-white border-[#0f1623]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color.value}
                  onClick={() => toggleColor(color.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${
                    selectedColors.includes(color.value)
                      ? "bg-[#0f1623] text-white border-[#0f1623]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{
                      backgroundColor: color.hex,
                      border: color.border ? "1px solid #d1d5db" : undefined,
                    }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* MEDIA */}
        <Card icon={<ImagePlus className="h-4 w-4" />} title="Media">
          <label className="cursor-pointer block">
            <div className={`border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-colors ${preview ? "" : "h-32"}`}>
              {preview ? (
                <img src={preview} alt="preview" className="w-full object-cover max-h-64 rounded-xl" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                  <ImagePlus className="h-7 w-7" />
                  <span className="text-sm">Click to upload image</span>
                  <span className="text-xs text-gray-300">PNG, JPG, WEBP up to 10MB</span>
                </div>
              )}
            </div>
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </label>
          {preview && (
            <button
              type="button"
              onClick={() => { setPreview(""); setImage(null); }}
              className="mt-2 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove image
            </button>
          )}
        </Card>

        {/* DESCRIPTION */}
        <Card icon={<FileText className="h-4 w-4" />} title="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={maxLength}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
            rows={5}
            placeholder="Write a detailed product description..."
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${description.length > maxLength * 0.9 ? "text-amber-500" : "text-gray-400"}`}>
              {description.length} / {maxLength}
            </span>
          </div>
        </Card>

        {/* REVIEW */}
        <Card icon={<MessageSquare className="h-4 w-4" />} title="Review">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rating</p>
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className={`h-7 w-7 cursor-pointer transition-colors ${
                  (hover || rating) >= star
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 fill-gray-200"
                }`}
              />
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-400">{ratingLabels[rating]}</span>
            )}
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
            rows={3}
            placeholder="Write a review comment..."
          />

          <div className="flex gap-3 mt-5">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" /> Add product
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-700"
            >
              Reset
            </button>
          </div>
        </Card>

      </form>
    </div>
  );
};

// ─── Reusable Components ──────────────────────────────────────────────────────

interface CardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

const Card = ({ icon, title, children }: CardProps) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
      <div className="bg-gray-100 text-gray-500 p-2 rounded-lg">{icon}</div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
    </div>
    <div className="px-5 py-4 space-y-3">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  children: ReactNode;
}

const Field = ({ label, children }: FieldProps) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    {children}
  </div>
);

interface InputProps {
  name: string;
  value: string;
  placeholder: string;
  type?: string;
  className?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ name, value, placeholder, type = "text", className = "", onChange }: InputProps) => (
  <input
    name={name}
    value={value}
    placeholder={placeholder}
    type={type}
    onChange={onChange}
    className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-300 ${className}`}
  />
);

export default Productmenu;
