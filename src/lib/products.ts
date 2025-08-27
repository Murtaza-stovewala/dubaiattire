export type Product = {
  id: string;
  name: string;
  description: string;
  category: 'Kurtas' | 'Blazers' | 'Sherwanis' | 'Indo-western';
  price: number;
  color: 'Blue' | 'Gold' | 'Ivory' | 'Black' | 'Red';
  occasion: 'Wedding' | 'Party' | 'Formal';
  imageSrc: string;
  imageHint: string;
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Royal Blue Velvet Blazer',
    description: 'A masterpiece of tailoring, this velvet blazer in a deep royal blue is perfect for making a statement at any formal event.',
    category: 'Blazers',
    price: 499,
    color: 'Blue',
    occasion: 'Formal',
    imageSrc: 'https://picsum.photos/id/10/600/800',
    imageHint: 'man blazer',
  },
  {
    id: '2',
    name: 'Golden Silk Kurta',
    description: 'Woven from the finest silk, this golden kurta shines with elegance and tradition. Ideal for weddings and festive celebrations.',
    category: 'Kurtas',
    price: 299,
    color: 'Gold',
    occasion: 'Wedding',
    imageSrc: 'https://picsum.photos/id/17/600/800',
    imageHint: 'man kurta',
  },
  {
    id: '3',
    name: 'Classic Ivory Sherwani',
    description: 'Embody timeless grace with our classic ivory sherwani, featuring intricate hand-embroidery and a majestic silhouette.',
    category: 'Sherwanis',
    price: 899,
    color: 'Ivory',
    occasion: 'Wedding',
    imageSrc: 'https://picsum.photos/id/21/600/800',
    imageHint: 'man sherwani',
  },
  {
    id: '4',
    name: 'Modern Indo-Western Fusion',
    description: 'A bold fusion of classic cuts and contemporary design, this Indo-western outfit is for the man who dares to be different.',
    category: 'Indo-western',
    price: 650,
    color: 'Black',
    occasion: 'Party',
    imageSrc: 'https://picsum.photos/id/29/600/800',
    imageHint: 'man fashion',
  },
  {
    id: '5',
    name: 'Regal Red Sherwani',
    description: 'Command attention in this stunning red sherwani, adorned with gold accents. The perfect choice for a groom.',
    category: 'Sherwanis',
    price: 950,
    color: 'Red',
    occasion: 'Wedding',
    imageSrc: 'https://picsum.photos/id/40/600/800',
    imageHint: 'man sherwani',
  },
  {
    id: '6',
    name: 'Charcoal Linen Kurta',
    description: 'Sophisticated and comfortable, this charcoal black linen kurta is a versatile addition to any wardrobe, suitable for casual and formal gatherings.',
    category: 'Kurtas',
    price: 250,
    color: 'Black',
    occasion: 'Party',
    imageSrc: 'https://picsum.photos/id/48/600/800',
    imageHint: 'man kurta',
  },
  {
    id: '7',
    name: 'Azure Blue Indo-Western',
    description: 'A striking azure blue outfit that blends traditional aesthetics with a modern, tailored fit. Perfect for reception parties.',
    category: 'Indo-western',
    price: 720,
    color: 'Blue',
    occasion: 'Party',
    imageSrc: 'https://picsum.photos/id/57/600/800',
    imageHint: 'man fashion',
  },
  {
    id: '8',
    name: 'Gold-Trimmed Navy Blazer',
    description: 'Exude confidence in this sharp navy blazer, highlighted with subtle gold trim for a touch of opulence.',
    category: 'Blazers',
    price: 550,
    color: 'Blue',
    occasion: 'Formal',
    imageSrc: 'https://picsum.photos/id/64/600/800',
    imageHint: 'man blazer',
  },
];

export const productFilters = {
    category: ['All', ...Array.from(new Set(products.map(p => p.category)))],
    color: ['All', ...Array.from(new Set(products.map(p => p.color)))],
    occasion: ['All', ...Array.from(new Set(products.map(p => p.occasion)))],
};
