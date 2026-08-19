import { useState, useEffect } from "react";
import { ShoppingBag, User, Menu, X } from "lucide-react";

interface NavbarProps {
  cartCount: number;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ cartCount, onNavigate, currentPage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Shop", page: "shop" },
    { label: "Collection", page: "collection" },
    { label: "About", page: "about" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(248,246,242,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled ? "1px solid #E5E7EB" : "1px solid transparent",
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="text-foreground tracking-[0.25em] uppercase cursor-pointer "
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.15rem",
            fontWeight: 500,
            letterSpacing: "0.3em",
          }}
        >
          VELORA
        </button>

        {/* Center Nav — desktop */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer 
              duration-200 hover:text-yellow-800/60"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => onNavigate("account")}
            className="hidden md:flex text-foreground/70 hover:text-foreground transition-colors 
            cursor-pointer hover:text-yellow-800/60"
            aria-label="Account"
          >
            <User size={18} strokeWidth={1.5} />
          </button>

          {/* Cart */}
          <button
            onClick={() => onNavigate("cart")}
            className="relative text-foreground/70 hover:text-foreground transition-colors cursor-pointer 
            duration-200 hover:text-yellow-800/60"
            aria-label={`Cart (${cartCount} items)`}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full text-primary-foreground"
                style={{
                  backgroundColor: "#C8B38E",
                  fontSize: "0.6rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-foreground/70 hover:text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={20} strokeWidth={1.5} />
            ) : (
              <Menu size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => {
                onNavigate(link.page);
                setMenuOpen(false);
              }}
              className="text-left text-foreground/80 hover:text-foreground transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate("account");
              setMenuOpen(false);
            }}
            className="text-left text-foreground/80 hover:text-foreground transition-colors"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Account
          </button>
        </div>
      )}
    </nav>
  );
}
