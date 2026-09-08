import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Loader,
  LogOut,
  Package,
  ShoppingBag,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserOrders, type Order } from "../../../services/orderService";
import { Reveal } from "../Motion";

function formatDate(value: unknown) {
  if (!value) return "Date pending";
  const date =
    value && typeof value === "object" && "_seconds" in value
      ? new Date(Number((value as { _seconds: number })._seconds) * 1000)
      : value && typeof value === "object" && "toDate" in value
        ? (value as { toDate: () => Date }).toDate()
        : new Date(value as string | number);
  return Number.isNaN(date.getTime())
    ? "Date pending"
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function statusIcon(status: string) {
  const normalized = status.toLowerCase();
  return normalized === "delivered" ? (
    <Check size={15} />
  ) : normalized === "processing" || normalized === "shipped" ? (
    <Package size={15} />
  ) : (
    <Clock3 size={15} />
  );
}

export default function AccountDashboard() {
  const { user, logout } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      setOrdersLoading(false);
      return;
    }

    void Promise.all([
      getDoc(doc(db, "users", user.uid)),
      getUserOrders(user.uid),
    ])
      .then(([userDoc, userOrders]) => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(typeof data.name === "string" ? data.name : null);
        }
        setOrders(userOrders as Order[]);
      })
      .catch((error) => {
        console.error("Failed to load account dashboard:", error);
        setOrdersError("We could not load your orders right now.");
      })
      .finally(() => {
        setLoadingProfile(false);
        setOrdersLoading(false);
      });
  }, [user]);

  const firstName = name?.split(" ")[0] || "there";
  const totalSpent = orders.reduce(
    (sum, order) => sum + (typeof order.total === "number" ? order.total : 0),
    0,
  );
  const activeOrders = orders.filter(
    (order) =>
      !["delivered", "cancelled"].includes(String(order.status).toLowerCase()),
  ).length;
  const recentOrders = [...orders].slice(0, 3);

  return (
    <div className="w-full text-left">
      <Reveal>
        <div className="flex flex-col gap-5 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Your account
            </p>
            <h2
              className="text-foreground"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                lineHeight: 1,
              }}
            >
              Welcome back{firstName !== "there" ? `, ${firstName}` : ""}.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground md:self-auto"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Orders placed",
            value: orders.length,
            icon: <ShoppingBag size={16} />,
          },
          {
            label: "In progress",
            value: activeOrders,
            icon: <Package size={16} />,
          },
          {
            label: "Total spent",
            value: formatNaira(totalSpent),
            icon: <span className="text-base">₦</span>,
          },
        ].map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.07}>
            <div className="border border-border bg-secondary p-5">
              <div className="mb-5 flex items-center justify-between text-accent">
                {stat.icon}
              </div>
              <p
                className="text-2xl text-foreground"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.12}>
        <div className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Your history
              </p>
              <h3
                className="text-foreground"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.65rem",
                  fontWeight: 300,
                }}
              >
                Recent orders
              </h3>
            </div>
            {orders.length > 3 && (
              <span className="text-xs text-muted-foreground">
                Showing latest 3
              </span>
            )}
          </div>

          {ordersLoading && (
            <div className="flex items-center gap-3 border border-border px-5 py-8 text-sm text-muted-foreground">
              <Loader size={17} className="animate-spin" /> Loading your
              orders...
            </div>
          )}
          {ordersError && (
            <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {ordersError}
            </div>
          )}
          {!ordersLoading && !ordersError && recentOrders.length === 0 && (
            <div className="border border-border px-6 py-10 text-center">
              <ShoppingBag className="mx-auto mb-4 text-accent" size={22} />
              <p className="text-sm text-muted-foreground">
                Your first considered piece is still waiting.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Explore the collection when you are ready.
              </p>
            </div>
          )}
          {!ordersLoading && !ordersError && recentOrders.length > 0 && (
            <div className="space-y-3">
              {recentOrders.map((order, index) => {
                const status = String(order.status || "pending");
                return (
                  <Reveal key={order.id} delay={index * 0.06}>
                    <div className="border border-border p-5 transition-colors hover:border-accent">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
                            Order #{order.id}
                          </p>
                          <p className="mt-2 text-sm text-foreground">
                            {order.items?.length || 0}{" "}
                            {(order.items?.length || 0) === 1
                              ? "piece"
                              : "pieces"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          {statusIcon(status)} {status}
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-sm text-foreground">
                          {formatNaira(order.total || 0)}
                        </span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-7">
        <p className="w-full text-xs text-muted-foreground">
          Need another piece for the rotation?
        </p>
        <a
          href="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-foreground transition-colors hover:text-accent"
        >
          Continue shopping <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
