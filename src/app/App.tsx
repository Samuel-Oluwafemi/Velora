import { useState, useEffect } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { CartItem } from "./components/store";
import { Navbar } from "./components/Navbar";
import { Toast } from "./components/Toast";
import { HomePage } from "./components/HomePage";
import { ShopPage } from "./components/ShopPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminRoute } from "./components/AdminRoute";
import { AccountPage } from "./components/AccountPage";
import { AboutPage } from "./components/AboutPage";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading: authLoading } = useAuth();

  // 
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // checkout handler checks if the cart is empty or if the user is not logged in. If the cart is empty, it does nothing. If the user is not logged in, it navigates to the account page. Otherwise, it navigates to the checkout page.
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    // If the user is not logged in, navigate to the account page and pass the intended destination (checkout) in the state. This allows for redirecting back to checkout after successful login.
    if (!user) {
      navigate("/account", {
        state: { from: "/checkout" },
      });
      return;
    }

    // navigate to the checkout page if the user is logged in
    navigate("/checkout");
  };

  // Initialize cart items from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("velora-cart");

    // If there's no saved cart, return an empty array. If there is, try to parse it as JSON. If parsing fails, also return an empty array.
    if (!savedCart) {
      return [];
    }
    try {
      return JSON.parse(savedCart) as CartItem[];
    } catch {
      return [];
    }
  });

  // Handle toast messages from navigation state
  useEffect(() => {
  const state = location.state as {
    toast?: string;
  } | null;

  if (!state?.toast) {
    return;
  }

  setToastMessage(state.toast);

  const timer = setTimeout(() => {
    setToastMessage(null);

    // Remove the toast from the browser history state
    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, 3000);

  return () => clearTimeout(timer);
}, [location, navigate]);

  // Persist cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("velora-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  // navigateToPage handles navigation to different pages in the app. It uses a mapping of page names to their corresponding routes. If a product ID is provided, it constructs the route for the product detail page.
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

  // Cart management functions for adding, updating, and removing items
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

  // updateQuantity updates the quantity of a specific item in the cart. If the new quantity is less than or equal to zero, it removes the item from the cart.
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

  // removeItem removes a specific item from the cart based on its product ID and size.
  const removeItem = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.size === size)),
    );
  };

  function CheckoutRoute({
    cartItems,
    onNavigate,
    onOrderComplete,
    authLoading,
  }: {
    cartItems: CartItem[];
    onNavigate: (page: string) => void;
    onOrderComplete: () => void;
    authLoading: boolean;
  }) {
    const { user } = useAuth();

    if (authLoading) {
      return (
        <div className="bg-background min-h-screen flex items-center justify-center">
          <Loader size={20} className="animate-spin" />
        </div>
      );
    }

    if (cartItems.length === 0) {
      return <Navigate to="/cart" replace />;
    }

    if (!user) {
      return <Navigate to="/account" replace state={{ from: "/checkout" }} />;
    }

    return (
      <CheckoutPage
        cartItems={cartItems}
        onNavigate={onNavigate}
        onOrderComplete={onOrderComplete}
      />
    );
  }

  // cartCount calculates the total number of items in the cart by summing up the quantities of all items.
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      className="bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {toastMessage && <Toast message={toastMessage} />}
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/"
          element={
            <PageLayout
              cartCount={cartCount}
              onNavigate={navigateToPage}
              page="home"
            />
          }
        >
          <Route index element={<HomePage onNavigate={navigateToPage} />} />
          <Route
            path="shop"
            element={<ShopPage onNavigate={navigateToPage} />}
          />
          <Route
            path="collection"
            element={<ShopPage onNavigate={navigateToPage} />}
          />
          <Route
            path="about"
            element={<AboutPage onNavigate={navigateToPage} />}
          />
          <Route
            path="account"
            element={<AccountPage onNavigate={navigateToPage} />}
          />
          <Route
            path="cart"
            element={
              <CartPage
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                onNavigate={navigateToPage}
                onCheckout={handleCheckout}
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

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
      <Navbar
        cartCount={cartCount}
        onNavigate={onNavigate}
        currentPage={page}
      />
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

