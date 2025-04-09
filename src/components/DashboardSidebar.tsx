import { Home, ShoppingBag, BarChart2, Users, Settings, FolderTree, Tag, Percent, ShoppingCart, Image, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: ShoppingCart, label: "Orders", href: "/orders" },
  { icon: ShoppingBag, label: "Products", href: "/products" },
  { icon: FolderTree, label: "Categories", href: "/categories" },
  // { icon: Tag, label: "Subcategories", href: "/subcategories" },
  { icon: Image, label: "Banners", href: "/banners" },
  { icon: Percent, label: "Coupons", href: "/coupons" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  // Check if screen is mobile on initial render and when resized
  useEffect(() => {
    const checkScreenSize = () => {
      setCollapsed(window.innerWidth < 1024);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  
  // Handle closing sidebar when navigating on mobile
  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Mobile menu button - visible only on small screens */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 p-2 rounded-lg bg-white shadow-md z-20 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {/* Sidebar */}
      <div
        className={cn(
          "h-screen fixed left-0 top-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          // Desktop states
          "hidden md:block",
          collapsed ? "md:w-20" : "md:w-64",
          // Mobile states
          mobileOpen ? "block w-64" : "hidden"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={cn("font-bold text-xl", collapsed && "hidden")}>Admin</h1>
          
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden md:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed ? "M13 19l9-7 -9-7v14z" : "M11 19l-9-7 9-7v14z"}
              />
            </svg>
          </button>
        </div>
        
        <nav className="p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary transition-colors",
                    location.pathname === item.href && "bg-secondary"
                  )}
                  onClick={handleNavigation}
                >
                  <item.icon className="w-6 h-6 text-gray-500" />
                  {(!collapsed || mobileOpen) && (
                    <span className="font-medium text-gray-700">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Content offset for desktop */}
      <div className={cn(
        "transition-all duration-300 ease-in-out", 
        "hidden md:block",
        collapsed ? "md:ml-20" : "md:ml-64"
      )} />
    </>
  );
}