export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  total_private_repos?: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
  stargazers_count: number;
  language: string | null;
  open_issues_count: number;
  size: number;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

export interface Product {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  category: string;
  stock: number;
  sku: string;
  image: string;
  status: 'active' | 'draft' | 'archived';
  rating: number;
  reviewsCount: number;
  featured?: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'vodafone_cash' | 'instapay' | 'card';
  paymentStatus: 'paid' | 'unpaid';
  createdAt: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'active' | 'vip' | 'inactive';
}

export interface StoreSettings {
  storeName: string;
  storeNameEn: string;
  tagline: string;
  currency: 'EGP' | 'SAR' | 'AED' | 'USD';
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  shippingFee: number;
  freeShippingAbove: number;
  targetGithubRepo: string;
}
