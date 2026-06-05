export interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockItem {
  id: string;
  size: string;
  quantity: number;
}

export interface Product {
  id: string;
  brandId: string;
  categoryId: string;
  model: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  totalStock: number;
  isLowStock: boolean;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  stockItems: StockItem[];
  createdAt: string;
  updatedAt: string;
}
