import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import BannerUploadDialog, { Banner } from "@/components/banners/BannersUploadDilog"; // Fixed typo
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Edit, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { baseurl, routes } from "@/common/config";

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseurl}${routes.BANNER_GET}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch banners');
      }
      const data = await response.json();
      console.log('Fetched banners:', data);
      setBanners(data.map((banner: { _id: any; id: any }) => ({
        ...banner,
        id: banner._id || banner.id, // Ensure id is set
      })));
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error(error.message || 'Network error: Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBanner = async (banner: Omit<Banner, "id">) => {
    setIsOperationLoading(true);
    try {
      if (!banner.title.trim()) throw new Error('Banner title is required');
      if (!banner.bannerImage) throw new Error('Banner image is required');

      const formData = new FormData();
      formData.append('salestext', banner.salestext);
      formData.append('title', banner.title);
      formData.append('description', banner.description || '');
      formData.append('buttonText', banner.buttonText || '');
      formData.append('buttonLink', banner.buttonLink || '');
      formData.append('active', String(banner.active));
      if (banner.bannerImage instanceof File) {
        formData.append('bannerImage', banner.bannerImage);
      }

      console.log("Saving FormData:", Object.fromEntries(formData));

      const response = await fetch(`${baseurl}${routes.BANNER_ADD}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add banner');
      }

      const newBanner = await response.json();
      console.log('New banner added:', newBanner);
      setBanners(prevBanners => [...prevBanners, { ...newBanner, id: newBanner._id || newBanner.id }]);
      toast.success("Banner added successfully");
    } catch (error) {
      console.error('Error adding banner:', error);
      toast.error(error.message || 'Network error: Failed to add banner');
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleUpdateBanner = async (updatedBanner: Banner) => {
    setIsOperationLoading(true);
    try {
      if (!updatedBanner.id) throw new Error('Banner ID is undefined');
      if (!updatedBanner.title.trim()) throw new Error('Banner title is required');

      const formData = new FormData();
      formData.append('salestext', updatedBanner.salestext);
      formData.append('title', updatedBanner.title);
      formData.append('description', updatedBanner.description || '');
      formData.append('buttonText', updatedBanner.buttonText || '');
      formData.append('buttonLink', updatedBanner.buttonLink || '');
      formData.append('active', String(updatedBanner.active));
      if (updatedBanner.bannerImage instanceof File) {
        formData.append('bannerImage', updatedBanner.bannerImage);
      }

      const response = await fetch(`${baseurl}${routes.BANNER_EDIT.replace(':id', updatedBanner.id)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update banner');
      }

      const updated = await response.json();

      setBanners(prevBanners =>
        prevBanners.map(b => (b.id === updatedBanner.id ? { ...b, ...updated, id: updated._id || updated.id } : b))
      );

      setEditingBanner(null);
      toast.success("Banner updated successfully");
    } catch (error) {
      toast.error(error.message || 'Network error: Failed to update banner');
    } finally {
      setIsOperationLoading(false);
    }
  };


  const handleToggleActive = async (id: string) => {
    setIsOperationLoading(true);
    try {
      console.log('Toggling status for banner ID:', id);
      if (!id) throw new Error('Banner ID is undefined');

      const response = await fetch(`${baseurl}${routes.BANNER_TOGGLE.replace(':id', id)}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle banner status');
      }
      const updated = await response.json();
      console.log('Toggled banner from API:', updated);
      setBanners(prevBanners =>
        prevBanners.map(b => (b.id === id ? { ...updated, id: updated._id || updated.id } : b))
      );
      toast.success("Banner status updated");
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error(error.message || 'Network error: Failed to toggle banner status');
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleDeleteBanner = (id: string) => {
    console.log('Deleting banner with ID:', id);
    if (!id || id === 'undefined') {
      console.error('Invalid banner ID:', id);
      toast.error('Cannot delete banner: ID is missing');
      return;
    }

    toast("Are you sure you want to delete this banner?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setIsOperationLoading(true);
          try {
            const response = await fetch(`${baseurl}${routes.BANNER_REMOVE.replace(':id', id)}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to delete banner');
            }
            setBanners(prevBanners => prevBanners.filter(banner => banner.id !== id));
            toast.success("Banner deleted successfully");
          } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error(error.message || 'Network error: Failed to delete banner');
          } finally {
            setIsOperationLoading(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => { },
      },
      duration: 5000,
    });
  };

  const handlePreviewBanner = (banner: Banner) => {
    console.log('Previewing banner:', banner); // Debug log
    setPreviewBanner(banner);
  };

  const handleEditBanner = (banner: Banner) => {
    console.log('Editing banner:', banner);
    setEditingBanner(banner);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
            <p className="mt-2 text-gray-600">
              Manage banner slides for your website (recommended size: 1920x820)
            </p>
          </div>
          <BannerUploadDialog onSave={handleSaveBanner} disabled={isOperationLoading} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Current Banners ({banners.filter(b => b.active).length} active)
            </h2>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading banners...</div>
            ) : banners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No banners added yet. Click "Add New Banner" to create one.
              </div>
            ) : (
              <div className="space-y-6">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex flex-col md:flex-row gap-6 p-4 border rounded-lg"
                  >
                    <div className="w-full md:w-1/4">
                      <div className="aspect-[1920/820] rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={banner.imageUrl}
                          alt={banner.salestext}
                          className="w-full h-full object-cover"
                          onError={(e) => console.error('Image load error:', e)} // Debug image load issues
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{banner.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {banner.active ? "Active" : "Inactive"}
                          </span>
                          <Switch
                            checked={banner.active}
                            onCheckedChange={() => handleToggleActive(banner.id)}
                            disabled={isOperationLoading}
                          />
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {banner.title}
                      </p>

                      {(banner.buttonText || banner.buttonLink) && (
                        <div className="flex flex-wrap gap-4 mb-4">
                          {banner.buttonText && (
                            <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                              Button: {banner.buttonText}
                            </div>
                          )}
                          {banner.buttonLink && (
                            <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                              Link: {banner.buttonLink}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewBanner(banner)}
                          disabled={isOperationLoading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBanner(banner)}
                          disabled={isOperationLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBanner(banner.id)}
                          disabled={isOperationLoading}
                        >
                          {isOperationLoading ? 'Deleting...' : <Trash2 className="h-4 w-4 mr-1" />}
                          {isOperationLoading ? '' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={!!previewBanner} onOpenChange={(open) => !open && setPreviewBanner(null)}>
        <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Banner Preview</DialogTitle>
          </DialogHeader>

          {previewBanner && (
            <div className="relative">
              <div className="slider-item w-full aspect-[1920/820] relative overflow-hidden">
                <div className="container w-full h-full flex items-center px-6">
                  <div className="text-content sm:w-1/2 w-2/3">
                    <div className="text-sm md:text-base font-semibold text-white bg-primary/80 inline-block px-3 py-1 rounded-md">
                      {previewBanner.salestext}
                    </div>
                    <div className="text-2xl md:text-4xl font-bold text-white md:mt-5 mt-2">
                      {previewBanner.title}
                    </div>
                    {previewBanner.description && (
                      <div className="text-sm md:text-base text-white mt-4">
                        {previewBanner.description}
                      </div>
                    )}
                    {previewBanner.buttonText && (
                      <Button className="md:mt-8 mt-3 bg-primary hover:bg-primary/90">
                        {previewBanner.buttonText}
                      </Button>
                    )}
                  </div>
                  <div className="sub-img absolute left-0 top-0 w-full h-full z-[-1]">
                    <img
                      src={previewBanner.imageUrl}
                      alt={previewBanner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => console.error('Preview image load error:', e)} // Debug image load issues
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-100">
                <p className="text-sm text-gray-500">
                  This is how the banner will appear on your website. Currently shown at a smaller scale.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {editingBanner && (
        <BannerUploadDialog
          banner={editingBanner}
          open={!!editingBanner}
          onOpenChange={(open) => !open && setEditingBanner(null)}
          onSave={(updatedBannerData) => {
            handleUpdateBanner({
              ...updatedBannerData,
              id: editingBanner.id,
            });
          }}
          disabled={isOperationLoading}
        />
      )}
    </div>
  );
};

export default Banners;