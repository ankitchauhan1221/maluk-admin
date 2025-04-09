import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FolderTree, Edit, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { baseurl, routes } from "../common/config";

interface Category {
  _id: string;
  name: string;
  productCount: number;
  status: "active" | "inactive";
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [showCannotDelete, setShowCannotDelete] = useState(false);
  const [cannotDeleteProductCount, setCannotDeleteProductCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching categories with token:", token ? "Present" : "Missing");
      console.log("Request URL:", `${baseurl}${routes.getCategories}`);

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${baseurl}${routes.getCategories}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetch categories response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch error response:", errorText);
        throw new Error(`Failed to fetch categories: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched categories data:", data);

      if (!Array.isArray(data)) {
        console.error("Expected an array, got:", data);
        throw new Error("Invalid data format: Expected an array of categories");
      }

      setCategories(data);
    } catch (error) {
      const errorMessage = error.message.includes("Failed to fetch")
        ? "Cannot connect to the server. Please ensure it’s running on localhost:5000."
        : error.message || "Failed to fetch categories";
      console.error("Fetch categories error:", error);
      toast.error(errorMessage);
      setFetchError(errorMessage);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleProductDeleted = () => {
      console.log("Product deleted event received, re-fetching categories");
      fetchCategories();
    };
    window.addEventListener("productDeleted", handleProductDeleted);

    return () => {
      window.removeEventListener("productDeleted", handleProductDeleted);
    };
  }, []);

  const handleStatusToggle = async (id: string) => {
    try {
      const category = categories.find((cat) => cat._id === id);
      if (!category) throw new Error("Category not found");

      const newStatus = category.status === "active" ? "inactive" : "active";
      const response = await fetch(`${baseurl}${routes.toggleCategoryStatus(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to toggle category status");

      const updatedCategory = await response.json();
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === id ? { ...cat, status: updatedCategory.status } : cat
        )
      );
      toast.success("Category status updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setEditName(category.name);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`${baseurl}${routes.editCategory(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: editName }),
      });

      if (!response.ok) throw new Error("Failed to update category");

      const updatedCategory = await response.json();
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === id ? updatedCategory : category
        )
      );
      setEditingId(null);
      setEditName("");
      toast.success("Category name updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update category");
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      console.log("Attempting to delete category:", deletingId);
      const token = localStorage.getItem("token");
      console.log("Token for DELETE request:", token ? "Present" : "Missing");

      const response = await fetch(`${baseurl}${routes.deleteCategory(deletingId)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete response status:", response.status);
      const responseText = await response.text();
      console.log("Delete response body:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || "Unknown error" };
        }
        console.log("Parsed delete error:", errorData);

        if (errorData.error === "Cannot delete category with products. Remove products first.") {
          const category = categories.find((cat) => cat._id === deletingId);
          setCannotDeleteProductCount(category ? category.productCount : 0);
          setShowCannotDelete(true);
          setDeletingId(null);
          return;
        }
        throw new Error(errorData.error || `Failed to delete category: ${response.status} - ${responseText}`);
      }

      setCategories((prevCategories) =>
        prevCategories.filter((category) => category._id !== deletingId)
      );
      toast.success("Category deleted successfully");
      setDeletingId(null);
    } catch (error) {
      console.error("Delete category error:", error);
      const errorMessage = error.message.includes("Failed to fetch")
        ? "Cannot connect to the server. Please ensure it’s running on localhost:5000."
        : error.message || "Failed to delete category";
      toast.error(errorMessage);
      setDeletingId(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const response = await fetch(`${baseurl}${routes.addCategory}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: newCategory.name }),
      });

      if (!response.ok) throw new Error("Failed to add category");

      const data = await response.json();
      const newCategoryData: Category = {
        _id: data._id,
        name: data.name,
        productCount: 0,
        status: "active",
      };

      setCategories([...categories, newCategoryData]);
      setIsAddOpen(false);
      setNewCategory({ name: "" });
      toast.success("Category added successfully");
    } catch (error) {
      toast.error(error.message || "Failed to add category");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-2 text-gray-600">Manage your product categories</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] mx-4 md:mx-0">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Create a new category for your products</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <Button className="w-full sm:w-auto" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="w-full sm:w-auto" onClick={handleAddCategory}>Add Category</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-600">Loading categories...</div>
        ) : fetchError ? (
          <div className="text-center text-red-600">
            {fetchError}
            <Button variant="link" onClick={fetchCategories} className="mt-2">
              Retry
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-600">No categories found</div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                      <FolderTree className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      {editingId === category._id ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 w-full sm:w-[200px]"
                          />
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(category._id)}
                              className="h-8 w-full sm:w-auto"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                              className="h-8"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                      )}
                      <p className="text-sm text-gray-600">{category.productCount} products</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusToggle(category._id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium w-full sm:w-auto justify-center",
                        category.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      )}
                    >
                      {category.status}
                    </Button>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category._id)}
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent className="mx-4 md:mx-0">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDeletingId(null)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} className="w-full sm:w-auto">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cannot Delete Dialog */}
        <AlertDialog open={showCannotDelete} onOpenChange={() => setShowCannotDelete(false)}>
          <AlertDialogContent className="mx-4 md:mx-0">
            <AlertDialogHeader>
              <AlertDialogTitle>Cannot Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                This category contains {cannotDeleteProductCount} product(s). Please remove all products from the
                category before deleting it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowCannotDelete(false)} className="w-full sm:w-auto">
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Categories;