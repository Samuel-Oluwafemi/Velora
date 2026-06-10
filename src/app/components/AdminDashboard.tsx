import { useState } from "react";
import { PRODUCTS } from "./store";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  LogOut,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Menu as MenuIcon,
  X,
} from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 12400, orders: 38 },
  { month: "Feb", revenue: 15200, orders: 47 },
  { month: "Mar", revenue: 18900, orders: 58 },
  { month: "Apr", revenue: 14300, orders: 44 },
  { month: "May", revenue: 22100, orders: 68 },
  { month: "Jun", revenue: 28400, orders: 87 },
];

const recentOrders = [
  { id: "#VL-2241", customer: "Camille Moreau", product: "Structured Wool Coat", date: "10 Jun 2026", status: "Shipped", total: 485 },
  { id: "#VL-2240", customer: "Léa Fontaine", product: "Silk Slip Dress", date: "10 Jun 2026", status: "Processing", total: 320 },
  { id: "#VL-2239", customer: "Sophie Blanc", product: "Merino Turtleneck", date: "9 Jun 2026", status: "Delivered", total: 175 },
  { id: "#VL-2238", customer: "Antoine Girard", product: "Tailored Blazer", date: "9 Jun 2026", status: "Delivered", total: 355 },
  { id: "#VL-2237", customer: "Emma Laurent", product: "High-Waist Trousers", date: "8 Jun 2026", status: "Shipped", total: 215 },
  { id: "#VL-2236", customer: "Clara Petit", product: "Cashmere Cardigan", date: "8 Jun 2026", status: "Cancelled", total: 395 },
];

const customers = [
  { name: "Camille Moreau", email: "camille.moreau@gmail.com", orders: 7, total: 2840, joined: "Jan 2025" },
  { name: "Léa Fontaine", email: "lea@fontaine.fr", orders: 4, total: 1460, joined: "Mar 2025" },
  { name: "Sophie Blanc", email: "sblancparis@icloud.com", orders: 9, total: 3870, joined: "Oct 2024" },
  { name: "Antoine Girard", email: "antoine.girard@velora.fr", orders: 3, total: 995, joined: "May 2025" },
  { name: "Emma Laurent", email: "emma.l@protonmail.com", orders: 6, total: 2215, joined: "Feb 2025" },
];

const STATUS_COLORS: Record<string, string> = {
  Shipped: "#C8B38E",
  Processing: "#6B7280",
  Delivered: "#1A1A1A",
  Cancelled: "#c0392b",
};

