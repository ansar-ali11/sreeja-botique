export type ProductType = "BUY_ONLINE" | "ENQUIRY_ONLY";

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  variants: ProductVariant[];
  fabric?: string;
  careInstructions?: string;
  productType: ProductType;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  active: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  order: number;
  active: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: "COD" | "RAZORPAY";
  razorpayOrderId?: string;
  statusHistory?: { status: OrderStatus; at: number }[];
  customerEmail?: string;
  orderStatus: OrderStatus;
  shippingAddress: Address;
  createdAt: number;
  updatedAt: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrder?: number;
  active: boolean;
  expiresAt?: number;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagramUrl: string;
  announcement: string;
  currency: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  lowStockThreshold: number;
  taxPercent: number;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Sreeja's Bridal Boutique",
  phone: "+91 72859 19381",
  whatsapp: "917285919381",
  email: "sreejasdb@gmail.com",
  address: "Kakinada, Andhra Pradesh, India",
  instagramUrl: "",
  announcement: "Online Services Available • Shop Our Latest Collection",
  currency: "INR",
  freeShippingThreshold: 1999,
  defaultShippingFee: 99,
  lowStockThreshold: 3,
  taxPercent: 0,
};

export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}
