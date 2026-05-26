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
} from "lucide-react";

const Productmenu = () => {
  const navigate = useNavigate();

  // ================= STATE =================
  const [formData, setFormData] = useState({
    name: "",
    optionalName: "",
    details: "",
    category: "",
    unit: "",
    price: "",
    stock:"",

    discount: "",
  });

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [description, setDescription] = useState("");
 const [, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const maxLength = 2000;

  const sizes = ["S", "M", "L", "XL"];
  const colors = [
    { name: "Red", value: "red", class: "bg-red-500" },
    { name: "Blue", value: "blue", class: "bg-blue-500" },
    { name: "Black", value: "black", class: "bg-black" },
  ];

  // ================= HANDLERS =================
  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      optionalName: "",
      details: "",
      category: "",
      unit: "",
      price: "",
      stock:"",
      discount: "",
    });
    setSelectedSize("");
    setSelectedColor("");
    setDescription("");
    setImage(null);
    setPreview("");
    setRating(0);
    setHover(0);
    setReview("");
  };
  

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        sizes: selectedSize ? [selectedSize] : [],
        colors: selectedColor ? [selectedColor] : [],
        description,
        rating,
        review,
      };

      console.log("Sending:", data);

      const res = await fetch(`${API_BASE_URL}/productmenu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  // ================= UI =================
  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      {/* Back Button */}
      <a href="/masters" className="flex items-center gap-2 text-gray-700">
        <ArrowLeft className="h-5 w-5" />
        <span>Back to page</span>
      </a>

      {/* Header */}
      <div className="bg-gray-100 p-6 rounded-2xl border flex items-center gap-4">
        <div className="bg-blue-700 text-white p-4 rounded-xl">
          <Plus className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Add New Product</h1>
          <p className="text-gray-500">
            Fill out the sections below to create a new product.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* BASIC INFO */}
        <Section icon={<Info  />} title="Basic Information">
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" />
          <Input name="optionalName" value={formData.optionalName} onChange={handleChange} placeholder="Optional Name" />
          <Input name="details" value={formData.details} onChange={handleChange} placeholder="Details" />
          <Input name="category" value={formData.category} onChange={handleChange} placeholder="Category" />
          <Input name="unit" value={formData.unit} onChange={handleChange} placeholder="Unit" />
         
          <Input name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" type="number" />
        </Section>

        {/* PRICING */}
        <Section icon={<Tag />} title="Pricing">
          <div className="grid md:grid-cols-2 gap-4">
            <Input name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" />
            <Input name="discount" value={formData.discount} onChange={handleChange} placeholder="Discount" type="number" />
          </div>
        </Section>

        {/* OPTIONS */}
        <Section icon={<SlidersHorizontal />} title="Product Options">
          <div>
            <p className="mb-2 font-medium">Size *</p>
            <div className="flex gap-3">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedSize === size ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mt-4 mb-2 font-medium">Color *</p>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                    selectedColor === color.value ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${color.class}`} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* MEDIA */}
        <Section icon={<ImagePlus />} title="Media">
          <label className="cursor-pointer">
            <div className="w-40 h-40 border-2 border-dashed rounded-xl flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center text-gray-500">
                  <ImagePlus className="mx-auto mb-2" />
                  Upload Image
                </div>
              )}
            </div>
            <input type="file" hidden onChange={handleImageChange} />
          </label>
        </Section>

        {/* DESCRIPTION */}
        <Section icon={<FileText />} title="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={maxLength}
            className="w-full p-3 border rounded-xl"
            rows={5}
          />
        </Section>

        {/* REVIEWS */}
        <Section icon={<MessageSquare />} title="Reviews">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className={`cursor-pointer ${
                  (hover || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-400"
                }`}
              />
            ))}
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-3 border rounded-xl mt-4"
          />

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Plus /> Add Product
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border rounded-xl bg-black text-white"
            >
              Reset
            </button>
          </div>
        </Section>
      </form>
    </div>
  );
};

// REUSABLE COMPONENTS
interface SectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

const Section = ({
  icon,
  title,
  children,
}: SectionProps) => (
  <div className="bg-gray-100 p-6 rounded-2xl border">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-gray-200 p-2 rounded-full">
        {icon}
      </div>

      <h2 className="font-semibold">
        {title}
      </h2>
    </div>

    <hr className="mb-4" />

    <div className="space-y-4">
      {children}
    </div>
  </div>
);

interface InputProps {
  name: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
}

const Input = ({
  name,
  value,
  placeholder,
  type = "text",
  onChange,
}: InputProps) => (
  <input
    name={name}
    value={value}
    placeholder={placeholder}
    type={type}
    onChange={onChange}
    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-gray-400"
  />
);

export default Productmenu;