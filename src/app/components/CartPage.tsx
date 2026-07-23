import { CartItem } from "./store";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X, Plus, Minus } from "lucide-react";

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: string, qty: number) => void;
  onRemove: (productId: string, size: string) => void;
  onNavigate: (page: string, productId?: string) => void;
}

export function CartPage({
  cartItems,
  onUpdateQuantity,
  onRemove,
  onNavigate,
}: CartPageProps) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal > 300 ? 0 : 12;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-24">
          <p
            className="text-muted-foreground uppercase tracking-[0.2em] mb-3"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
          >
            Your Bag
          </p>
          <h1
            className="text-foreground mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: 300,
            }}
          >
            Your bag is empty
          </h1>
          <p
            className="text-muted-foreground mb-10"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 300,
            }}
          >
            Explore the collection and find something you love.
          </p>
          <button
            onClick={() => onNavigate("shop")}
            className="px-10 py-3.5 bg-foreground text-primary-foreground hover:bg-accent hover:text-foreground transition-colors duration-300"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Browse Collection
          </button>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-24">
        <p
          className="text-muted-foreground uppercase tracking-[0.2em] mb-2"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
        >
          VELORA
        </p>
        <h1
          className="text-foreground mb-12"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 300,
          }}
        >
          Your Bag
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="border-t border-border">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-5 py-7 border-b border-border"
                >
                  {/* Image */}
                  <div
                    className="flex-shrink-0 overflow-hidden bg-secondary cursor-pointer"
                    style={{ width: "90px", aspectRatio: "3/4" }}
                    onClick={() => onNavigate("product", item.product.id)}
                  >
                    <ImageWithFallback
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p
                          className="text-foreground mb-1 cursor-pointer hover:text-accent transition-colors"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "1.05rem",
                            fontWeight: 400,
                          }}
                          onClick={() => onNavigate("product", item.product.id)}
                        >
                          {item.product.name}
                        </p>
                        <p
                          className="text-muted-foreground"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.75rem",
                          }}
                        >
                          {item.product.category} · Size {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemove(item.product.id, item.size)}
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <X size={15} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.size,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span
                          className="w-8 text-center text-foreground"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.8rem",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>

                      <p
                        className="text-foreground"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.9rem",
                          fontWeight: 400,
                        }}
                      >
                        €{(item.product.price).toLocaleString()} * {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate("shop")}
              className="mt-8 text-muted-foreground hover:text-foreground transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Continue Shopping
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary p-7 sticky top-24">
              <h2
                className="text-foreground mb-7 pb-5 border-b border-border"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.2rem",
                  fontWeight: 400,
                }}
              >
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between">
                  <span
                    className="text-muted-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    €{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-muted-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    Shipping
                  </span>
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    {shipping === 0 ? "Free" : `€${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.72rem",
                    }}
                  >
                    Free shipping on orders over €300
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-5 mb-7">
                <div className="flex justify-between">
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.05rem",
                      fontWeight: 400,
                    }}
                  >
                    Total
                  </span>
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.05rem",
                      fontWeight: 400,
                    }}
                  >
                    €{total.toLocaleString()}
                  </span>
                </div>
                <p
                  className="text-muted-foreground mt-1"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.72rem",
                  }}
                >
                  Including VAT
                </p>
              </div>

              <button
                onClick={() => onNavigate("checkout")}
                className="w-full py-4 bg-foreground text-primary-foreground hover:bg-accent hover:text-foreground transition-colors duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Proceed to Checkout
              </button>

              <div className="mt-5 flex flex-col gap-2">
                {["Secure checkout", "Easy returns within 30 days"].map(
                  (note) => (
                    <p
                      key={note}
                      className="text-muted-foreground text-center"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.72rem",
                      }}
                    >
                      ✓ {note}
                    </p>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
