import { useState } from "react";
import { PRODUCTS, CATEGORIES } from "./store";
import { ProductCard } from "./ProductCard";
import { Footer } from "./Footer";
import { SlidersHorizontal, X } from "lucide-react";

interface ShopPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

export function ShopPage({ onNavigate }: ShopPageProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = PRODUCTS.filter(
    (p) => activeCategory === "All" || p.category === activeCategory
  ).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Page header */}
      <div className="pt-28 md:pt-36 pb-10 border-b border-border px-6 md:px-12 max-w-screen-xl mx-auto">
        <p
          className="text-muted-foreground uppercase tracking-[0.2em] mb-2"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
        >
          VELORA
        </p>
        <h1
          className="text-foreground"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300 }}
        >
          All Products
        </h1>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        {/* Filters bar */}
        <div className="flex items-center justify-between py-5 border-b border-border gap-4">
          {/* Category pills — desktop */}
          <div className="hidden md:flex items-center gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 transition-colors duration-200"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.73rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  backgroundColor: activeCategory === cat ? "#1A1A1A" : "transparent",
                  color: activeCategory === cat ? "#F8F6F2" : "#6B7280",
                  border: activeCategory === cat ? "1px solid #1A1A1A" : "1px solid #E5E7EB",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile filter toggle */}
          <button
            className="md:hidden flex items-center gap-2 text-muted-foreground"
            onClick={() => setFilterOpen(!filterOpen)}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            <SlidersHorizontal size={15} strokeWidth={1.5} />
            Filter
          </button>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span
              className="text-muted-foreground hidden md:inline"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.73rem", letterSpacing: "0.06em" }}
            >
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-background border border-border text-foreground focus:outline-none focus:border-foreground cursor-pointer px-3 py-1.5"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.73rem" }}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Mobile category drawer */}
        {filterOpen && (
          <div className="md:hidden py-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-foreground uppercase tracking-widest"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
              >
                Categories
              </span>
              <button onClick={() => setFilterOpen(false)}>
                <X size={16} strokeWidth={1.5} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setFilterOpen(false); }}
                  className="px-4 py-1.5 transition-colors"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.73rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    backgroundColor: activeCategory === cat ? "#1A1A1A" : "transparent",
                    color: activeCategory === cat ? "#F8F6F2" : "#6B7280",
                    border: activeCategory === cat ? "1px solid #1A1A1A" : "1px solid #E5E7EB",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Count */}
        <p
          className="text-muted-foreground py-5"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem" }}
        >
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7 pb-24">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onNavigate("product", product.id)}
            />
          ))}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
