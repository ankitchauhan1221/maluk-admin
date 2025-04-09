
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { baseurl, routes } from "../common/config"; // Import API routes

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator",
  });

  const navigate = useNavigate();

  // const handleLogout = () => {
  //   localStorage.removeItem("isAuthenticated");
  //   toast.success("Logged out successfully");
  //   navigate("/login");
  // };
  const handleLogout = async () => {
    const token = localStorage.getItem("token"); // Check if token exists
    console.log("Token being sent:", token); // Debugging
  
    if (!token) {
      toast.error("No token found. Please log in.");
      return;
    }
  
    try {
      const response = await fetch(`${baseurl}${routes.logout}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Make sure it's formatted correctly
        },
      });
  
      const data = await response.json();
      console.log("Logout response:", data); // Debugging
  
      if (!response.ok) {
        throw new Error(data.error || "Logout failed");
      }
  
      // Clear localStorage and redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message);
    }
  };
  
  
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="md:ml-64 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account settings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={profile.role} disabled />
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button type="submit">Save Changes</Button>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
