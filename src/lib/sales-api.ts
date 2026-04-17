import { supabase } from "./supabase";

export interface Sale {
  id: string;
  business_id: string;
  total_amount: number;
  created_at: string;
  Vendor?: string;
  Date?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  price_at_sale: number;
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
}

// Create a new sale with items and reduce stock
export async function createSaleWithItems(
  businessId: string,
  items: Array<{ productId: string; quantity: number; priceAtSale: number }>,
  vendorName?: string,
  saleDate?: string
) {
  try {
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.priceAtSale, 0);

    // Create sale record
    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .insert({
        business_id: businessId,
        total_amount: totalAmount,
        Vendor: vendorName || null,
        Date: saleDate || new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saleError) {
      console.error("Error creating sale:", saleError);
      throw new Error("Failed to create sale");
    }

    const saleId = saleData.id;

    // Add each sale item and reduce product stock
    for (const item of items) {
      // Create sale item
      const { error: itemError } = await supabase.from("sale_items").insert({
        sale_id: saleId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_sale: item.priceAtSale,
      });

      if (itemError) {
        console.error("Error creating sale item:", itemError);
        throw new Error("Failed to create sale item");
      }

      // Get current stock
      const { data: productData, error: getProductError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();

      if (getProductError) {
        console.error("Error fetching product:", getProductError);
        throw new Error("Failed to fetch product stock");
      }

      const currentStock = productData.stock || 0;
      const newStock = Math.max(0, currentStock - item.quantity);

      // Update product stock
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.productId);

      if (updateError) {
        console.error("Error updating stock:", updateError);
        throw new Error("Failed to update product stock");
      }
    }

    return saleData;
  } catch (error) {
    console.error("Error in createSaleWithItems:", error);
    throw error;
  }
}

// Get all sales for a business
export async function getSalesByBusiness(businessId: string) {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getSalesByBusiness:", error);
    throw error;
  }
}

// Get sale items for a specific sale
export async function getSaleItems(saleId: string) {
  try {
    const { data, error } = await supabase
      .from("sale_items")
      .select("*")
      .eq("sale_id", saleId);

    if (error) {
      console.error("Error fetching sale items:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getSaleItems:", error);
    throw error;
  }
}

// Get sale with all its items
export async function getSaleWithItems(saleId: string): Promise<SaleWithItems | null> {
  try {
    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (saleError) {
      console.error("Error fetching sale:", saleError);
      throw saleError;
    }

    const items = await getSaleItems(saleId);

    return {
      ...saleData,
      items,
    };
  } catch (error) {
    console.error("Error in getSaleWithItems:", error);
    throw error;
  }
}
