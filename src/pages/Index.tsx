import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatsCard } from "@/components/StatsCard";
import {  IndianRupee, ShoppingBag, Users, TrendingUp, Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { baseurl } from "@/common/config";

interface Order {
  createdAt: string | number | Date;
  id: string;
  customer: string;
  items: number;
  total: number;
  timestamp: Date;
}

const Index = () => {
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);


  const fetchRecentOrders = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${baseurl}/api/orders/all-orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch orders: ${response.status} - ${errorText}`);
      }

      const orders = await response.json();

      if (!Array.isArray(orders)) {
        throw new Error("Expected an array of orders, got: " + JSON.stringify(orders));
      }

      const formattedOrders: Order[] = orders.map((order: any) => ({
        id: order.id,
        customer: order.customer,
        items: order.items,
        total: order.total,
        timestamp: new Date(order.date),
      }));

      setNewOrders(formattedOrders);
      setTotalOrders(orders.length); // Update total order count
      setShowNotification(formattedOrders.length > 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setFetchError(error.message);
      setNewOrders([]);
      setTotalOrders(0);
      setShowNotification(false);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchRecentOrders();

    const interval = setInterval(() => {
      fetchRecentOrders();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const clearNotifications = () => {
    setNewOrders([]);
    setShowNotification(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Bar */}
      <div
        className={cn(
          "fixed top-0 left-64 right-0 bg-primary text-white p-4 transform transition-transform duration-300 z-50",
          showNotification ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span className="font-medium">
              {newOrders.length} New Order{newOrders.length !== 1 ? "s" : ""}
            </span>
            {newOrders.length > 0 && (() => {
              // Sort orders in descending order by timestamp
              const sortedOrders = [...newOrders].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              return (
                <span className="text-sm">
                  Latest: {sortedOrders[0].id} - ₹{sortedOrders[0].total}
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = "/orders")}
            >
              View Orders
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="text-white hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>

      <DashboardSidebar />
      <main
        className={cn(
          "ml-64 p-8 animate-fade-in",
          showNotification && "mt-16"
        )}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back to your store overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value="₹45,231.89"
            icon={< IndianRupee className="w-6 h-6 text-primary" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Orders"
            value={isLoading ? "Loading..." : totalOrders.toString()} // Display dynamic value
            icon={<ShoppingBag className="w-6 h-6 text-primary" />}
            trend={{ value: 8, isPositive: true }}
          />

          <StatsCard
            title="Total Customers"
            value="3,456"
            icon={<Users className="w-6 h-6 text-primary" />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Conversion Rate"
            value="2.4%"
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            trend={{ value: 1.1, isPositive: false }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            {isLoading ? (
              <div className="text-center text-gray-600">Loading orders...</div>
            ) : fetchError ? (
              <div className="text-center text-red-600">
                {fetchError}
                <Button variant="link" onClick={fetchRecentOrders} className="mt-2">
                  Retry
                </Button>
              </div>
            ) : newOrders.length === 0 ? (
              <div className="text-center text-gray-600">No recent orders</div>
            ) : (
              <div className="space-y-4">
                {[...newOrders]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by latest
                  .slice(0, 3) // Show the top 3 latest orders
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {order.items} items • ₹{order.total}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                        New
                      </span>
                    </div>
                  ))}
              </div>

            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((product) => (
                <div
                  key={product}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <p className="font-medium">Product {product}</p>
                    <p className="text-sm text-gray-600">234 sales</p>
                  </div>
                  <p className="font-medium">$1,234</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;