export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  roommates: number;
  image?: string;
  creator: string;
  createdAt: string;
}