type Section = "dashboard" | "products" | "orders" | "customers" | "analytics";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { section: Section; icon: React.ReactNode; label: string }[] = [
    { section: "dashboard", icon: <LayoutDashboard size={16} strokeWidth={1.5} />, label: "Dashboard" },
    { section: "products", icon: <Package size={16} strokeWidth={1.5} />, label: "Products" },
    { section: "orders", icon: <ShoppingCart size={16} strokeWidth={1.5} />, label: "Orders" },
    { section: "customers", icon: <Users size={16} strokeWidth={1.5} />, label: "Customers" },
    { section: "analytics", icon: <BarChart2 size={16} strokeWidth={1.5} />, label: "Analytics" },
  ];

  const labelStyle = { fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" as const };
  const headingStyle = { fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 };

  const Sidebar = () => (
    <aside
      className="flex flex-col h-full bg-sidebar"
      style={{ borderRight: "1px solid #E5E7EB" }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <p
          className="tracking-[0.3em] uppercase text-foreground"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 500 }}
        >
          VELORA
        </p>
        <button
          className="md:hidden text-muted-foreground"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-4 py-2 mt-2">
        <p className="text-muted-foreground px-2 mb-2" style={labelStyle}>Admin</p>
      </div>

      <nav className="flex-1 px-4 space-y-0.5">
        {navItems.map(({ section, icon, label }) => (
          <button
            key={section}
            onClick={() => { setActiveSection(section); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors duration-150"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.82rem",
              color: activeSection === section ? "#1A1A1A" : "#6B7280",
              backgroundColor: activeSection === section ? "#E5E1D8" : "transparent",
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-border space-y-0.5">
        <button
          onClick={() => onNavigate("home")}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}
        >
          <Eye size={16} strokeWidth={1.5} />
          View Store
        </button>
        <button
          onClick={() => onNavigate("home")}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="bg-background min-h-screen flex">
      {/* Sidebar — desktop */}
      <div className="hidden md:block w-56 flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="w-56 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
          <div className="flex-1 bg-foreground/40" />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-8 py-4 bg-background"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon size={18} strokeWidth={1.5} />
            </button>
            <p className="text-foreground capitalize" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 300 }}>
              {activeSection}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#1A1A1A" }}>A</span>
            </div>
            <span className="hidden md:block text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>
              Admin
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">

          {/* DASHBOARD */}
          {activeSection === "dashboard" && (
            <div>
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Revenue", value: "€111,300", change: "+18%", up: true },
                  { label: "Total Orders", value: "342", change: "+12%", up: true },
                  { label: "Avg. Order Value", value: "€325", change: "+5%", up: true },
                  { label: "Return Rate", value: "3.2%", change: "-0.4%", up: false },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-secondary p-5" style={{ border: "1px solid #E5E7EB" }}>
                    <p className="text-muted-foreground mb-2" style={labelStyle}>{kpi.label}</p>
                    <p className="text-foreground mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 300 }}>
                      {kpi.value}
                    </p>
                    <div className="flex items-center gap-1">
                      {kpi.up
                        ? <ArrowUpRight size={12} strokeWidth={2} style={{ color: "#C8B38E" }} />
                        : <ArrowDownRight size={12} strokeWidth={2} style={{ color: "#c0392b" }} />
                      }
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: kpi.up ? "#C8B38E" : "#c0392b" }}>
                        {kpi.change} this month
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue chart */}
              <div className="bg-secondary p-6 mb-6" style={{ border: "1px solid #E5E7EB" }}>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={14} strokeWidth={1.5} className="text-muted-foreground" />
                  <p className="text-foreground" style={{ ...headingStyle, fontSize: "1.05rem" }}>Revenue — 2026</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C8B38E" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#C8B38E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", border: "1px solid #E5E7EB", background: "#F8F6F2" }}
                      formatter={(v: number) => [`€${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#C8B38E" strokeWidth={1.5} fill="url(#revenueGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent orders */}
              <div className="bg-secondary" style={{ border: "1px solid #E5E7EB" }}>
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <p className="text-foreground" style={{ ...headingStyle, fontSize: "1.05rem" }}>Recent Orders</p>
                  <button
                    onClick={() => setActiveSection("orders")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    style={labelStyle}
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                        {["Order", "Customer", "Product", "Date", "Status", "Total"].map((h) => (
                          <th key={h} className="text-left px-6 py-3 text-muted-foreground" style={labelStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.slice(0, 4).map((order, i) => (
                        <tr key={order.id} style={{ borderBottom: i < 3 ? "1px solid #E5E7EB" : "none" }}>
                          <td className="px-6 py-3.5 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{order.id}</td>
                          <td className="px-6 py-3.5 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{order.customer}</td>
                          <td className="px-6 py-3.5 text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{order.product}</td>
                          <td className="px-6 py-3.5 text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{order.date}</td>
                          <td className="px-6 py-3.5">
                            <span
                              className="px-2.5 py-0.5"
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.68rem",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: STATUS_COLORS[order.status] || "#6B7280",
                                border: `1px solid ${STATUS_COLORS[order.status] || "#E5E7EB"}`,
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>€{order.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {activeSection === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}>
                  {PRODUCTS.length} products
                </p>
                <button
                  className="px-5 py-2.5 bg-foreground text-primary-foreground hover:bg-accent hover:text-foreground transition-colors"
                  style={labelStyle}
                >
                  + Add Product
                </button>
              </div>

              <div className="bg-secondary overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                        {["Product", "Category", "Price", "Sizes", "Tag"].map((h) => (
                          <th key={h} className="text-left px-6 py-3 text-muted-foreground" style={labelStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCTS.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: i < PRODUCTS.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 overflow-hidden flex-shrink-0 bg-muted">
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}>{p.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{p.category}</td>
                          <td className="px-6 py-4 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>€{p.price}</td>
                          <td className="px-6 py-4 text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem" }}>{p.sizes.join(", ")}</td>
                          <td className="px-6 py-4">
                            {p.tag ? (
                              <span
                                className="px-2.5 py-0.5 bg-foreground text-primary-foreground"
                                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
                              >
                                {p.tag}
                              </span>
                            ) : (
                              <span className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeSection === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}>
                  {recentOrders.length} orders
                </p>
                <div className="flex items-center gap-2">
                  {["All", "Processing", "Shipped", "Delivered"].map((s) => (
                    <button
                      key={s}
                      className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                      style={labelStyle}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-secondary overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                        {["Order ID", "Customer", "Product", "Date", "Status", "Total"].map((h) => (
                          <th key={h} className="text-left px-6 py-3 text-muted-foreground" style={labelStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, i) => (
                        <tr key={order.id} className="hover:bg-muted/40 transition-colors" style={{ borderBottom: i < recentOrders.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                          <td className="px-6 py-4 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 500 }}>{order.id}</td>
                          <td className="px-6 py-4 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{order.customer}</td>
                          <td className="px-6 py-4 text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{order.product}</td>
                          <td className="px-6 py-4 text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{order.date}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-2.5 py-0.5"
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.68rem",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: STATUS_COLORS[order.status] || "#6B7280",
                                border: `1px solid ${STATUS_COLORS[order.status] || "#E5E7EB"}`,
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>€{order.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {activeSection === "customers" && (
            <div>
              <p className="text-muted-foreground mb-6" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}>
                {customers.length} customers
              </p>
              <div className="bg-secondary overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                        {["Name", "Email", "Orders", "Total Spend", "Member Since"].map((h) => (
                          <th key={h} className="text-left px-6 py-3 text-muted-foreground" style={labelStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <tr key={c.email} style={{ borderBottom: i < customers.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: "#C8B38E" }}
                              >
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#1A1A1A" }}>
                                  {c.name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}>{c.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{c.email}</td>
                          <td className="px-6 py-4 text-foreground text-center" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{c.orders}</td>
                          <td className="px-6 py-4 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>€{c.total.toLocaleString()}</td>
                          <td className="px-6 py-4 text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>{c.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Orders chart */}
                <div className="bg-secondary p-6" style={{ border: "1px solid #E5E7EB" }}>
                  <p className="text-foreground mb-5" style={{ ...headingStyle, fontSize: "1.05rem" }}>Monthly Orders</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", border: "1px solid #E5E7EB", background: "#F8F6F2" }}
                        formatter={(v: number) => [v, "Orders"]}
                      />
                      <Bar dataKey="orders" fill="#C8B38E" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top products */}
                <div className="bg-secondary p-6" style={{ border: "1px solid #E5E7EB" }}>
                  <p className="text-foreground mb-5" style={{ ...headingStyle, fontSize: "1.05rem" }}>Top Products</p>
                  <div className="space-y-3.5">
                    {PRODUCTS.slice(0, 5).map((p) => {
                      const salesPct = Math.floor(Math.random() * 40) + 30;
                      return (
                        <div key={p.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem" }}>{p.name}</span>
                            <span className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}>{salesPct}%</span>
                          </div>
                          <div className="w-full bg-border h-1">
                            <div className="h-1 transition-all" style={{ width: `${salesPct}%`, backgroundColor: "#C8B38E" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Revenue detail */}
              <div className="bg-secondary p-6" style={{ border: "1px solid #E5E7EB" }}>
                <p className="text-foreground mb-5" style={{ ...headingStyle, fontSize: "1.05rem" }}>Revenue Breakdown — H1 2026</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", border: "1px solid #E5E7EB", background: "#F8F6F2" }}
                      formatter={(v: number) => [`€${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#1A1A1A" strokeWidth={1.5} fill="url(#revenueGrad2)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
