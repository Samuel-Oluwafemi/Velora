import { useProducts } from "../../contexts/ProductContext";
import { ProductCard } from "./ProductCard";
import { Footer } from "./Footer";
import heroImage from "../../assets/images/heroImg.png";
import Image from "../../assets/images/Versatile Style Power.jpg";
import featuredImg from "../../assets/images/Collection.jpg";
import featuredImg1 from "../../assets/images/Relaxed.png";
import { FAQs } from "./FAQs";
import { Reveal } from "./Motion";
interface HomePageProps {
  onNavigate: (page: string, productId?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { products, loading, error } = useProducts();
  const featured = products
    .filter((product) => product.stockStatus !== "outOfStock" && product.inStock !== false)
    .slice(0, 4);

  return (
    <div className="bg-background min-h-screen">
      {/* HERO */}
      <section className="relative min-h-[680px] overflow-hidden bg-[#171714] md:h-[calc(100svh-5rem)] md:min-h-[720px]">
        <img
          src={heroImage}
          alt="VELORA's considered collection"
          className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(18,18,16,0.64) 0%, rgba(18,18,16,0.34) 48%, rgba(18,18,16,0.06) 100%), linear-gradient(0deg, rgba(18,18,16,0.46) 0%, transparent 58%)",
          }}
        />

        <div className="absolute inset-0 flex items-end px-6 pb-16 md:items-center md:px-16 md:pb-0">
          <div className="mx-auto w-full max-w-screen-xl">
            <Reveal>
              <div className="max-w-2xl">
                <p className="mb-6 flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#dfcfb1]">
                  <span className="h-px w-9 bg-[#c8b38e]" />
                  A wardrobe, considered
                </p>
                <h1
                  className="mb-6 max-w-[12ch] text-primary-foreground"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(3.4rem, 8vw, 7.2rem)",
                    fontWeight: 300,
                    lineHeight: 0.88,
                    letterSpacing: "-0.035em",
                  }}
                >
                  The art of
                  <br />
                  understated
                  <br />
                  dressing.
                </h1>
                <p className="mb-9 max-w-md text-sm font-light leading-7 tracking-[0.04em] text-primary-foreground/80 md:text-base">
                  Thoughtful pieces for a life well lived. Discover a quieter
                  expression of personal style.
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  <button
                    onClick={() => onNavigate("shop")}
                    className="border border-[#dfcfb1] bg-[#dfcfb1] px-7 py-3.5 text-[0.65rem] uppercase tracking-[0.18em] text-[#171714] transition-colors duration-300 hover:bg-transparent hover:text-primary-foreground"
                  >
                    Discover the collection
                  </button>
                  <button
                    onClick={() => onNavigate("about")}
                    className="border-b border-white/45 pb-1 text-[0.65rem] uppercase tracking-[0.18em] text-primary-foreground/85 transition-colors hover:border-[#dfcfb1] hover:text-[#dfcfb1]"
                  >
                    Our point of view
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[0.55rem] uppercase tracking-[0.22em] text-primary-foreground/65 md:flex">
          <span className="h-px w-8 bg-primary-foreground/50" />
          VELORA · Est. 2026
        </div>
      </section>

      {/* EDITORIAL STATEMENT */}
      <section className="mx-auto max-w-screen-xl px-6 py-24 md:px-12 md:py-36">
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2 md:gap-24">
          <Reveal>
            <div className="max-w-lg">
              <p className="mb-5 text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">
                The VELORA perspective
              </p>
              <h2
                className="mb-7 text-foreground"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2.4rem, 4.2vw, 4rem)",
                  fontWeight: 300,
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                }}
              >
                Less, but chosen
                <br />
                with feeling.
              </h2>
              <p className="mb-8 max-w-[48ch] text-sm font-light leading-7 text-muted-foreground">
                VELORA is a study in considered dressing: refined shapes,
                thoughtful details, and pieces that feel as natural at the
                beginning of the day as they do at its close. We believe style
                is not about having more. It is about knowing what belongs.
              </p>
              <button
                onClick={() => onNavigate("about")}
                className="border-b border-foreground/35 pb-1 text-[0.65rem] uppercase tracking-[0.17em] text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Discover our story
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="relative md:ml-5">
              <div className="absolute -right-3 -top-3 h-full w-full border border-[#c8b38e]/50 md:-right-5 md:-top-5" />
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                <img
                  src={Image}
                  alt="A quiet, considered VELORA editorial moment"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <p className="absolute -bottom-8 left-0 text-[0.56rem] uppercase tracking-[0.2em] text-muted-foreground">
                Personal style, thoughtfully considered
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 pb-20">
        <Reveal>
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
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                fontWeight: 300,
              }}
            >
              New Arrivals
            </h2>
            </div>
            <button
            onClick={() => onNavigate("shop")}
            className="hidden md:block text-foreground border-b border-foreground/30 
            pb-0.5 hover:border-accent hover:text-accent transition-colors cursor-pointer"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            View All
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onNavigate("product", product.id)}
            />
          ))}
        </Reveal>
        {!loading && error && (
          <p className="mt-6 text-sm text-muted-foreground" role="status">
            Products are temporarily unavailable.
          </p>
        )}
      </section>

      {/* EDITORIAL SPLIT — Two images */}
      <section className="w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left */}
          <div
            className="relative overflow-hidden"
            style={{ minHeight: "520px" }}
          >
            <img
              src={featuredImg}
              alt="Two women in black dresses — editorial"
              className="w-full h-full object-cover object-top"
              style={{ minHeight: "320px" }}
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-10 md:p-14"
              style={{ background: "rgba(26,26,26,0.3)" }}
            >
              <p
                className="text-primary-foreground/70 uppercase tracking-widest mb-2"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.65rem",
                }}
              >
                Collection
              </p>
              <p
                className="text-primary-foreground mb-5"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.9rem",
                  fontWeight: 300,
                  lineHeight: 1.15,
                }}
              >
                The Evening
                <br />
                Edit
              </p>
              <button
                onClick={() => onNavigate("shop")}
                className="self-start px-6 py-2.5 border border-primary-foreground 
                text-primary-foreground hover:bg-primary-foreground hover:text-foreground 
                transition-colors duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Explore
              </button>
            </div>
          </div>

          {/* Right */}
          <div
            className="relative overflow-hidden"
            style={{ minHeight: "520px" }}
          >
            <img
              src={featuredImg1}
              alt="Two women on a train platform — travel editorial"
              className="w-full h-full object-cover"
              style={{ minHeight: "520px" }}
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-10 md:p-14"
              style={{ background: "rgba(26,26,26,0.3)" }}
            >
              <p
                className="text-primary-foreground/70 uppercase tracking-widest mb-2"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.65rem",
                }}
              >
                New
              </p>
              <p
                className="text-primary-foreground mb-5"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.9rem",
                  fontWeight: 300,
                  lineHeight: 1.15,
                }}
              >
                The Travel
                <br />
                Capsule
              </p>
              <button
                onClick={() => onNavigate("shop")}
                className="self-start px-6 py-2.5 border border-primary-foreground text-primary-foreground 
                hover:bg-primary-foreground hover:text-foreground transition-colors duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Explore
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND PROMISE STRIP */}
      <section className="border-t border-b border-border py-10 mt-20">
        <div
          className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-2 
        md:grid-cols-4 gap-8 text-center"
        >
          {[
            {
              icon: "✦",
              label: "Artisan Crafted",
              sub: "Made in Italy, Portugal & Japan",
            },
            {
              icon: "✦",
              label: "Premium Materials",
              sub: "Wool, Silk, Cashmere & Linen",
            },
            {
              icon: "✦",
              label: "Free Returns",
              sub: "30-day hassle-free returns",
            },
            { icon: "✦", label: "Slow Fashion", sub: "Timeless over trendy" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <span className="text-accent" style={{ fontSize: "0.8rem" }}>
                {item.icon}
              </span>
              <p
                className="text-foreground"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </p>
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 300,
                }}
              >
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Reveal className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <FAQs />
      </Reveal>

      {/* NEWSLETTER */}
      <Reveal className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-28 text-center">
        <p
          className="text-muted-foreground uppercase tracking-[0.2em] mb-4"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
        >
          Stay Informed
        </p>
        <h2
          className="text-foreground mb-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 300,
          }}
        >
          Letters from VELORA
        </h2>
        <p
          className="text-muted-foreground mb-10"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 300,
          }}
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
            className="flex-1 px-5 py-3.5 border border-border bg-background text-foreground 
            placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}
          />
          <button
            type="submit"
            className="px-7 py-3.5 bg-foreground text-primary-foreground hover:bg-accent 
            hover:text-foreground transition-colors duration-300"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Subscribe
          </button>
        </form>
      </Reveal>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
