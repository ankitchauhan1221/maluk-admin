import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Editor } from '@tinymce/tinymce-react';
import ProductImageUpload from "@/components/product/ProductImageUpload";
import { baseurl, routes } from "@/common/config";

// Interfaces
interface Category {
  _id: string;
  name: string;
  status?: string;
  productCount?: number;
  __v?: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice: number;
  stock: number;
  category: string | Category;
  sku: string;
  description: string;
  specification: string;
  thumbnails: string[];
  gallery: string[];
}

interface ImageState {
  thumbnails: (File | string)[];
  gallery: (File | string)[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await fetchCategories();
        await fetchProducts();
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchAllData();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseurl}${routes.GET}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();
      console.log("Products API Response:", data);

      const productData = data.products || data.data || data || [];
      if (!Array.isArray(productData)) {
        console.error("Products data is not an array:", productData);
        setProducts([]);
      } else {
        const validProducts = productData.filter((product: Product) => product && product._id).map(product => ({
          ...product,
          thumbnails: product.thumbnails.map(thumbnail =>
            thumbnail.startsWith('http') ? thumbnail : `${baseurl}/${thumbnail.replace(/\\/g, '/')}`
          ),
          gallery: product.gallery.map(galleryItem =>
            galleryItem.startsWith('http') ? galleryItem : `${baseurl}/${galleryItem.replace(/\\/g, '/')}`
          ),
        }));
        setProducts(validProducts);
        console.log("Updated products state:", validProducts);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error(error.message || "Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const response = await fetch(`${baseurl}/api/categories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();
      console.log("Categories API Response:", data);

      const categoryData = data.data || data || [];
      if (!Array.isArray(categoryData)) {
        throw new Error("Categories data is not an array");
      }
      setCategories(categoryData);
      console.log("Fetched Categories:", categoryData.map((cat: Category) => ({ _id: cat._id, name: cat.name })));
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast.error(error.message || "Failed to load categories");
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const getProductStatus = (stock: number) => (stock > 0 ? "In Stock" : "Out of Stock");

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    salePrice: 0,
    stock: 0,
    category: "",
    sku: "",
    description: "",
    specification: "",
    thumbnails: [],
    gallery: [],
  });
  const [newImages, setNewImages] = useState<ImageState>({ thumbnails: [], gallery: [] });

  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editImages, setEditImages] = useState<ImageState>({ thumbnails: [], gallery: [] });
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const validateProduct = (product: Partial<Product>): string[] => {
    const errors: string[] = [];
    if (!product.name) errors.push("Product name is required");
    if (!product.price || product.price <= 0) errors.push("Valid price is required");
    if (!product.salePrice || product.salePrice <= 0) errors.push("Valid sale price is required");
    if (!product.category) errors.push("Category is required");
    if (!categories.some(cat => cat._id === product.category)) errors.push("Selected category is invalid");
    if (product.stock === undefined || product.stock < 0) errors.push("Valid stock quantity is required");
    return errors;
  };

  const getCategoryNameById = (categoryId: string): string => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : `Unknown (${categoryId})`;
  };

  const handleAddProduct = async () => {
    const errors = validateProduct(newProduct);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const categoryId = newProduct.category as string;

      formData.append('name', newProduct.name || '');
      formData.append('price', newProduct.price?.toString() || '0');
      formData.append('salePrice', newProduct.salePrice?.toString() || '0');
      formData.append('stock', newProduct.stock?.toString() || '0');
      formData.append('categoryId', categoryId);
      formData.append('sku', newProduct.sku || '');
      formData.append('description', newProduct.description || '');
      formData.append('specifications', newProduct.specification || '');

      newImages.thumbnails.forEach((file) => {
        formData.append('thumbnails', file);
      });
      newImages.gallery.forEach((file) => {
        formData.append('gallery', file);
      });

      console.log("Add Product FormData:", Object.fromEntries(formData));

      const response = await fetch(`${baseurl}${routes.ADD}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Add Product Server Error:", errorData);
        throw new Error(errorData.error || `Failed to add product: ${response.statusText}`);
      }

      const addedProduct = await response.json();
      console.log("Add Product API Response:", addedProduct);

      setProducts(prev => [...prev, addedProduct]);
      setIsAddProductOpen(false);
      setNewProduct({
        name: "",
        price: 0,
        salePrice: 0,
        stock: 0,
        category: "",
        sku: "",
        description: "",
        specification: "",
        thumbnails: [],
        gallery: [],
      });
      setNewImages({ thumbnails: [], gallery: [] });
      toast.success("Product added successfully");
      await fetchProducts();
    } catch (error) {
      console.error('Add product error:', error);
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (product: Product) => {
    const categoryId = typeof product.category === 'string' ? product.category : product.category?._id || '';
    console.log("Editing Product Initial State:", {
      ...product,
      category: categoryId,
      thumbnails: product.thumbnails || [],
      gallery: product.gallery || [],
    });

    const editingProductData: Product = {
      _id: product._id || '',
      name: product.name || '',
      price: product.price || 0,
      salePrice: product.salePrice || 0,
      stock: product.stock || 0,
      category: categoryId,
      sku: product.sku || '',
      description: product.description || '',
      specification: product.specification || '',
      thumbnails: product.thumbnails || [],
      gallery: product.gallery || [],
    };

    setEditingProduct(editingProductData);
    setEditImages({
      thumbnails: product.thumbnails || [],
      gallery: product.gallery || [],
    });
    setIsEditProductOpen(true);
  };

  const handleEditProduct = async () => {
    if (!editingProduct) {
      console.error("No product to edit");
      toast.error("No product selected for editing");
      return;
    }

    const errors = validateProduct(editingProduct);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append('name', editingProduct.name || '');
      formData.append('price', editingProduct.price.toString());
      formData.append('salePrice', editingProduct.salePrice.toString());
      formData.append('stock', editingProduct.stock.toString());
      formData.append('category', editingProduct.category || '');
      formData.append('sku', editingProduct.sku || '');
      formData.append('description', editingProduct.description || '');
      formData.append('specifications', editingProduct.specification || '');

      editImages.thumbnails.forEach((thumbnail) => {
        if (thumbnail instanceof File) {
          formData.append('thumbnails', thumbnail);
        }
      });
      editImages.gallery.forEach((galleryItem) => {
        if (galleryItem instanceof File) {
          formData.append('gallery', galleryItem);
        }
      });

      console.log("Edit Product FormData:", Object.fromEntries(formData));

      const response = await fetch(`${baseurl}${routes.EDIT.replace(':id', editingProduct._id)}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Edit Product Server Error:", errorData);
        throw new Error(errorData.error || `Failed to update product: ${response.statusText}`);
      }

      const updatedProduct = await response.json();
      console.log("Update API Response:", updatedProduct);

      setProducts(prev => prev.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
      setIsEditProductOpen(false);
      setEditingProduct(null);
      setEditImages({ thumbnails: [], gallery: [] });
      toast.success("Product updated successfully");
      await fetchProducts();
    } catch (error) {
      console.error('Edit product error:', error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${baseurl}${routes.REMOVE.replace(':id', productToDelete)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete product: ${response.statusText}`);
      }

      const result = await response.json().catch(() => ({}));
      console.log("Delete Product Response:", result);

      setProducts(prev => prev.filter(p => p._id !== productToDelete));
      toast.success("Product deleted successfully");

      window.dispatchEvent(new Event('productDeleted'));
      await fetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error(error.message || "Failed to delete product");
      await fetchProducts();
    } finally {
      setProductToDelete(null);
      setIsSubmitting(false);
    }
  };

  const editorConfig = {
    height: 300,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'imagetools'
    ],
    toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image | removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">Manage your product inventory</p>
          </div>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={isSubmitting || isCategoriesLoading}>
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the product details below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Title *</Label>
                      <Input
                        id="name"
                        value={newProduct.name || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Enter product title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={newProduct.sku || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                        placeholder="Enter SKU"
                      />
                    </div>
                  </div>

                  <ProductImageUpload
                    images={newImages}
                    onImagesChange={setNewImages}
                    maxImages={5}
                    className="mb-6"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Editor
                      apiKey="4gv8zagg41b5fj4t8mku6ih7w40s4mm51at2idqf1ij8uhmg"
                      value={newProduct.description || ""}
                      onEditorChange={(content) => setNewProduct({ ...newProduct, description: content })}
                      init={editorConfig}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specification">Specification</Label>
                    <Editor
                      apiKey="4gv8zagg41b5fj4t8mku6ih7w40s4mm51at2idqf1ij8uhmg"
                      value={newProduct.specification || ""}
                      onEditorChange={(content) => setNewProduct({ ...newProduct, specification: content })}
                      init={editorConfig}
                    />
                  </div>

                  <h3 className="font-medium text-lg">Pricing & Inventory</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Regular Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newProduct.price || 0}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salePrice">Sale Price</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={newProduct.salePrice || 0}
                        onChange={(e) => setNewProduct({ ...newProduct, salePrice: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock || 0}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                        placeholder="Enter stock quantity"
                      />
                    </div>
                  </div>

                  <h3 className="font-medium text-lg">Category</h3>
                  {isCategoriesLoading ? (
                    <div>Loading categories...</div>
                  ) : categories.length === 0 ? (
                    <div>No categories available</div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newProduct.category || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setIsAddProductOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddProduct} disabled={isSubmitting || isCategoriesLoading}>
                      {isSubmitting ? "Adding..." : "Add Product"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update the product details below</DialogDescription>
            </DialogHeader>
            {editingProduct ? (
              <div className="grid gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Product Title *</Label>
                      <Input
                        id="edit-name"
                        value={editingProduct.name || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="Enter product title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-sku">SKU</Label>
                      <Input
                        id="edit-sku"
                        value={editingProduct.sku || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        placeholder="Enter SKU"
                      />
                    </div>
                  </div>

                  <ProductImageUpload
                    images={editImages}
                    onImagesChange={setEditImages}
                    maxImages={5}
                    className="mb-6"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Editor
                      apiKey="4gv8zagg41b5fj4t8mku6ih7w40s4mm51at2idqf1ij8uhmg"
                      value={editingProduct.description || ""}
                      onEditorChange={(content) => setEditingProduct({ ...editingProduct, description: content })}
                      init={editorConfig}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-specification">Specification</Label>
                    <Editor
                      apiKey="4gv8zagg41b5fj4t8mku6ih7w40s4mm51at2idqf1ij8uhmg"
                      value={editingProduct.specification || ""}
                      onEditorChange={(content) => setEditingProduct({ ...editingProduct, specification: content })}
                      init={editorConfig}
                    />
                  </div>

                  <h3 className="font-medium text-lg">Pricing & Inventory</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-price">Regular Price *</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={editingProduct.price || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-salePrice">Sale Price</Label>
                      <Input
                        id="edit-salePrice"
                        type="number"
                        value={editingProduct.salePrice || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-stock">Stock Quantity *</Label>
                      <Input
                        id="edit-stock"
                        type="number"
                        value={editingProduct.stock || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                        placeholder="Enter stock quantity"
                      />
                    </div>
                  </div>

                  <h3 className="font-medium text-lg">Category</h3>
                  {isCategoriesLoading ? (
                    <div>Loading categories...</div>
                  ) : categories.length === 0 ? (
                    <div>No categories available</div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category *</Label>
                      <select
                        id="edit-category"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={editingProduct.category || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setIsEditProductOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditProduct} disabled={isSubmitting || isCategoriesLoading}>
                      {isSubmitting ? "Updating..." : "Update Product"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>No product selected for editing</div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={productToDelete !== null} onOpenChange={() => setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((head) => (
                    <th key={head} className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      {Array.from({ length: 6 }).map((__, idx) => (
                        <td key={idx} className="px-6 py-4">
                          <div className="w-10 h-4 bg-gray-100 rounded-lg animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.thumbnails && product.thumbnails.length > 0 ? (
                              <img
                                src={product.thumbnails[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => console.error('Thumbnail load error:', e)}
                              />
                            ) : (
                              <ShoppingBag className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium block">{product.name}</span>
                            <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{getCategoryNameById(typeof product.category === 'string' ? product.category : product.category._id)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-gray-900">₹{product.price.toFixed(2)}</span>
                          {product.salePrice && (
                            <span className="text-sm text-red-500 block">Sale: ₹{product.salePrice.toFixed(2)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            getProductStatus(product.stock) === "In Stock"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {getProductStatus(product.stock)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)} disabled={isSubmitting}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(product._id)} disabled={isSubmitting}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;