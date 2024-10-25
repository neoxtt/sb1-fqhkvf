export interface Product {
  name: string;
  price: number;
  category: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface User {
  name: string;
  isChild: boolean;
  orders: OrderItem[];
}