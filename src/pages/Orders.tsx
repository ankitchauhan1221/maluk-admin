import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Download,
  Upload,
  Filter,
  RefreshCw,
  Search,
  CheckSquare,
  XSquare,
  Clock,
  TruckIcon,
  Printer,
  Package,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { baseurl } from "../common/config";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Failed" | "Return to Origin" | "Returned" | "Cancelled";
type PaymentMethod = "cod" | "paid";

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
  paymentMethod: PaymentMethod;
  reference_number: string;
}

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = "18a0e6b287a6f623a4a3b5988f031a"; // Your provided API key

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in.");

      const response = await fetch(`${baseurl}/api/orders/all-orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch orders");

      console.log("Fetched Orders (Raw Data):", data);
      setOrders(data);
      toast.success("Orders fetched successfully!");
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
      toast.success("Orders refreshed!");
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Pending": return <Clock className="w-4 h-4" />;
      case "Processing": return <RefreshCw className="w-4 h-4" />;
      case "Shipped": return <TruckIcon className="w-4 h-4" />;
      case "Out for Delivery": return <Package className="w-4 h-4" />;
      case "Delivered": return <CheckSquare className="w-4 h-4" />;
      case "Failed":
      case "Cancelled": return <XSquare className="w-4 h-4" />;
      case "Return to Origin":
      case "Returned": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Processing": return "bg-blue-100 text-blue-700";
      case "Shipped": return "bg-purple-100 text-purple-700";
      case "Out for Delivery": return "bg-orange-100 text-orange-700";
      case "Delivered": return "bg-green-100 text-green-700";
      case "Failed": return "bg-red-100 text-red-700";
      case "Return to Origin": return "bg-teal-100 text-teal-700";
      case "Returned": return "bg-gray-100 text-gray-700";
      case "Cancelled": return "bg-pink-100 text-pink-700";
      default: return "bg-cyan-100 text-cyan-700";
    }
  };

  const getPaymentColor = (method: PaymentMethod | undefined) => {
    switch (method) {
      case "cod": return "bg-orange-100 text-orange-700";
      case "paid": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handlePrintLabel = async (order: Order) => {
    const normalizedStatus = order.status.trim().toLowerCase();
    console.log("Printing label for order:", { id: order.id, status: normalizedStatus });
  
    if (normalizedStatus !== "processing") {
      toast.error("Shipping label can only be printed for orders in Processing status");
      return;
    }
  
    if (!order.reference_number) {
      toast.error("No reference number available for this order");
      return;
    }
  
    try {
      const apiUrl = `https://dtdcapi.shipsy.io/api/customer/integration/consignment/shippinglabel/stream?reference_number=<awb_no>&label_code=SHIP_LABEL_4X6&label_format=pdf`;
      console.log("Requesting URL:", apiUrl);
      console.log("Request Headers:", {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      });
  
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "api-key": API_KEY,
          "Content-Type": "application/json",
        },
      });
  
      console.log("Response Status:", response.status);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("Error Data:", errorData);
        if (response.status === 401) {
          toast.error("API key invalid or unauthorized. Please check credentials.");
          return;
        }
        throw new Error(errorData.message || "Failed to fetch shipping label");
      }
  
      const contentType = response.headers.get("Content-Type");
      console.log("Content-Type:", contentType);
  
      // Check if the response is a PDF by examining the first few bytes
      const blob = await response.blob();
      console.log("Blob Size:", blob.size, "Blob Type:", blob.type);
      const textPreview = await blob.slice(0, 8).text(); // Get first 8 bytes
      console.log("Response Preview:", textPreview);
  
      if (!textPreview.startsWith("%PDF-")) {
        const fullText = await blob.text();
        console.log("Full Unexpected Response:", fullText);
        throw new Error("Received invalid file format. Expected a PDF.");
      }
  
      if (blob.size === 0) {
        throw new Error("Received an empty file from server.");
      }
  
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `shipping_label_${order.reference_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      toast.success(`Shipping label for order ${order.id} generated successfully!`);
    } catch (error) {
      console.error("Print Label Error:", error);
      toast.error(
        error instanceof Error
          ? `Failed to generate label: ${error.message}`
          : "Failed to generate shipping label"
      );
    }
  };

  const handleImport = () => {
    toast.info("Import feature not implemented yet.");
  };

  const handleExport = () => {
    toast.info("Export feature not implemented yet.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="mt-2 text-gray-600">Manage and track your orders</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleImport} variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Import
            </Button>
            <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed</option>
                <option value="Return to Origin">Return to Origin</option>
                <option value="Returned">Returned</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading orders...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Print Label</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.items} items</TableCell>
                        <TableCell>₹{order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
                                getStatusColor(order.status)
                              )}
                            >
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-sm font-medium",
                              getPaymentColor(order.paymentMethod)
                            )}
                          >
                            {order.paymentMethod === "cod" ? "COD" : "PAID"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintLabel(order)}
                            title={
                              order.status.trim().toLowerCase() !== "processing"
                                ? "Available only for Processing orders"
                                : "Print Shipping Label"
                            }
                            disabled={order.status.trim().toLowerCase() !== "processing"}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Orders;