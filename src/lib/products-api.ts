import { supabase } from "./supabase";

// Types
export interface Product {
  id: string;
  business_id: string;
  name: string;
  price: number;
  stock: number;
  barcode?: string;
  created_at: string;
}

export interface CreateProductInput {
  business_id: string;
  name: string;
  price: number;
  stock?: number;
  barcode?: string;
}

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductInput): Promise<Product> {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .insert([
        {
          business_id: data.business_id,
          name: data.name,
          price: data.price,
          stock: data.stock || 0,
          barcode: data.barcode || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return product;
  } catch (error) {
    console.error("Product creation error:", error);
    throw error;
  }
}

/**
 * Get all products for a business
 */
export async function getProductsByBusiness(businessId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Fetch products error:", error);
    throw error;
  }
}

/**
 * Get a single product
 */
export async function getProductById(productId: string): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Fetch product error:", error);
    throw error;
  }
}

/**
 * Update product details
 */
export async function updateProduct(
  productId: string,
  updates: Partial<CreateProductInput>
): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
}

/**
 * Update product stock
 */
export async function updateProductStock(
  productId: string,
  quantity: number
): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({ stock: quantity })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Error updating stock:", error);
      throw new Error(`Failed to update stock: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Update stock error:", error);
    throw error;
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
}

/**
 * Search products by name or SKU
 */
export async function searchProducts(
  businessId: string,
  query: string
): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching products:", error);
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Search products error:", error);
    throw error;
  }
}

/**
 * Get low stock products (less than 10)
 */
export async function getLowStockProducts(businessId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId)
      .lte("stock", 10)
      .order("stock", { ascending: true });

    if (error) {
      console.error("Error fetching low stock products:", error);
      throw new Error(`Failed to fetch low stock products: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Fetch low stock products error:", error);
    throw error;
  }
}
