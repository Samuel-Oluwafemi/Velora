import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createOrder } from "../../services/orderService";
import { CartItem } from "./store";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import Paystack from "@paystack/inline-js";

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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    country: "Nigeria",
  });

  const subtotal = cartItems.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );
  const shipping = subtotal > 300000 ? 0 : 12000;
  const total = subtotal + shipping;

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setValidationError(null);
  };

  //
  const validateStep = () => {
  setValidationError(null);

  if (step === 0) {
    if (
      !form.email.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim()
    ) {
      setValidationError("Please complete all contact information.");
      return false;
    }

    if (!form.email.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return false;
    }
  }

  if (step === 1) {
    if (
      !form.address.trim() ||
      !form.city.trim() ||
      !form.postcode.trim() ||
      !form.country.trim()
    ) {
      setValidationError("Please complete all shipping information.");
      return false;
    }
  }

  return true;
};

  // Create the order when the user clicks "Place Order"
  const handlePlaceOrder = async () => {
    if (!user) {
      setOrderError("You must be logged in to place an order.");
      return;
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("Paystack public key is missing.");
      }

      const paystack = new Paystack();

      paystack.newTransaction({
        key: publicKey,

        email: form.email,

        amount: total * 100,

        currency: "NGN",

        firstName: form.firstName,

        lastName: form.lastName,

        reference: `VELORA-${Date.now()}`,

        onSuccess: async (transaction) => {
          try {
            console.log("Payment successful:", transaction);

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

            console.log("Order created:", orderId);

            setOrderId(orderId);

            onOrderComplete();
            setCompleted(true);
          } catch (error) {
            console.error("Failed to create order:", error);

            setOrderError(
              "Payment was successful, but we couldn't create your order. Please contact us.",
            );
          } finally {
            setOrderLoading(false);
          }
        },

        onCancel: () => {
          console.log("Payment cancelled.");

          setOrderError("Payment was cancelled.");
          setOrderLoading(false);
        },
      });
    } catch (error) {
      console.error("Failed to initialize Paystack:", error);

      setOrderError("We couldn't initialize payment. Please try again.");

      setOrderLoading(false);
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
        {/*  */}
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
          {/* Order Number */}
          {orderId && (
            <div
              className="mb-6 px-5 py-4 border border-border bg-secondary"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <p
                className="text-muted-foreground uppercase tracking-[0.15em] mb-1"
                style={{
                  fontSize: "0.65rem",
                }}
              >
                Order Number
              </p>

              <p
                className="text-foreground"
                style={{
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                }}
              >
                #{orderId}
              </p>
            </div>
          )}
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
                      required
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
                        required
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
                        required
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
                        "Nigeria",
                        "Ghana",
                        "Kenya",
                        "South Africa",
                        "United Kingdom",
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

                <div
                  className="border border-border bg-secondary p-6"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">🔒</div>

                    <div>
                      <p
                        className="text-foreground mb-2"
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        }}
                      >
                        Secure payment with Paystack
                      </p>

                      <p
                        className="text-muted-foreground"
                        style={{
                          fontSize: "0.75rem",
                          lineHeight: 1.6,
                        }}
                      >
                        You'll complete your payment securely through Paystack.
                        Your card details are entered directly on Paystack's
                        secure checkout and are not stored by Velora.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border mt-5 pt-5">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-muted-foreground"
                        style={{
                          fontSize: "0.75rem",
                        }}
                      >
                        Amount to pay
                      </span>

                      <span
                        className="text-foreground"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.25rem",
                        }}
                      >
                        ₦{total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Validate error */}
            {validationError && (
              <div
                className="mt-6 p-4 border border-red-200 bg-red-50 text-red-700"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                {validationError}
              </div>
            )}

            {/* Order error */}
            {orderError && (
              <div
                className="mt-6 p-4 border border-red-200 bg-red-50 text-red-700"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                {orderError}
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
                  onClick={() => {
                    if (validateStep()) {
                      setStep(step + 1);
                    }
                  }}
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
                  onClick={() => {
                    if (validateStep()) {
                      void handlePlaceOrder();
                    }
                  }}
                  disabled={orderLoading}
                  className="px-9 py-3.5 bg-foreground text-primary-foreground hover:bg-accent 
                  hover:text-foreground transition-colors duration-300 cursor-pointer duration-300 
                  disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  {orderLoading
                    ? "Placing Order..."
                    : `Place Order · ₦${total}`}
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
                    {/* Product Details */}
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
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {/* Order Totals */}
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
                    ₦{subtotal}
                  </span>
                </div>
                {/* Shipping */}
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
                    {shipping === 0 ? "Free" : `₦${shipping}`}
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
                    ₦{total}
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
