import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";

export interface Banner {
  id: string;
  salestext: string;
  title: string;
  description: string;
  imageUrl: string; // Stored path
  bannerImage?: File; // Upload field
  buttonText?: string;
  buttonLink?: string;
  active: boolean;
}

interface BannerUploadDialogProps {
  banner?: Banner;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave: (banner: Omit<Banner, "id">) => void;
  onDelete?: (id: string) => void;
}

const BannerUploadDialog: React.FC<BannerUploadDialogProps> = ({
  banner,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSave,
  onDelete,
}) => {
  const [open, setOpen] = useState(externalOpen || false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [salestext, setSalestext] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditing = !!banner;

  useEffect(() => {
    if (banner) {
      setSalestext(banner.salestext) ,
      setTitle(banner.title);
      setDescription(banner.description);
      setButtonText(banner.buttonText || "");
      setButtonLink(banner.buttonLink || "");
      setImagePreview(banner.imageUrl);
      setImageFile(null);
    } else {
      clearForm();
    }
  }, [banner]);

  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (externalOnOpenChange) {
      externalOnOpenChange(newOpen);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    console.log('Uploaded file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);

    const img = new Image();
    img.onload = () => {
      if (img.width !== 1920 || img.height !== 820) {
        toast.warning("For best results, banner should be 1920x820 pixels.");
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDelete = () => {
    if (banner && onDelete) {
      onDelete(banner.id);
      setDeleteDialogOpen(false);
      handleOpenChange(false);
      toast.success("Banner deleted successfully");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a banner title");
      return;
    }

    if (!isEditing && !imageFile) {
      toast.error("Please upload a banner image");
      return;
    }

    const bannerData: Omit<Banner, "id"> = {
        salestext,
        title,
        description,
        imageUrl: isEditing && !imageFile ? imagePreview || '' : '',
        bannerImage: imageFile || undefined,
        buttonText: buttonText || undefined,
        buttonLink: buttonLink || undefined,
        active: banner?.active || true,
       
    };

    console.log('Submitting banner data:', bannerData); // Debug log

    onSave(bannerData);

    if (!externalOpen) {
      clearForm();
      setOpen(false);
    }

    toast.success(isEditing ? "Banner updated successfully" : "Banner saved successfully");
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setButtonText("");
    setButtonLink("");
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {!externalOpen && (
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Add New Banner
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Banner" : "Upload Banner Image"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your banner information. Recommended image size: 1920x820 pixels."
                : "Upload a banner image for your website slider. Recommended size: 1920x820 pixels."
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">

            <div className="space-y-2">
                <Label htmlFor="salestext">Discount Title*</Label>
                <Input
                  id="salestext"
                  value={salestext}
                  onChange={(e) => setSalestext(e.target.value)}
                  placeholder="Enter discount title"
                  required
                />
            </div>

              <div className="space-y-2">
                <Label htmlFor="title">Banner Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter banner description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="/products"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Banner Image *</Label>
                {imagePreview ? (
                  <div className="relative mt-2">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-auto rounded-md object-cover aspect-[1920/820]"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                    onClick={() => document.getElementById("banner-image")?.click()}
                  >
                    <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">
                      Click to upload banner image
                    </p>
                    <p className="text-xs text-gray-400">
                      Recommended size: 1920x820 pixels
                    </p>
                    <input
                      id="banner-image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto mr-auto"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Banner
                </Button>
              )}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                  onClick={() => {
                    if (!externalOpen) {
                      clearForm();
                    }
                    handleOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 sm:flex-initial"
                >
                  {isEditing ? "Update Banner" : "Save Banner"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banner
              "{banner?.title}" from your website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BannerUploadDialog;