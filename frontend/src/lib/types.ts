export interface Product {
  id: string;
  brand: string;
  name: string;
  sku: string;
  category: "jeans" | "shirts";
  sizes: string[];
  colors: string[];
  fabric: string;
  price: number;
  moq: number;
  stock: number;
  images: string[];
  description: string;
  availability_status: string;
  featured: boolean;
  created_at: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export type OrderStatus = "Pending" | "Confirmed" | "Processing" | "Ready for Dispatch" | "Dispatched" | "Delivered" | "Cancelled";

export interface OrderItem {
  product_id: string;
  brand: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  business_name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number?: string | null;
  notes?: string | null;
  items: OrderItem[];
  total_estimate: number;
  status: OrderStatus;
  created_at: string;
}

export interface AdminUser {
  username: string;
  name?: string;
}
