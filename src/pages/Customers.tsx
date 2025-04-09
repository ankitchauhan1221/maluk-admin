import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, MapPin, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { baseurl, routes } from "@/common/config";
import { CustomerSkeleton } from "@/components/skeletons/CustomerSkeleton";

interface Address {
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  type: "Shipping" | "Billing";
  isDefault?: boolean;
}

interface Customer {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  address: Address; 
  status: "active" | "inactive";
  orders: number;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${baseurl}/api/profile/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const users = await response.json();
      const customersOnly = users.filter((user: any) => user.role !== "admin");

      const customersWithAddress = customersOnly.map((user: any) => {
        // Find the shipping address or default address, fallback to first address or unknown
        const shippingAddress =
          user.addresses.find((addr: Address) => addr.type === "Shipping" && addr.isDefault) ||
          user.addresses.find((addr: Address) => addr.type === "Shipping") ||
          user.addresses.find((addr: Address) => addr.isDefault) ||
          user.addresses[0] || {
            country: "Unknown",
            streetAddress: "Unknown",
            city: "Unknown",
            state: "Unknown",
            type: "Shipping",
          };

        return {
          _id: user._id,
          name: user.name || "Unnamed",
          lastname: user.lastname || "Unnamed",
          email: user.email,
          phone: user.phone || "Not provided",
          address: shippingAddress,
          status: user.status || "inactive",
          orders: user.orders || 0, // Assuming orders is a field; adjust if from Order model
        };
      });

      setCustomers(customersWithAddress);
    } catch (error) {
      toast.error(`Error fetching customers: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCustomerStatus = async (customerId: string) => {
    setIsLoading(true);
    try {
      const customer = customers.find((c) => c._id === customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      const newStatus = customer.status === "active" ? "inactive" : "active";

      // Optimistic update
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === customerId ? { ...customer, status: newStatus } : customer
        )
      );

      const response = await fetch(`${baseurl}${routes.toggleCustomerStatus(customer._id)}`, {
        method: "PUT",
        body: JSON.stringify({ userId: customerId, status: newStatus }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update customer status");
      }

      const updatedCustomer = await response.json();
      console.log("API response:", updatedCustomer);

      toast.success("Customer status updated!");
    } catch (error) {
      console.error("Error updating customer status:", error);
      toast.error(`Error updating customer status: ${error.message}`);

      // Revert on failure
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === customerId
            ? { ...customer, status: customer.status === "active" ? "inactive" : "active" }
            : customer
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="mt-2 text-gray-600">Manage your customer base</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchCustomers}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <CustomerSkeleton key={index} />)
          ) : customers.length === 0 ? (
            <div className="text-center text-gray-600">No customers found</div>
          ) : (
            customers.map((customer) => (
              <div key={customer._id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{customer.name} {customer.lastname}</h3>
                      <div className="grid gap-2 mt-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <div>
                            {customer.address.country}, {customer.address.streetAddress}, {customer.address.city},{" "}
                            {customer.address.state}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-4">
                    <div className="flex items-center gap-3 mb-2 justify-end">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Switch
                        checked={customer.status === "active"}
                        onCheckedChange={() => toggleCustomerStatus(customer._id)}
                        disabled={isLoading}
                      />
                    </div>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        customer.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}
                    >
                      {customer.status}
                    </span>
                    {/* <p className="mt-2 text-sm text-gray-600">{customer.orders} orders</p> */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Customers;