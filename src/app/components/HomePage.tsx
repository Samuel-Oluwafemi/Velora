import { PRODUCTS } from "./store";
import { ProductCard } from "./ProductCard";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HomePageProps {
  onNavigate: (page: string, productId?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const featured = PRODUCTS.slice(0, 4);

  return (
    <div className="bg-background min-h-screen">
      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ height: "100svh", minHeight: "600px" }}>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1762605135012-56a59a059e60?w=1800&h=1200&fit=crop&auto=format"
          alt="Woman in structured beige coat — VELORA hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(26,26,26,0.08) 0%, rgba(26,26,26,0.35) 100%)" }} />

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-16 md:pb-24">
          <div className="max-w-screen-xl mx-auto">
            <p
              className="text-primary-foreground/70 uppercase tracking-[0.2em] mb-4"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}
            >
              Spring / Summer 2026
            </p>
            <h1
              className="text-primary-foreground leading-none mb-5"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                fontWeight: 300,
                maxWidth: "16ch",
                lineHeight: 1.05,
              }}
            >
              Timeless Essentials<br />for Modern
            </h1>
            <p
              className="text-primary-foreground/75 mb-10"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 300, letterSpacing: "0.04em" }}
            >
              Designed with intention. Made to last.
            </p>
            <button
              onClick={() => onNavigate("shop")}
              className="px-9 py-3.5 bg-primary-foreground text-foreground hover:bg-accent transition-colors duration-300"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
            >
              Shop Collection
            </button>
          </div>
        </div>
      </section>

      {/* EDITORIAL STATEMENT */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p
              className="text-muted-foreground uppercase tracking-[0.18em] mb-5"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
            >
              Our Philosophy
            </p>
            <h2
              className="text-foreground leading-tight mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 300, lineHeight: 1.2 }}
            >
              Clothes that last<br />a decade, not a season.
            </h2>
            <p
              className="text-muted-foreground leading-relaxed mb-8"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", fontWeight: 300, maxWidth: "44ch" }}
            >
              Every VELORA piece is made to outlast trends. We work with artisan mills in Italy, Portugal, and Japan — sourcing only the materials that improve with age. No fast-fashion shortcuts. No compromises.
            </p>
            <button
              onClick={() => onNavigate("about")}
              className="text-foreground border-b border-foreground/30 pb-0.5 hover:border-accent hover:text-accent transition-colors duration-200"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Our Story
            </button>
          </div>
          <div className="relative">
            <div className="overflow-hidden" style={{ aspectRatio: "4/5" }}>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1570733117311-d990c3816c47?w=900&h=1100&fit=crop&auto=format"
                alt="Two women in minimal white — editorial"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-5 -left-5 w-28 h-28 hidden md:flex items-center justify-center"
              style={{ backgroundColor: "#C8B38E" }}
            >
              <span
                className="text-foreground text-center leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", fontWeight: 300 }}
              >
                Est.<br />2018
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-muted-foreground uppercase tracking-[0.18em] mb-2"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
            >
              Featured
            </p>
            <h2
              className="text-foreground"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 300 }}
            >
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate("shop")}
            className="hidden md:block text-foreground border-b border-foreground/30 pb-0.5 hover:border-accent hover:text-accent transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onNavigate("product", product.id)}
            />
          ))}
        </div>
      </section>

      {/* EDITORIAL SPLIT — Two images */}
      <section className="w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left */}
          <div className="relative overflow-hidden" style={{ minHeight: "520px" }}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1779398970408-1454e2a126c2?w=900&h=700&fit=crop&auto=format"
              alt="Two women in black dresses — editorial"
              className="w-full h-full object-cover"
              style={{ minHeight: "520px" }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-14" style={{ background: "rgba(26,26,26,0.3)" }}>
              <p
                className="text-primary-foreground/70 uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem" }}
              >
                Collection
              </p>
              <p
                className="text-primary-foreground mb-5"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.9rem", fontWeight: 300, lineHeight: 1.15 }}
              >
                The Evening<br />Edit
              </p>
              <button
                onClick={() => onNavigate("shop")}
                className="self-start px-6 py-2.5 border border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
              >
                Explore
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="relative overflow-hidden" style={{ minHeight: "520px" }}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1681028442065-6d1a85eea2ef?w=900&h=700&fit=crop&auto=format"
              alt="Two women on a train platform — travel editorial"
              className="w-full h-full object-cover"
              style={{ minHeight: "520px" }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-14" style={{ background: "rgba(26,26,26,0.3)" }}>
              <p
                className="text-primary-foreground/70 uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem" }}
              >
                New
              </p>
              <p
                className="text-primary-foreground mb-5"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.9rem", fontWeight: 300, lineHeight: 1.15 }}
              >
                The Travel<br />Capsule
              </p>
              <button
                onClick={() => onNavigate("shop")}
                className="self-start px-6 py-2.5 border border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
              >
                Explore
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND PROMISE STRIP */}
      <section className="border-t border-b border-border py-10 mt-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: "✦", label: "Artisan Crafted", sub: "Made in Italy, Portugal & Japan" },
            { icon: "✦", label: "Premium Materials", sub: "Wool, Silk, Cashmere & Linen" },
            { icon: "✦", label: "Free Returns", sub: "30-day hassle-free returns" },
            { icon: "✦", label: "Slow Fashion", sub: "Timeless over trendy" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <span className="text-accent" style={{ fontSize: "0.8rem" }}>{item.icon}</span>
              <p
                className="text-foreground"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 500 }}
              >
                {item.label}
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 300 }}
              >
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-28 text-center">
        <p
          className="text-muted-foreground uppercase tracking-[0.2em] mb-4"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
        >
          Stay Informed
        </p>
        <h2
          className="text-foreground mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 300 }}
        >
          Letters from VELORA
        </h2>
        <p
          className="text-muted-foreground mb-10"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 300 }}
        >
          New arrivals, seasonal stories, and early access. No noise.
        </p>
        <form
          className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-5 py-3.5 border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}
          />
          <button
            type="submit"
            className="px-7 py-3.5 bg-foreground text-primary-foreground hover:bg-accent hover:text-foreground transition-colors duration-300"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
          >
            Subscribe
          </button>
        </form>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
