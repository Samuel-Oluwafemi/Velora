export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  material: string;
  sizes: string[];
  images: string[];
  tag?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Structured Wool Coat",
    price: 485,
    category: "Outerwear",
    description:
      "A clean-lined coat cut from dense Italian wool. The relaxed silhouette and precise tailoring make it equally at home in a boardroom or a gallery opening. Fully lined in silk-blend satin.",
    material: "98% Wool, 2% Elastane. Lining: 100% Silk-blend.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1762605135012-56a59a059e60?w=900&h=1200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=900&h=1200&fit=crop&auto=format",
    ],
    tag: "Bestseller",
  },
  {
    id: "p2",
    name: "Relaxed Linen Shirt",
    price: 145,
    category: "Tops",
    description:
      "Woven from Belgian linen for a naturally breathable drape. Slightly oversized proportions with a subtle drop shoulder. The fabric softens beautifully with each wash.",
    material: "100% Belgian Linen.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1523297531913-a2053f0205df?w=900&h=1200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1579741385341-33bf548282d3?w=900&h=1200&fit=crop&auto=format",
    ],
  },
  {
    id: "p3",
    name: "High-Waist Trousers",
    price: 215,
    category: "Trousers",
    description:
      "Wide-leg trousers with a high-rise waist and a clean front crease. Tailored in Japan from a blend of wool and recycled polyester that holds its shape through long wear.",
    material: "72% Wool, 28% Recycled Polyester.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=900&h=1200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1664076458686-3449062080ac?w=900&h=1200&fit=crop&auto=format",
    ],
    tag: "New",
  },
  {
    id: "p4",
    name: "Merino Turtleneck",
    price: 175,
    category: "Tops",
    description:
      "An extra-fine merino turtleneck that layers beneath a coat or stands alone. The ribbed hem and cuffs retain structure over years of wear.",
    material: "100% Extra-Fine Merino Wool.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1579741470669-0ff17b4c0405?w=900&h=1200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1570733117311-d990c3816c47?w=900&h=1200&fit=crop&auto=format",
    ],
  },
  {
    id: "p5",
    name: "Silk Slip Dress",
    price: 320,
    category: "Dresses",
    description:
      "Cut on the bias from pure Charmeuse silk. A minimal silhouette that moves with the body. Finished with hand-rolled hems and adjustable straps.",
    material: "100% Charmeuse Silk.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1664076458686-3449062080ac?w=900&h=1200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1779398970408-1454e2a126c2?w=900&h=1200&fit=crop&auto=format",
    ],
    tag: "New",
  },
  {
    id: "p6",
    name: "Cashmere Cardigan",
    price: 395,
    category: "Knitwear",
    description:
      "A generous-cut cardigan knitted in Grade-A Mongolian cashmere. Four minimal buttons, dropped shoulders, and a ribbed hem. Versatile enough to wear open as a layer or closed as a top.",
    material: "100% Grade-A Cashmere.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1570733117311-d990c3816c47?w=900&h=1200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1588713611500-8bf627fd3fb9?w=900&h=1200&fit=crop&auto=format",
    ],
  },
  {
    id: "p7",
    name: "Wide-Brim Felt Hat",
    price: 120,
    category: "Accessories",
    description:
      "Hand-finished in Florence from dense wool felt. A wide brim and structured crown that completes any editorial look.",
    material: "100% Wool Felt.",
    sizes: ["S/M", "L/XL"],
    images: [
      "https://images.unsplash.com/photo-1681028442065-6d1a85eea2ef?w=900&h=1200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=900&h=1200&fit=crop&auto=format",
    ],
  },
  {
    id: "p8",
    name: "Tailored Blazer",
    price: 355,
    category: "Outerwear",
    description:
      "A single-button blazer with a minimal notch lapel and structured shoulders. The fabric is an Italian wool-crepe that resists creasing on travel.",
    material: "95% Wool, 5% Elastane. Lining: 100% Viscose.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=900&h=1200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1588713611500-8bf627fd3fb9?w=900&h=1200&fit=crop&auto=format",
    ],
  },
];

export const CATEGORIES = ["All", "Outerwear", "Tops", "Trousers", "Dresses", "Knitwear", "Accessories"];
