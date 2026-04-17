import { supabase } from "./supabase";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Types
export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone_number?: string;
  total_outstanding: number;
  created_at: string;
}

export interface CreateCustomerInput {
  business_id: string;
  name: string;
  phone_number?: string;
  total_outstanding?: number;
}

/**
 * Create a new customer in the database
 */
export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  try {
    const { data: customer, error } = await supabase
      .from("customers")
      .insert([
        {
          business_id: data.business_id,
          name: data.name,
          phone_number: data.phone_number || null,
          total_outstanding: data.total_outstanding || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return customer;
  } catch (error) {
    console.error("Customer creation error:", error);
    throw error;
  }
}

/**
 * Get all customers for a business
 */
export async function getCustomersByBusiness(businessId: string): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Fetch customers error:", error);
    throw error;
  }
}

/**
 * Get a single customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (error) {
      console.error("Error fetching customer:", error);
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Fetch customer error:", error);
    throw error;
  }
}

/**
 * Update customer details
 */
export async function updateCustomer(
  customerId: string,
  updates: Partial<CreateCustomerInput>
): Promise<Customer> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update(updates)
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Update customer error:", error);
    throw error;
  }
}

/**
 * Update customer's outstanding amount
 */
export async function updateCustomerOutstanding(
  customerId: string,
  amount: number
): Promise<Customer> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update({ total_outstanding: amount })
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating outstanding:", error);
      throw new Error(`Failed to update outstanding: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Update outstanding error:", error);
    throw error;
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (error) {
      console.error("Error deleting customer:", error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  } catch (error) {
    console.error("Delete customer error:", error);
    throw error;
  }
}

/**
 * Search customers by name or phone
 */
export async function searchCustomers(
  businessId: string,
  query: string
): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .or(`name.ilike.%${query}%,phone_number.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching customers:", error);
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Search customers error:", error);
    throw error;
  }
}
