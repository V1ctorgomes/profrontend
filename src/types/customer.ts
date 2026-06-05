export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
  birthDate: string | null;
  notes: string | null;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends Omit<Customer, 'salesCount'> {
  stats: {
    salesCount: number;
    totalSpent: number;
    averageTicket: number;
    lastPurchaseAt: string | null;
  };
  sales: {
    id: string;
    total: number;
    createdAt: string;
    items: {
      id: string;
      size: string;
      quantity: number;
      unitPrice: number;
      total: number;
      product: {
        id: string;
        model: string;
        brand: string;
        category: string;
      };
    }[];
  }[];
}
