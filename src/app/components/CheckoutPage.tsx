import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createOrder } from "../../services/orderService";
import { CartItem } from "./store";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface CheckoutPageProps {
  cartItems: CartItem[];
  onNavigate: (page: string) => void;
  onOrderComplete: () => void;
}

const STEPS = ["Contact", "Shipping", "Payment"];

export function CheckoutPage({
  cartItems,
  onNavigate,
  onOrderComplete,
}: CheckoutPageProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    country: "France",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  const subtotal = cartItems.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );
  const shipping = subtotal > 300 ? 0 : 12;
  const total = subtotal + shipping;

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

// Create the order when the user clicks "Place Order"
  const handlePlaceOrder = async () => {
  if (!user) {
    console.error("User is not authenticated");
    return;
  }

  // Create the order using the order service
  try {
    const orderId = await createOrder({
      userId: user.uid,
      email: form.email,
      
      customer: {
        firstName: form.firstName,
        lastName: form.lastName,
      },

      items: cartItems,

      shippingAddress: {
        address: form.address,
        city: form.city,
        postcode: form.postcode,
        country: form.country,
      },

      subtotal,
      shipping,
      total,
    });

    console.log("Order created:");

    setCompleted(true);
  } catch (error) {
    console.error("Failed to create order:", error);
  }
};

  const inputClass =
    "w-full px-4 py-3 border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors";
  const inputStyle = { fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" };
  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  };

  if (completed) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: "#C8B38E" }}
          >
            <Check size={22} strokeWidth={1.5} className="text-foreground" />
          </div>
          <p
            className="text-muted-foreground uppercase tracking-[0.2em] mb-3"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
          >
            Order Confirmed
          </p>
          <h1
            className="text-foreground mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: 300,
            }}
          >
            Thank you, {form.firstName}.
          </h1>
          <p
            className="text-muted-foreground mb-10"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 300,
              lineHeight: 1.6,
            }}
          >
            Your order has been placed and a confirmation has been sent to{" "}
            <span className="text-foreground">
              {form.email || "your email"}
            </span>
            . Your pieces will arrive within 3–5 business days.
          </p>
          <button
            onClick={() => {
              onOrderComplete();
              onNavigate("home");
            }}
            className="px-10 py-3.5 bg-foreground text-primary-foreground hover:bg-accent hover:text-foreground 
            transition-colors duration-300"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-screen-lg mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() =>
              step === 0 ? onNavigate("cart") : setStep(step - 1)
            }
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            {step === 0 ? "Bag" : STEPS[step - 1]}
          </button>
          <p
            className="text-foreground tracking-[0.25em] uppercase"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            VELORA
          </p>
          <div className="w-16" />
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-12 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors duration-300"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.7rem",
                    backgroundColor: i <= step ? "#1A1A1A" : "transparent",
                    color: i <= step ? "#F8F6F2" : "#6B7280",
                    border:
                      i <= step ? "1px solid #1A1A1A" : "1px solid #E5E7EB",
                  }}
                >
                  {i < step ? <Check size={12} strokeWidth={2} /> : i + 1}
                </div>
                <span
                  className="mt-1.5 hidden md:block"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: i === step ? "#1A1A1A" : "#6B7280",
                  }}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-16 md:w-24 h-px mx-2"
                  style={{ backgroundColor: i < step ? "#1A1A1A" : "#E5E7EB" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            {/* Step 0: Contact */}
            {step === 0 && (
              <div>
                <h2
                  className="text-foreground mb-7"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.5rem",
                    fontWeight: 300,
                  }}
                >
                  Contact
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-muted-foreground mb-2"
                      style={labelStyle}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="your@email.com"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        placeholder="Camille"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        placeholder="Moreau"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Shipping */}
            {step === 1 && (
              <div>
                <h2
                  className="text-foreground mb-7"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.5rem",
                    fontWeight: 300,
                  }}
                >
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-muted-foreground mb-2"
                      style={labelStyle}
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="12 Rue de la Paix"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        City
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        placeholder="Paris"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        Postcode
                      </label>
                      <input
                        type="text"
                        value={form.postcode}
                        onChange={(e) => update("postcode", e.target.value)}
                        placeholder="75001"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-muted-foreground mb-2"
                      style={labelStyle}
                    >
                      Country
                    </label>
                    <select
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    >
                      {[
                        "France",
                        "Germany",
                        "United Kingdom",
                        "Italy",
                        "Spain",
                        "Netherlands",
                        "United States",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div>
                <h2
                  className="text-foreground mb-7"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.5rem",
                    fontWeight: 300,
                  }}
                >
                  Payment
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-muted-foreground mb-2"
                      style={labelStyle}
                    >
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={form.cardName}
                      onChange={(e) => update("cardName", e.target.value)}
                      placeholder="Camille Moreau"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-muted-foreground mb-2"
                      style={labelStyle}
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={form.cardNumber}
                      onChange={(e) => update("cardNumber", e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={form.expiry}
                        onChange={(e) => update("expiry", e.target.value)}
                        placeholder="MM / YY"
                        maxLength={7}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        CVV
                      </label>
                      <input
                        type="text"
                        value={form.cvv}
                        onChange={(e) => update("cvv", e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 mt-2 p-3 bg-secondary"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.75rem",
                      color: "#6B7280",
                    }}
                  >
                    <span>🔒</span>
                    <span>
                      Your payment information is encrypted and secure.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-10">
              <button
                onClick={() =>
                  step === 0 ? onNavigate("cart") : setStep(step - 1)
                }
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <ChevronLeft size={14} strokeWidth={1.5} />
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 px-9 py-3.5 bg-foreground text-primary-foreground 
                  hover:bg-accent hover:text-foreground transition-colors duration-300"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Continue
                  <ChevronRight size={14} strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="px-9 py-3.5 bg-foreground text-primary-foreground hover:bg-accent 
                  hover:text-foreground transition-colors duration-300"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Place Order · €{total}
                </button>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-secondary p-6 sticky top-24">
              <h3
                className="text-foreground mb-5 pb-4 border-b border-border"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.05rem",
                  fontWeight: 400,
                }}
              >
                Order Summary
              </h3>
              <div className="space-y-4 mb-5">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-3"
                  >
                    <div
                      className="flex-shrink-0 overflow-hidden bg-muted"
                      style={{ width: "54px", aspectRatio: "3/4" }}
                    >
                      <ImageWithFallback
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p
                        className="text-foreground"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.product.name}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.72rem",
                        }}
                      >
                        Size {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <p
                      className="text-foreground"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.8rem",
                      }}
                    >
                      €{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2.5">
                <div className="flex justify-between">
                  <span
                    className="text-muted-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.8rem",
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.8rem",
                    }}
                  >
                    €{subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-muted-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.8rem",
                    }}
                  >
                    Shipping
                  </span>
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.8rem",
                    }}
                  >
                    {shipping === 0 ? "Free" : `€${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border mt-2">
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1rem",
                    }}
                  >
                    Total
                  </span>
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1rem",
                    }}
                  >
                    €{total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
