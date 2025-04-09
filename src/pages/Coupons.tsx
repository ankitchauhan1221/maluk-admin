// Coupons.tsx
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Percent, Edit, Trash2, X } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { baseurl, routes } from "@/common/config";
import CouponSkeleton from "@/components/skeletons/CouponSkeleton";

interface Coupon {
  _id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  status: "active" | "inactive" | "expired";
}


const emptyCoupon = {
  code: "",
  discountType: "percentage" as const,
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  startDate: "",
  endDate: "",
  usageLimit: 0,
};

const CouponForm = ({
  coupon,
  onSubmit,
  onCancel,
  title,
  description,
  submitText,
}: {
  coupon: Partial<Coupon>;
  onSubmit: (coupon: Partial<Coupon>) => void;
  onCancel: () => void;
  title: string;
  description: string;
  submitText: string;
}) => {
  const [formData, setFormData] = useState(coupon);

  const handleSubmit = () => {
    if (!formData.code?.trim() || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      toast.error("Percentage discount cannot be greater than 100%");
      return;
    }

    if (formData.minOrderAmount < 0) {
      toast.error("Minimum order amount cannot be negative");
      return;
    }

    if (formData.maxDiscountAmount < 0) {
      toast.error("Maximum discount amount cannot be negative");
      return;
    }

    if (formData.usageLimit < 0) {
      toast.error("Usage limit cannot be negative");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. WELCOME10"
          />
        </div>

        <div className="space-y-2">
          <Label>Discount Type *</Label>
          <RadioGroup
            value={formData.discountType}
            onValueChange={(value: "percentage" | "fixed") =>
              setFormData({ ...formData, discountType: value })
            }
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage">Percentage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed">Fixed Amount</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountValue">
            {formData.discountType === "percentage" ? "Discount Percentage *" : "Discount Amount *"}
          </Label>
          <Input
            id="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
            placeholder={formData.discountType === "percentage" ? "e.g. 10" : "e.g. 50"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minOrderAmount">Minimum Order Amount *</Label>
          <Input
            id="minOrderAmount"
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
            placeholder="e.g. 100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxDiscountAmount">Maximum Discount Amount *</Label>
          <Input
            id="maxDiscountAmount"
            type="number"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) })}
            placeholder="e.g. 50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage Limit *</Label>
          <Input
            id="usageLimit"
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
            placeholder="e.g. 100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4">
        <Button className="w-full sm:w-auto" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="w-full sm:w-auto" onClick={handleSubmit}>
          {submitText}
        </Button>
      </div>
    </div>
  );
};

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state


  useEffect(() => {
    fetchCoupons();
  }, []);


  // fecth all coupons
  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseurl}${routes.BASE}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch coupons');
      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to fetch coupons'); 
    }
      finally {
        setIsLoading(false);
    }
  };

  // status update (Active/Inactive) //
  const handleStatusToggle = async (_id: string, currentStatus: "active" | "inactive" | "expired") => {
    try {
      if (currentStatus === "expired") {
        toast.error("Cannot change the status of an expired coupon");
        return;
      }

      const token = localStorage.getItem("token");

      // Toggle logic: "active" → "inactive", "inactive" → "active"
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const response = await fetch(`${baseurl}${routes.TOGGLE_STATUS.replace(":id", _id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to toggle status");

      await fetchCoupons();
      toast.success("Coupon status updated successfully");
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };




  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsEditOpen(true);
  };

  // coupon edit //
  const handleSaveEdit = async (updatedData: Partial<Coupon>) => {
    if (editingCoupon) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${baseurl}${routes.UPDATE.replace(':id', editingCoupon._id.toString())}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Failed to update coupon');
        await fetchCoupons();
        setIsEditOpen(false);
        setEditingCoupon(null);
        toast.success("Coupon updated successfully");
      } catch (error) {
        toast.error('Failed to update coupon');
      }
    }
  };


  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  // delete coupon //
  const confirmDelete = async () => {
    if (deletingId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${baseurl}${routes.DELETE.replace(':id', deletingId.toString())}`, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to delete coupon');
        await fetchCoupons();
        setDeletingId(null);
        toast.success("Coupon deleted successfully");
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  // add new coupons //
  const handleAddCoupon = async (newCouponData: Partial<Coupon>) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseurl}${routes.CREATE}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCouponData),
      });
      if (!response.ok) throw new Error('Failed to create coupon');
      await fetchCoupons();
      setIsAddOpen(false);
      toast.success("Coupon added successfully");
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      {isLoading ? (
        <CouponSkeleton />
      ) : (
      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Coupons</h1>
            <p className="mt-2 text-gray-600">Manage your discount coupons</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] mx-4 md:mx-0">
              <DialogHeader>
                <DialogTitle>Add New Coupon</DialogTitle>
                <DialogDescription>Create a new discount coupon</DialogDescription>
              </DialogHeader>
              <CouponForm
                coupon={emptyCoupon}
                onSubmit={handleAddCoupon}
                onCancel={() => setIsAddOpen(false)}
                title="Add New Coupon"
                description="Create a new discount coupon"
                submitText="Add Coupon"
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                    <Percent className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{coupon.code}</h3>
                    <p className="text-sm text-gray-600">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% off`
                        : `$${coupon.discountValue} off`}
                      {coupon.minOrderAmount > 0 && ` • Min. order: $${coupon.minOrderAmount}`}
                      {coupon.maxDiscountAmount > 0 && ` • Max. discount: $${coupon.maxDiscountAmount}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Valid from {new Date(coupon.startDate).toLocaleDateString()} to {new Date(coupon.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-right w-full sm:w-auto">
                    <p className="text-sm text-gray-600">
                      Used {coupon.usageCount} / {coupon.usageLimit} times
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusToggle(coupon._id, coupon.status)}
                      disabled={coupon.status === "expired"} // Disable button if status is expired
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium w-full sm:w-auto justify-center mt-2",
                        coupon.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : coupon.status === "inactive"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-gray-100 text-gray-700 cursor-not-allowed" 
                      )}
                    >
                      {coupon.status}
                    </Button>

                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coupon._id)}
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

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[600px] mx-4 md:mx-0">
            <DialogHeader>
              <DialogTitle>Edit Coupon</DialogTitle>
              <DialogDescription>Modify existing coupon details</DialogDescription>
            </DialogHeader>
            {editingCoupon && (
              <CouponForm
                coupon={editingCoupon}
                onSubmit={handleSaveEdit}
                onCancel={() => {
                  setIsEditOpen(false);
                  setEditingCoupon(null);
                }}
                title="Edit Coupon"
                description="Modify existing coupon details"
                submitText="Save Changes"
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent className="mx-4 md:mx-0">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the coupon.
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
      </main>
      )}
    </div>
  );
};

export default Coupons;