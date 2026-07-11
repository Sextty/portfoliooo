export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  address?: string;
  city?: string;
  postal?: string;
  country: string;
  phone?: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  rating: number;
  reviews: number;
  tag?: string;
  image_url: string;
  hover_image_url: string;
  category_slug?: string;
  category_name?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  user_id?: number;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal: string;
  country: string;
  phone?: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}
