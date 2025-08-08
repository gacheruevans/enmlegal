export interface Article {
  id: string;
  name: string;
  description: string;
  category: { id: string} | null;
}