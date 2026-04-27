export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  sale_price: number;
  total_profit: number;
  timestamp: string;
}

export interface Insight {
  product_id: string;
  forecast_profit: number;
  predicted_low_stock_date: string;
  recommended_reorder_qty: number;
  weekly_trend: number[];
}

export interface User {
  name: string;
  email: string;
  business_name?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  access_level: string;
  status: string;
  last_active: string;
  joined_at: string;
}

export interface AppSettings {
  owner_name: string;
  business_name: string;
  business_email: string;
  phone: string;
  address: string;
  city: string;
  currency: string;
  timezone: string;
  date_format: string;
  low_stock_threshold: number;
  default_report: string;
  notifications: {
    low_stock_alerts: boolean;
    daily_summary: boolean;
    weekly_report: boolean;
    sales_alerts: boolean;
    team_updates: boolean;
  };
}

export interface InvoiceItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  receipt_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  status: string;
  payment_method: string;
  issued_at: string;
}

export interface ReturnRecord {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  refund_amount: number;
  refund_method: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface IntegrationRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  description: string;
  account_label: string;
  account_value: string;
  api_key: string;
  webhook_url: string;
  last_sync_at: string;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
}
