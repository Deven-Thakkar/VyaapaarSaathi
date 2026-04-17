import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/context/ProfileContext";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Plus, Phone, Trash2, Edit2, AlertCircle } from "lucide-react";
import { getCustomersByBusiness, createCustomer, updateCustomer, deleteCustomer, Customer } from "@/lib/customer-api";

export default function CustomersPage() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  // Fetch customers on mount
  useEffect(() => {
    if (profile.businessId) {
      loadCustomers();
    }
  }, [profile.businessId]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      if (!profile.businessId) {
        console.error("No business ID found");
        return;
      }
      const data = await getCustomersByBusiness(profile.businessId);
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(t("customers.nameRequired") || "Customer name is required");
      return;
    }

    try {
      setIsAdding(true);
      if (!profile.businessId) {
        alert("No business found. Please sign up again.");
        return;
      }

      const newCustomer = await createCustomer({
        business_id: profile.businessId,
        name: formData.name,
        phone_number: formData.phone || undefined,
      });

      setCustomers((prev) => [newCustomer, ...prev]);
      setFormData({ name: "", phone: "" });
      alert(t("customers.added") || "Customer added successfully");
    } catch (error) {
      console.error("Failed to add customer:", error);
      alert(t("customers.addError") || "Failed to add customer");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!window.confirm(t("customers.deleteConfirm") || "Are you sure to delete this customer?")) {
      return;
    }

    try {
      await deleteCustomer(customerId);
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert(t("customers.deleteError") || "Failed to delete customer");
    }
  };

  return (
    <AppShell>
      <PageHeader title={t("customers.title") || "Customers"} />

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* Add Customer Form */}
        <div className="bg-card rounded-2xl p-4 mb-6 card-shadow-sm">
          <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            {t("customers.addNew") || "Add New Customer"}
          </h3>

          <form onSubmit={handleAddCustomer} className="space-y-3">
            <input
              type="text"
              placeholder={t("customers.namePh") || "Customer name"}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm"
            />

            <div className="flex gap-2 items-center bg-muted rounded-lg px-3 py-2 border border-border">
              <span className="text-sm text-muted-foreground">+91</span>
              <input
                type="tel"
                placeholder={t("customers.phonePh") || "Phone (optional)"}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            <button
              type="submit"
              disabled={isAdding || !formData.name.trim()}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isAdding ? t("common.saving") || "Saving..." : t("customers.add") || "Add Customer"}
            </button>
          </form>
        </div>

        {/* Customers List */}
        <div>
          <h3 className="font-semibold mb-4 text-foreground text-lg">
            {t("customers.list") || "Customers"} ({customers.length})
          </h3>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              <p className="mt-2">{t("common.loading") || "Loading..."}</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center card-shadow-sm">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t("customers.empty") || "No customers added yet"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-card rounded-xl p-4 card-shadow-sm border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{customer.name}</h4>
                      {customer.phone_number && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone_number}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {t("customers.outstanding") || "Outstanding"}: ₹{customer.total_outstanding?.toFixed(2) || "0.00"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title={t("common.delete") || "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
