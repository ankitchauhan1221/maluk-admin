
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Categories from "./pages/Categories";
import Subcategories from "./pages/Subcategories";
import Coupons from "./pages/Coupons";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Banners from "./pages/Banners";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/products" element={<AuthGuard><Products /></AuthGuard>} />
          <Route path="/customers" element={<AuthGuard><Customers /></AuthGuard>} />
          <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
          <Route path="/categories" element={<AuthGuard><Categories /></AuthGuard>} />
          <Route path="/subcategories" element={<AuthGuard><Subcategories /></AuthGuard>} />
          <Route path= "/banners" element={<AuthGuard><Banners /></AuthGuard> } />
          <Route path="/coupons" element={<AuthGuard><Coupons /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard><Orders /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
