import { useState, useEffect } from "react";
import { CartItem } from "./components/store";
import { Navbar } from "./components/Navbar";
import { FAQs } from "./components/FAQs";
import { HomePage } from "./components/HomePage";
import { ShopPage } from "./components/ShopPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { Footer } from "./components/Footer";
import { AccountPage } from "./components/AccountPage";
import featuredImg1 from "../assets/images/Relaxed.png";

type Page =
  | "home"
  | "shop"
  | "collection"
  | "about"
  | "product"
  | "cart"
  | "checkout"
  | "account"
  | "admin";

export default function App() {
  {
    /* MARKER-MAKE-KIT-INVOKED */
  }

  const [page, setPage] = useState<Page>("home");
  const [productId, setProductId] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, productId]);

  const navigate = (p: string, pid?: string) => {
    setPage(p as Page);
    if (pid) setProductId(pid);
  };

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === item.product.id && i.size === item.size,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === item.product.id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (productId: string, size: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size
          ? { ...i, quantity: qty }
          : i,
      ),
    );
  };

  const removeItem = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.size === size)),
    );
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (page === "admin") {
    return (
      <div
        className="bg-background text-foreground"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <AdminDashboard onNavigate={navigate} />
      </div>
    );
  }

  return (
    <div
      className="bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Navbar cartCount={cartCount} onNavigate={navigate} currentPage={page} />

      {page === "home" && <HomePage onNavigate={navigate} />}
      {(page === "shop" || page === "collection") && (
        <ShopPage onNavigate={navigate} />
      )}
      {page === "product" && productId && (
        <ProductDetailPage
          productId={productId}
          onNavigate={navigate}
          onAddToCart={addToCart}
        />
      )}
      {page === "cart" && (
        <CartPage
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
          onNavigate={navigate}
        />
      )}
      {page === "checkout" && (
        <CheckoutPage
          cartItems={cartItems}
          onNavigate={navigate}
          onOrderComplete={() => setCartItems([])}
        />
      )}
      {page === "about" && <AboutPage onNavigate={navigate} />}
      {page === "account" && <AccountPage onNavigate={navigate} />}

      {/* Demo: Admin Panel shortcut */}
      <button
        onClick={() => navigate("admin")}
        className="fixed bottom-5 right-5 z-50 px-4 py-2 bg-foreground text-primary-foreground 
        hover:bg-accent hover:text-foreground transition-colors duration-200"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Admin →
      </button>
    </div>
  );
}

function AboutPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <div className="bg-background min-h-screen">
      <div
        className="w-full relative overflow-hidden flex items-end"
        style={{ height: "55vh", minHeight: "380px" }}
      >
        <img
          src={featuredImg1}
          alt="About VELORA — editorial"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(26,26,26,0.32)" }}
        />
        <div className="relative px-6 md:px-16 pb-12 max-w-screen-xl mx-auto w-full">
          <p
            className="text-primary-foreground/70 uppercase tracking-[0.2em] mb-2"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}
          >
            Our Story
          </p>
          <h1
            className="text-primary-foreground"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              fontWeight: 300,
            }}
          >
            Built on Conviction
          </h1>
        </div>
      </div>
      <div className="max-w-screen-md mx-auto px-6 md:px-12 py-20">
        <p
          className="text-foreground mb-8 leading-relaxed"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.4rem",
            fontWeight: 300,
            lineHeight: 1.55,
          }}
        >
          "We started VELORA because we were tired of buying things we didn't
          love. Every piece we design is something we'd wear for ten years."
        </p>
        <p
          className="text-muted-foreground mb-6 leading-relaxed"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.88rem",
            fontWeight: 300,
          }}
        >
          Founded in Paris in 2018, VELORA works exclusively with artisan mills
          in Italy, Portugal, and Japan. We produce in small batches — never
          more than we need, never less than our best.
        </p>
        <p
          className="text-muted-foreground leading-relaxed"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.88rem",
            fontWeight: 300,
          }}
        >
          We believe fashion is at its most powerful when it's invisible — when
          you stop thinking about what you're wearing and start focusing on what
          you're doing.
        </p>
        <button
          onClick={() => onNavigate("shop")}
          className="mt-12 px-9 py-3.5 bg-foreground text-primary-foreground hover:bg-accent 
          hover:text-foreground transition-colors duration-300"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Shop the Collection
        </button>
      </div>
      {/* FAQs */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 py-6 md:py-20">
        <FAQs />
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}


