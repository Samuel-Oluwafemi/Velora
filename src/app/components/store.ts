import featuredImg01 from "../../assets/images/white tee1.jpg";
import featuredImg1 from "../../assets/images/white tee1 style.jpg";
import featuredImg02 from "../../assets/images/white straight trouser.jpg";
import featuredImg2 from "../../assets/images/white straight trouser styling.jpg";
import featuredImg03 from "../../assets/images/black tee1.jpg";
import featuredImg3 from "../../assets/images/black-tee1-style.jpg";
import featuredImg04 from "../../assets/images/Loose jeans style.jpg";
import featuredImg4 from "../../assets/images/Loose jeans.jpg";
import featuredImg05 from "../../assets/images/black straight trouser.jpg";
import featuredImg5 from "../../assets/images/black straight trouser style.jpg";
import featuredImg06 from "../../assets/images/Y2k Super Baggy Jean.jpg";
import featuredImg6 from "../../assets/images/Y2k super Baggy Jean Styling.jpg";
import featuredImg07 from "../../assets/images/shein.jpg";
import featuredImg7 from "../../assets/images/shein style.jpg";
import featuredImg08 from "../../assets/images/jacket.jpg";
import featuredImg8 from "../../assets/images/jacket style.jpg";
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
    name: "Plain White T-Shirt",
    price: 20,
    category: "Tops",
    description:
      "A classic white t-shirt made from soft, breathable cotton. The perfect wardrobe staple for effortless style. Features a relaxed fit and a crew neckline.",
    material: "98% Wool, 2% Elastane. Lining: 100% Silk-blend.",
    sizes: ["M", "L", "XL"],
    images: [featuredImg01, featuredImg1],
    tag: "Bestseller",
  },
  {
    id: "p2",
    name: "Ben Martin Men's Smart Fit Stretchable Jeans",
    price: 65,
    category: "Trousers",
    description:
      "Ben Martin Men's Smart Fit Stretchable Jeans || Mid-Rise Denim Pants with Whisker Wash || Premium Casual Wear Jean for Men.",
    material: "100% Belgian Linen.",
    sizes: ["L", "XL"],
    images: [featuredImg02, featuredImg2],
  },
  {
    id: "p3",
    name: "Plain Black T-Shirt",
    price: 25,
    category: "Tops",
    description:
      "A classic black t-shirt made from a soft blend of wool and recycled polyester. The breathable fabric keeps you comfortable, while the relaxed fit offers effortless style. Features a crew neckline and short sleeves.",
    material: "72% Wool, 28% Recycled Polyester.",
    sizes: ["M", "L", "XL"],
    images: [featuredImg03, featuredImg3],
  },
  {
    id: "p4",
    name: "Loose-Fit Jeans",
    price: 75,
    category: "Trousers",
    description:
      "A pair of loose-fit jeans crafted from 100% extra-fine merino wool. The fabric is soft, breathable, and has a natural stretch for all-day comfort. Features a high-rise waist, wide legs, and a cropped length that pairs perfectly with boots or sneakers.",
    material: "100% Extra-Fine Merino Wool.",
    sizes: ["L", "XL"],
    images: [featuredImg04, featuredImg4],
    tag: "New",
  },
  {
    id: "p5",
    name: "Black Straight Trousers",
    price: 120,
    category: "Trousers",
    description:
      "A pair of tailored black straight trousers made from luxurious charmeuse silk. The fabric drapes beautifully and has a subtle sheen that elevates any outfit. Features a high-rise waist, straight legs, and a concealed side zipper for a sleek silhouette.",
    material: "100% Charmeuse Silk.",
    sizes: ["L", "XL"],
    images: [
      featuredImg05,
      featuredImg5,
    ],
    tag: "New",
  },
  {
    id: "p6",
    name: "Y2K Super Baggy Jeans",
    price: 95,
    category: "Shorts",
    description:
      "A pair of super baggy jeans with a distinctly Y2K vibe. Crafted from 100% Grade-A cashmere, these jeans are luxuriously soft and comfortable. The exaggerated wide-leg silhouette and low-rise waist create a bold, fashion-forward look that channels early 2000s street style.",
    material: "100% Grade-A Cashmere.",
    sizes: ["L", "XL"],
    images: [
      featuredImg06,
      featuredImg6,
    ],
  },
  {
    id: "p7",
    name: "Black + White Striped Shirt and Trousers Set",
    price: 45,
    category: "Accessories",
    description:
      "A coordinated set featuring a black and white striped shirt paired with matching trousers. The shirt is made from a lightweight blend of wool and cotton, while the trousers are crafted from 100% wool felt. The shirt features a relaxed fit with a classic collar and button-down front, while the trousers have a straight-leg silhouette with an elastic waistband for comfort.",
    material: "100% Wool Felt.",
    sizes: ["S/M", "L/XL"],
    images: [
      featuredImg07,
      featuredImg7,
    ],
  },
  {
    id: "p8",
    name: "Structured Wool Blazer",
    price: 355,
    category: "Outerwear",
    description:
      "A structured blazer crafted from a luxurious blend of wool and elastane. The fabric has a smooth finish and a slight stretch for comfort. Features a tailored fit with sharp lapels, a single-button closure, and welt pockets for a polished, professional look.",
    material: "95% Wool, 5% Elastane. Lining: 100% Viscose.",
    sizes: ["L", "XL"],
    images: [
      featuredImg08,
      featuredImg8,
    ],
  },
];

export const CATEGORIES = [
  "All",
  "Outerwear",
  "Tops",
  "Trousers",
  "Shorts",
  "Accessories",
];
