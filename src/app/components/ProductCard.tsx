import { useState } from "react";
import { Product } from "./store";
interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

// ProductCard is a reusable component that displays product information in a card format. It shows the product image, name, category, price, and an optional tag. The card has hover effects to enhance user interaction.
export function ProductCard({ product, onClick }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="cursor-pointer group"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden bg-secondary mb-4"
        style={{ aspectRatio: "3/4" }}
      >
        <img
          src={
            hovered && product.images[1] ? product.images[1] : product.images[0]
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
        />
        {/* Tag */}
        {product.tag && (
          <span
            className="absolute top-4 left-4 px-3 py-1 bg-foreground text-primary-foreground"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {product.tag}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className="text-foreground mb-0.5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.05rem",
              fontWeight: 400,
            }}
          >
            {product.name}
          </p>
          <p
            className="text-muted-foreground"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.06em",
            }}
          >
            {product.category}
          </p>
        </div>
        <p
          className="text-foreground whitespace-nowrap"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 400,
          }}
        >
          €{product.price}
        </p>
      </div>
    </div>
  );
}
