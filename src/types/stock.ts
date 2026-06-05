export interface StockOverviewItem {
  id: string;
  model: string;
  minStock: number;
  totalStock: number;
  isLowStock: boolean;
  costPrice: number;
  salePrice: number;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  stockItems: { id: string; size: string; quantity: number }[];
}

export interface StockMovement {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  type: string;
  reason: string | null;
  createdAt: string;
  user: { id: string; name: string };
  product: {
    id: string;
    model: string;
    brand: string;
    category: string;
  };
}
