import { baseurl } from "@/common/config";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true" && !!localStorage.getItem("token");

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${baseurl}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      toast.success("Session expired. You have been logged out.");
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const response = await originalFetch(url, options);
      const bypassLogout = options.headers?.["X-Bypass-Logout"] === "true";
      if (response.status === 401 && !bypassLogout) {
        console.log("401 detected, logging out for URL:", url);
        handleLogout();
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};