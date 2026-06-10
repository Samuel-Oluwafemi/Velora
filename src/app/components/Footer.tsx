interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-foreground text-primary-foreground mt-24">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="md:col-span-1">
            <p
              className="tracking-[0.3em] uppercase mb-4 text-primary-foreground"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 500 }}
            >
              VELORA
            </p>
            <p
              className="text-primary-foreground/50 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", maxWidth: "18ch" }}
            >
              Designed with intention. Made to last.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p
              className="text-primary-foreground/40 uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem" }}
            >
              Shop
            </p>
            {["New Arrivals", "All Products", "Outerwear", "Knitwear", "Dresses"].map((item) => (
              <button
                key={item}
                onClick={() => onNavigate("shop")}
                className="block text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-2.5"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Company */}
          <div>
            <p
              className="text-primary-foreground/40 uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem" }}
            >
              Company
            </p>
            {["About Us", "Sustainability", "Careers", "Press"].map((item) => (
              <button
                key={item}
                onClick={() => onNavigate("about")}
                className="block text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-2.5"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Support */}
          <div>
            <p
              className="text-primary-foreground/40 uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem" }}
            >
              Support
            </p>
            {["Shipping & Returns", "Size Guide", "Care Instructions", "Contact"].map((item) => (
              <p
                key={item}
                className="block text-primary-foreground/70 mb-2.5"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
              >
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p
            className="text-primary-foreground/30"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}
          >
            © 2026 VELORA. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <p
                key={item}
                className="text-primary-foreground/30"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
