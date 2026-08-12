import { useState, useEffect } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
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

export default function App() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const navigateToPage = (p: string, pid?: string) => {
    const pageMap: Record<string, string> = {
      home: "/",
      shop: "/shop",
      collection: "/shop",
      about: "/about",
      account: "/account",
      cart: "/cart",
      checkout: "/checkout",
      admin: "/admin",
      product: pid ? `/product/${pid}` : "/shop",
    };

    const target = pageMap[p] ?? "/";
    navigate(target);
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

  return (
    <div
      className="bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Routes>
        <Route
          path="/"
          element={<PageLayout cartCount={cartCount} onNavigate={navigateToPage} page="home" />}
        >
          <Route index element={<HomePage onNavigate={navigateToPage} />} />
          <Route path="shop" element={<ShopPage onNavigate={navigateToPage} />} />
          <Route path="collection" element={<ShopPage onNavigate={navigateToPage} />} />
          <Route path="about" element={<AboutPage onNavigate={navigateToPage} />} />
          <Route path="account" element={<AccountPage onNavigate={navigateToPage} />} />
          <Route
            path="cart"
            element={
              <CartPage
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                onNavigate={navigateToPage}
              />
            }
          />
          <Route
            path="checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                onNavigate={navigateToPage}
                onOrderComplete={() => setCartItems([])}
              />
            }
          />
          <Route
            path="product/:productId"
            element={
              <ProductDetailRoute
                onNavigate={navigateToPage}
                onAddToCart={addToCart}
              />
            }
          />
          <Route path="admin" element={<AdminDashboard onNavigate={navigateToPage} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      <button
        onClick={() => navigateToPage("admin")}
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

function PageLayout({
  cartCount,
  onNavigate,
  page,
}: {
  cartCount: number;
  onNavigate: (p: string, pid?: string) => void;
  page: string;
}) {
  return (
    <>
      <Navbar cartCount={cartCount} onNavigate={onNavigate} currentPage={page} />
      <Outlet />
    </>
  );
}

function ProductDetailRoute({
  onNavigate,
  onAddToCart,
}: {
  onNavigate: (p: string, pid?: string) => void;
  onAddToCart: (item: CartItem) => void;
}) {
  const { productId } = useParams();

  if (!productId) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <ProductDetailPage
      productId={productId}
      onNavigate={onNavigate}
      onAddToCart={onAddToCart}
    />
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
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 py-6 md:py-20">
        <FAQs />
      </section>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}


