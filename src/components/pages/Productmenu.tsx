import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/http";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  Plus,
  AlertTriangle,
  Trash2,
  Pencil,
  Search,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  details?: string;
  optionalName?: string;
  discount?: number;
  sizes?: string[];
  colors?: string[];
}

const Productmenu = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [activeModal, setActiveModal] = useState<"edit" | "delete" | "add" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states (for Add & Edit)
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/productmenu`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error("Failed to load products ❌");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred while fetching products ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name || "");
    setFormCategory(product.category || "");
    setFormUnit(product.unit || "");
    setFormPrice(String(product.price || ""));
    setFormStock(String(product.stock || ""));
    setActiveModal("edit");
  };

  const openAddModal = () => {
    setFormName("");
    setFormCategory("");
    setFormUnit("");
    setFormPrice("");
    setFormStock("");
    setActiveModal("add");
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setActiveModal("delete");
  };

  const closeModals = () => {
    setActiveModal(null);
    setSelectedProduct(null);
  };

  // Create Product handler
  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName || !formCategory || !formUnit || !formPrice || formStock === "") {
      toast.error("Please fill in all fields ❌");
      return;
    }

    try {
      const payload = {
        name: formName,
        category: formCategory,
        unit: formUnit,
        price: Number(formPrice) || 0,
        stock: Number(formStock) || 0,
        details: formName, // Populate details with name to satisfy backend schema
        discount: 0,
        sizes: [],
        colors: [],
      };

      const res = await fetch(`${API_BASE_URL}/productmenu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Product created successfully! 🎉", {
          style: { background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" },
        });
        closeModals();
        fetchProducts();
      } else {
        toast.error("Failed to create product ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating product ❌");
    }
  };

  // Edit Product handler
  const handleEditProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!formName || !formCategory || !formUnit || !formPrice || formStock === "") {
      toast.error("Please fill in all fields ❌");
      return;
    }

    try {
      const payload = {
        ...selectedProduct,
        name: formName,
        category: formCategory,
        unit: formUnit,
        price: Number(formPrice) || 0,
        stock: Number(formStock) || 0,
        details: selectedProduct.details || formName,
      };

      const res = await fetch(`${API_BASE_URL}/productmenu/${selectedProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast("Product updated successfully! ✏️", {
          style: { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" },
        });
        closeModals();
        fetchProducts();
      } else {
        toast.error("Failed to update product ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating product ❌");
    }
  };

  // Delete Product handler
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const res = await fetch(`${API_BASE_URL}/productmenu/${selectedProduct._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.error("Product deleted successfully! 🗑️", {
          style: { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5" },
        });
        closeModals();
        fetchProducts();
      } else {
        toast.error("Failed to delete product ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting product ❌");
    }
  };

  // Filtering Logic
  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return searchQuery === "" || nameMatch || categoryMatch;
  });

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Formatting utilities
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Back Button */}
      <div>
        <a
          href="/masters"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span className="text-base font-semibold">Back to page</span>
        </a>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {/* Header containing title, search, and Add button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 border-b border-[#E5E7EB]">

          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-400 mt-0.5">{products.length} products</p>
          </div>

          {/* Search bar centered */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
            />
          </div>

          {/* Add product button on right */}
          <div>
            <button
              onClick={openAddModal}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500/20 border-t-blue-600"></div>
            <p className="text-sm text-gray-400 font-medium">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-gray-700">No products found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2563EB] border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white w-16 text-center">
                    #
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white">
                    Unit
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white w-32 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {paginatedProducts.map((product, idx) => {
                  const itemIndex = String(startIndex + idx + 1).padStart(2, "0");
                  const inStock = (product.stock || 0) > 0;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-400 text-center">
                        {itemIndex}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 max-w-[240px] truncate">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.unit}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {inStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                            {product.stock}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                            Out of stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="inline-flex items-center gap-2.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-xl transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-[#DC2626] rounded-xl transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#F8FAFC]">
            <p className="text-sm font-semibold text-gray-600">
              Showing {totalItems === 0 ? 0 : startIndex + 1}–{endIndex} of {totalItems}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 border border-[#E5E7EB] rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 border border-[#E5E7EB] rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}

      {/* ADD / EDIT FORM MODAL */}
      {(activeModal === "add" || activeModal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2.5 font-bold text-gray-900">
                <div className="p-2 bg-blue-50 text-[#2563EB] rounded-lg">
                  {activeModal === "add" ? <Plus className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
                </div>
                <span>{activeModal === "add" ? "Add Product" : "Edit Product"}</span>
              </div>
              <button
                onClick={closeModals}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={activeModal === "add" ? handleCreateProduct : handleEditProduct}>
              {/* Content Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Classic White Tee"
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                  />
                </div>

                {/* Category & Unit in Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Apparel"
                      className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="e.g. pcs / box / kg"
                      className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                    />
                  </div>
                </div>

                {/* Price & Stock in Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      placeholder="0"
                      className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-gray-50">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {activeModal === "add" ? "Add Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {activeModal === "delete" && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2.5 font-bold text-gray-900">
                <div className="p-2 bg-red-50 text-[#DC2626] rounded-lg">
                  <Trash2 className="h-5 w-5" />
                </div>
                <span>Delete Product</span>
              </div>
              <button
                onClick={closeModals}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-[#FEF2F2] border border-[#FEE2E2] p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#DC2626]">Are you sure you want to delete this product?</p>
                  <p className="text-xs text-red-600/80 mt-1 leading-relaxed">
                    This action cannot be undone. This product will be permanently removed from the system inventory and all active records.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-[#E5E7EB] rounded-xl p-4 space-y-2.5">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Name
                  </span>
                  <span className="block text-sm font-bold text-gray-900">{selectedProduct.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Category
                    </span>
                    <span className="block text-sm font-semibold text-gray-800">
                      {selectedProduct.category}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Price
                    </span>
                    <span className="block text-sm font-bold text-gray-900">
                      {formatPrice(selectedProduct.price)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Unit
                    </span>
                    <span className="block text-sm font-semibold text-gray-800">
                      {selectedProduct.unit}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Stock
                    </span>
                    <span className="block text-sm font-bold text-gray-900">
                      {selectedProduct.stock}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-gray-50">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#DC2626] rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productmenu;


