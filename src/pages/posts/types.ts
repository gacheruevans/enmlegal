export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  material: string;
  category?: {
    id: string;
  } | null;
}