import { useState } from "react";
import { PRODUCTS, Product, CartItem } from "./store";
import { ProductCard } from "./ProductCard";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChevronLeft, Plus, Minus } from "lucide-react";

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (item: CartItem) => void;
}

export function ProductDetailPage({ productId, onNavigate, onAddToCart }: ProductDetailPageProps) {
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
  const fallbackRelated = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAdd = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    onAddToCart({ product, size: selectedSize, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 pt-24 md:pt-32">
        {/* Breadcrumb */}
        <button
          onClick={() => onNavigate("shop")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-8"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Shop
        </button>

        {/* Main layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20">
          {/* Images */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            <div className="flex flex-col gap-2.5 w-16 flex-shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="overflow-hidden"
                  style={{
                    aspectRatio: "3/4",
                    border: activeImage === i ? "1px solid #1A1A1A" : "1px solid #E5E7EB",
                  }}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            {/* Main image */}
            <div className="flex-1 overflow-hidden bg-secondary" style={{ aspectRatio: "3/4" }}>
              <ImageWithFallback
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-start pt-2 md:pt-6">
            {product.tag && (
              <span
                className="self-start px-3 py-1 mb-4 bg-foreground text-primary-foreground"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                {product.tag}
              </span>
            )}

            <p
              className="text-muted-foreground uppercase tracking-[0.14em] mb-2"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
            >
              {product.category}
            </p>
            <h1
              className="text-foreground mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 2.5vw, 2.5rem)", fontWeight: 300 }}
            >
              {product.name}
            </h1>
            <p
              className="text-foreground mb-8"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.05rem", fontWeight: 300, letterSpacing: "0.04em" }}
            >
              €{product.price}
            </p>

            {/* Description */}
            <p
              className="text-muted-foreground leading-relaxed mb-8"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 300 }}
            >
              {product.description}
            </p>

            <div className="border-t border-border pt-7 mb-7">
              {/* Size selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="text-foreground uppercase tracking-widest"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
                  >
                    Size
                  </p>
                  <button
                    className="text-muted-foreground"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", textDecoration: "underline" }}
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className="w-12 h-10 transition-colors duration-200"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.75rem",
                        letterSpacing: "0.04em",
                        backgroundColor: selectedSize === size ? "#1A1A1A" : "transparent",
                        color: selectedSize === size ? "#F8F6F2" : "#1A1A1A",
                        border: sizeError && !selectedSize
                          ? "1px solid #c0392b"
                          : selectedSize === size
                            ? "1px solid #1A1A1A"
                            : "1px solid #E5E7EB",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-destructive mt-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}>
                    Please select a size.
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <p
                  className="text-foreground uppercase tracking-widest"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
                >
                  Qty
                </p>
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minus size={13} strokeWidth={1.5} />
                  </button>
                  <span
                    className="w-9 text-center text-foreground"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAdd}
                className="w-full py-4 transition-colors duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  backgroundColor: added ? "#C8B38E" : "#1A1A1A",
                  color: "#F8F6F2",
                }}
              >
                {added ? "Added to Bag ✓" : "Add to Bag"}
              </button>
            </div>

            {/* Material */}
            <div className="border-t border-border pt-6">
              <p
                className="text-muted-foreground uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem" }}
              >
                Material
              </p>
              <p
                className="text-foreground"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", fontWeight: 300 }}
              >
                {product.material}
              </p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {(related.length > 0 || fallbackRelated.length > 0) && (
          <div className="border-t border-border pt-14 pb-20">
            <h2
              className="text-foreground mb-10"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 300 }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
              {(related.length > 0 ? related : fallbackRelated).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => onNavigate("product", p.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
