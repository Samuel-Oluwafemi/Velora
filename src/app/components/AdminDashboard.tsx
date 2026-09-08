import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart2,
  LayoutDashboard,
  Loader,
  LogOut,
  Menu as MenuIcon,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import {
  getAdminDashboardData,
  type AdminCustomer,
} from "../../services/adminDashboardService";
import type { Order } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import type { Product } from "./store";
import { OrderFilters, type OrderSort } from "./admin/OrderFilters";
import { CountUp, Reveal } from "./Motion";

const STATUS_COLORS: Record<string, string> = {
  pending: "#C8B38E",
  processing: "#6B7280",
  shipped: "#7C8F72",
  delivered: "#1A1A1A",
  cancelled: "#C0392B",
};

type Section = "dashboard" | "products" | "orders" | "customers" | "analytics";
type Customer = AdminCustomer;

function formatDate(value: unknown) {
  if (!value) return "—";
  if (typeof value === "object" && value !== null && "_seconds" in value) {
    value = new Date(Number((value as { _seconds: number })._seconds) * 1000);
  }
  const date =
    value instanceof Date
      ? value
      : typeof value === "object" && value !== null && "toDate" in value
        ? (value as { toDate: () => Date }).toDate()
        : new Date(value as string | number);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function timestampValue(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  if (value && typeof value === "object" && "_seconds" in value) {
    return Number((value as { _seconds: number })._seconds) * 1000;
  }
  const parsed = new Date(value as string | number).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function orderCustomer(order: Order) {
  const name =
    `${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim();
  return name || order.email || "Guest customer";
}

function orderTotal(order: Order) {
  return typeof order.total === "number" ? order.total : 0;
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function isPaid(order: Order) {
  return [order.paymentStatus, order.payment?.status].some(
    (status) =>
      String(status).toLowerCase() === "paid" ||
      String(status).toLowerCase() === "success",
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <p
      className="px-6 py-10 text-center text-muted-foreground"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}
    >
      {children}
    </p>
  );
}

export function AdminDashboard() {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [orderSort, setOrderSort] = useState<OrderSort>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    Promise.all([getAdminDashboardData(), getProducts()])
      .then(([dashboardData, loadedProducts]) => {
        if (!active) return;
        setOrders(dashboardData.orders);
        setProducts(loadedProducts);
        setCustomers(
          dashboardData.customers.filter(
            (customer) => customer.role !== "admin",
          ),
        );
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const paidOrders = orders.filter(isPaid);
  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + orderTotal(order),
    0,
  );
  const pendingOrders = orders.filter(
    (order) => String(order.status).toLowerCase() === "pending",
  ).length;
  const averageOrder = paidOrders.length ? totalRevenue / paidOrders.length : 0;
  const recentOrders = [...orders]
    .sort((a, b) => timestampValue(b.createdAt) - timestampValue(a.createdAt))
    .slice(0, 5);
  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase();
    const from = orderDateFrom ? new Date(orderDateFrom).getTime() : null;
    const to = orderDateTo ? new Date(orderDateTo).getTime() : null;

    return orders
      .filter((order) => {
        const status = String(order.status || "pending").toLowerCase();
        const paymentStatus = String(
          order.paymentStatus || order.payment?.status || "unknown",
        ).toLowerCase();
        const searchableText = [
          order.id,
          order.email,
          orderCustomer(order),
          ...(order.items ?? []).map((item) => item.name),
        ]
          .join(" ")
          .toLowerCase();
        const createdAt = timestampValue(order.createdAt);

        return (
          (!search || searchableText.includes(search)) &&
          (orderStatusFilter === "all" || status === orderStatusFilter) &&
          (paymentStatusFilter === "all" ||
            paymentStatus === paymentStatusFilter) &&
          (from === null || createdAt >= from) &&
          (to === null || createdAt <= to)
        );
      })
      .sort((a, b) => {
        const difference =
          timestampValue(a.createdAt) - timestampValue(b.createdAt);
        return orderSort === "newest" ? -difference : difference;
      });
  }, [
    orderDateFrom,
    orderDateTo,
    orderSearch,
    orderSort,
    orderStatusFilter,
    orders,
    paymentStatusFilter,
  ]);

  const monthlyData = useMemo(() => {
    const months = new Map<
      string,
      { month: string; revenue: number; orders: number }
    >();
    paidOrders.forEach((order) => {
      const createdAt = timestampValue(order.createdAt);
      const value = createdAt ? new Date(createdAt) : new Date(NaN);
      if (Number.isNaN(value.getTime())) return;
      const month = value.toLocaleDateString("en-US", { month: "short" });
      const entry = months.get(month) ?? { month, revenue: 0, orders: 0 };
      entry.revenue += orderTotal(order);
      entry.orders += 1;
      months.set(month, entry);
    });
    return [...months.values()];
  }, [paidOrders]);

  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  };
  const headingStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
  };
  const navItems = [
    {
      section: "dashboard" as Section,
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard",
    },
    {
      section: "products" as Section,
      icon: <Package size={16} />,
      label: "Products",
    },
    {
      section: "orders" as Section,
      icon: <ShoppingCart size={16} />,
      label: "Orders",
    },
    {
      section: "customers" as Section,
      icon: <Users size={16} />,
      label: "Customers",
    },
    {
      section: "analytics" as Section,
      icon: <BarChart2 size={16} />,
      label: "Analytics",
    },
  ];

  const Sidebar = () => (
    <aside
      className="flex flex-col h-full bg-sidebar"
      style={{ borderRight: "1px solid #E5E7EB" }}
    >
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <p
          className="tracking-[0.3em] uppercase text-foreground"
          style={{ ...headingStyle, fontSize: "1rem", fontWeight: 500 }}
        >
          VELORA
        </p>
        <button
          className="md:hidden text-muted-foreground"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>
      <p className="text-muted-foreground px-6 py-4" style={labelStyle}>
        Admin
      </p>
      <nav className="flex-1 px-4 space-y-0.5">
        {navItems.map(({ section, icon, label }) => (
          <button
            key={section}
            onClick={() => {
              setActiveSection(section);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.82rem",
              color: activeSection === section ? "#1A1A1A" : "#6B7280",
              backgroundColor:
                activeSection === section ? "#E5E1D8" : "transparent",
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-5 border-t border-border space-y-0.5">
        <button
          onClick={() => void logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-muted-foreground"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  if (loading)
    return (
      <div className="bg-background min-h-screen flex items-center justify-center gap-3 text-muted-foreground">
        <Loader size={20} className="animate-spin" />
        Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Unable to load dashboard.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-foreground text-primary-foreground"
          style={labelStyle}
        >
          Try again
        </button>
      </div>
    );

  const renderOrderRows = (items: Order[]) =>
    items.length ? (
      items.map((order, index) => {
        const status = String(order.status || "pending").toLowerCase();
        return (
          <tr
            key={order.id}
            tabIndex={0}
            role="button"
            onClick={() => setSelectedOrder(order)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedOrder(order);
              }
            }}
            className="cursor-pointer hover:bg-muted/40 transition-colors"
            style={{
              borderBottom:
                index < items.length - 1 ? "1px solid #E5E7EB" : "none",
            }}
          >
            <td
              className="px-6 py-3.5 text-foreground"
              style={{ fontSize: "0.8rem" }}
            >
              #{order.id}
            </td>
            <td
              className="px-6 py-3.5 text-foreground"
              style={{ fontSize: "0.8rem" }}
            >
              {orderCustomer(order)}
            </td>
            <td
              className="px-6 py-3.5 text-muted-foreground"
              style={{ fontSize: "0.8rem" }}
            >
              {order.items?.[0]?.name ?? "—"}
              {order.items?.length > 1 ? ` +${order.items.length - 1}` : ""}
            </td>
            <td
              className="px-6 py-3.5 text-muted-foreground"
              style={{ fontSize: "0.8rem" }}
            >
              {formatDate(order.createdAt)}
            </td>
            <td className="px-6 py-3.5">
              <span
                className="px-2.5 py-0.5"
                style={{
                  ...labelStyle,
                  fontSize: "0.65rem",
                  color: STATUS_COLORS[status] || "#6B7280",
                  border: `1px solid ${STATUS_COLORS[status] || "#E5E7EB"}`,
                }}
              >
                {status}
              </span>
            </td>
            <td
              className="px-6 py-3.5 text-foreground"
              style={{ fontSize: "0.8rem" }}
            >
              {formatNaira(orderTotal(order))}
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan={6}>
          <EmptyState>No orders yet.</EmptyState>
        </td>
      </tr>
    );

  return (
    <div className="bg-background min-h-screen flex">
      <div className="hidden md:block w-56 flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-56 h-full"
            onClick={(event) => event.stopPropagation()}
          >
            <Sidebar />
          </div>
          <div className="flex-1 bg-foreground/40" />
        </div>
      )}
      <main className="flex-1 overflow-auto">
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-8 py-4 bg-background"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={18} />
            </button>
            <p
              className="text-foreground capitalize"
              style={{ ...headingStyle, fontSize: "1.3rem" }}
            >
              {activeSection}
            </p>
          </div>
          <span
            className="text-muted-foreground"
            style={{ fontSize: "0.8rem" }}
          >
            Admin
          </span>
        </div>
        <div className="p-6 md:p-8">
          {activeSection === "dashboard" && (
            <Reveal className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: totalRevenue, prefix: "₦" },
                  { label: "Total Orders", value: orders.length },
                  {
                    label: "Avg. Order Value",
                    value: Math.round(averageOrder),
                    prefix: "₦",
                  },
                  { label: "Pending Orders", value: pendingOrders },
                ].map((kpi, index) => (
                  <Reveal key={kpi.label} delay={index * 0.08}>
                    <div
                      className="group bg-secondary p-5 transition-colors duration-300 hover:border-accent"
                      style={{ border: "1px solid #E5E7EB" }}
                    >
                      <p
                        className="text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        {kpi.label}
                      </p>
                      <p
                        className="text-foreground"
                        style={{ ...headingStyle, fontSize: "1.7rem" }}
                      >
                        {kpi.prefix}
                        <CountUp value={kpi.value} />
                      </p>
                      <div
                        className="flex items-center gap-1 mt-2 text-muted-foreground"
                        style={{ fontSize: "0.72rem" }}
                      >
                        <ArrowUpRight size={12} />
                        Live Firestore data
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div
                className="bg-secondary p-6"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={14} className="text-muted-foreground" />
                  <p style={{ ...headingStyle, fontSize: "1.05rem" }}>
                    Revenue
                  </p>
                </div>
                {monthlyData.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E5E7EB"
                        vertical={false}
                      />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `₦${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatNaira(value),
                          "Revenue",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C8B38E"
                        fill="#C8B38E"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState>No paid orders yet.</EmptyState>
                )}
              </div>
              <Reveal delay={0.18}>
                <div
                  className="bg-secondary"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <p style={{ ...headingStyle, fontSize: "1.05rem" }}>
                      Recent Orders
                    </p>
                    <button
                      onClick={() => setActiveSection("orders")}
                      className="text-muted-foreground"
                      style={labelStyle}
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          {[
                            "Order",
                            "Customer",
                            "Product",
                            "Date",
                            "Status",
                            "Total",
                          ].map((header) => (
                            <th
                              key={header}
                              className="text-left px-6 py-3 text-muted-foreground"
                              style={labelStyle}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>{renderOrderRows(recentOrders)}</tbody>
                    </table>
                  </div>
                </div>
              </Reveal>
            </Reveal>
          )}

          {activeSection === "products" && (
            <div>
              <p
                className="text-muted-foreground mb-6"
                style={{ fontSize: "0.82rem" }}
              >
                {products.length} products
              </p>
              <div
                className="bg-secondary overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr>
                        {["Product", "Category", "Price", "Sizes", "Tag"].map(
                          (header) => (
                            <th
                              key={header}
                              className="text-left px-6 py-3 text-muted-foreground"
                              style={labelStyle}
                            >
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {products.length ? (
                        products.map((product, index) => (
                          <tr
                            key={product.id}
                            style={{
                              borderBottom:
                                index < products.length - 1
                                  ? "1px solid #E5E7EB"
                                  : "none",
                            }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {product.images[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-10 h-12 object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-12 bg-muted" />
                                )}
                                <span style={{ fontSize: "0.82rem" }}>
                                  {product.name}
                                </span>
                              </div>
                            </td>
                            <td
                              className="px-6 py-4 text-muted-foreground"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {product.category}
                            </td>
                            <td
                              className="px-6 py-4"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {formatNaira(product.price)}
                            </td>
                            <td
                              className="px-6 py-4 text-muted-foreground"
                              style={{ fontSize: "0.78rem" }}
                            >
                              {product.sizes.join(", ") || "—"}
                            </td>
                            <td
                              className="px-6 py-4 text-muted-foreground"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {product.tag || "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>
                            <EmptyState>No products found.</EmptyState>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div>
              <OrderFilters
                search={orderSearch}
                status={orderStatusFilter}
                paymentStatus={paymentStatusFilter}
                dateFrom={orderDateFrom}
                dateTo={orderDateTo}
                sort={orderSort}
                filteredCount={filteredOrders.length}
                totalCount={orders.length}
                setSearch={setOrderSearch}
                setStatus={setOrderStatusFilter}
                setPaymentStatus={setPaymentStatusFilter}
                setDateFrom={setOrderDateFrom}
                setDateTo={setOrderDateTo}
                setSort={setOrderSort}
              />
              {selectedOrder && (
                <section
                  className="bg-secondary p-6 mb-6"
                  style={{ border: "1px solid #E5E7EB" }}
                  aria-label={`Order details for ${selectedOrder.id}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-muted-foreground" style={labelStyle}>
                        Order details
                      </p>
                      <h2
                        className="text-foreground"
                        style={{ ...headingStyle, fontSize: "1.6rem" }}
                      >
                        #{selectedOrder.id}
                      </h2>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Close order details"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p
                        className="text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        Customer
                      </p>
                      <p
                        className="text-foreground"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {orderCustomer(selectedOrder)}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {selectedOrder.email || "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        Shipping address
                      </p>
                      <p
                        className="text-foreground"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {selectedOrder.shippingAddress?.address || "—"}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {[
                          selectedOrder.shippingAddress?.city,
                          selectedOrder.shippingAddress?.postcode,
                          selectedOrder.shippingAddress?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-muted-foreground mb-2"
                        style={labelStyle}
                      >
                        Payment
                      </p>
                      <p
                        className="text-foreground"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Status:{" "}
                        {selectedOrder.paymentStatus ||
                          selectedOrder.payment?.status ||
                          "—"}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Reference: {selectedOrder.payment?.reference || "—"}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Channel: {selectedOrder.payment?.channel || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p
                      className="text-muted-foreground mb-3"
                      style={labelStyle}
                    >
                      Products
                    </p>
                    <div className="space-y-3">
                      {selectedOrder.items?.length ? (
                        selectedOrder.items.map((item) => (
                          <div
                            key={`${item.productId}-${item.size}`}
                            className="flex items-center justify-between gap-4"
                            style={{ fontSize: "0.82rem" }}
                          >
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-10 h-12 object-cover bg-muted"
                                />
                              ) : (
                                <div className="w-10 h-12 bg-muted" />
                              )}
                              <div>
                                <p className="text-foreground">{item.name}</p>
                                <p className="text-muted-foreground">
                                  Size {item.size || "—"} · Qty {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="text-foreground">
                              {formatNaira(item.price * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p
                          className="text-muted-foreground"
                          style={{ fontSize: "0.82rem" }}
                        >
                          No items recorded.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-border mt-5 pt-4">
                    <div className="text-right" style={{ fontSize: "0.82rem" }}>
                      <p className="text-muted-foreground">
                        Subtotal: {formatNaira(selectedOrder.subtotal || 0)}
                      </p>
                      <p className="text-muted-foreground">
                        Shipping: {formatNaira(selectedOrder.shipping || 0)}
                      </p>
                      <p
                        className="text-foreground mt-1"
                        style={{ fontWeight: 500 }}
                      >
                        Total: {formatNaira(orderTotal(selectedOrder))}
                      </p>
                    </div>
                  </div>
                </section>
              )}
              <div
                className="bg-secondary overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {[
                          "Order ID",
                          "Customer",
                          "Product",
                          "Date",
                          "Status",
                          "Total",
                        ].map((header) => (
                          <th
                            key={header}
                            className="text-left px-6 py-3 text-muted-foreground"
                            style={labelStyle}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{renderOrderRows(filteredOrders)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === "customers" && (
            <div>
              <p
                className="text-muted-foreground mb-6"
                style={{ fontSize: "0.82rem" }}
              >
                {customers.length} customers
              </p>
              <div
                className="bg-secondary overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr>
                        {[
                          "Name",
                          "Email",
                          "Orders",
                          "Total Spend",
                          "Member Since",
                        ].map((header) => (
                          <th
                            key={header}
                            className="text-left px-6 py-3 text-muted-foreground"
                            style={labelStyle}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length ? (
                        customers.map((customer, index) => {
                          const customerOrders = orders.filter(
                            (order) => order.userId === customer.id,
                          );
                          return (
                            <tr
                              key={customer.id}
                              style={{
                                borderBottom:
                                  index < customers.length - 1
                                    ? "1px solid #E5E7EB"
                                    : "none",
                              }}
                            >
                              <td
                                className="px-6 py-4"
                                style={{ fontSize: "0.82rem" }}
                              >
                                {customer.name}
                              </td>
                              <td
                                className="px-6 py-4 text-muted-foreground"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {customer.email}
                              </td>
                              <td
                                className="px-6 py-4"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {customerOrders.length}
                              </td>
                              <td
                                className="px-6 py-4"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {formatNaira(
                                  customerOrders
                                    .filter(isPaid)
                                    .reduce(
                                      (sum, order) => sum + orderTotal(order),
                                      0,
                                    ),
                                )}
                              </td>
                              <td
                                className="px-6 py-4 text-muted-foreground"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {formatDate(customer.joined)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5}>
                            <EmptyState>No customers found.</EmptyState>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="bg-secondary p-6"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <p style={{ ...headingStyle, fontSize: "1.05rem" }}>
                    Monthly Orders
                  </p>
                  {monthlyData.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#E5E7EB"
                          vertical={false}
                        />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#C8B38E" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState>No orders yet.</EmptyState>
                  )}
                </div>
                <div
                  className="bg-secondary p-6"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <p
                    className="mb-5"
                    style={{ ...headingStyle, fontSize: "1.05rem" }}
                  >
                    Performance
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Paid orders: {paidOrders.length}
                  </p>
                  <p
                    className="text-muted-foreground mt-3"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Average order value: {formatNaira(Math.round(averageOrder))}
                  </p>
                  <p
                    className="text-muted-foreground mt-3"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Customers: {customers.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
