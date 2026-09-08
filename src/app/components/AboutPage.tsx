import { FAQs } from "./FAQs";
import { Footer } from "./Footer";
import featuredImage from "../../assets/images/Relaxed.png";
import { Reveal } from "./Motion";

export function AboutPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="bg-background min-h-screen">
      <div className="relative flex min-h-[440px] items-end overflow-hidden md:min-h-[560px]">
        <img src={featuredImage} alt="About VELORA editorial" className="absolute inset-0 h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,26,26,0.04),rgba(26,26,26,0.58))]" />
        <div className="relative mx-auto w-full max-w-screen-xl px-6 pb-12 md:px-12 md:pb-16">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-primary-foreground/70">Our Story</p>
          <h1 className="max-w-[12ch] text-primary-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 0.95 }}>
            Built on conviction.
          </h1>
        </div>
      </div>
      <Reveal className="mx-auto max-w-screen-md px-6 py-20 md:px-12 md:py-28">
        <p className="mb-9 text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 300, lineHeight: 1.18 }}>
          We started VELORA because we were tired of buying things we did not love.
        </p>
        <div className="space-y-5 text-sm leading-7 text-muted-foreground">
          <p>Every piece we design is something we would wear for ten years. We work with artisan mills in Italy, Portugal, and Japan, producing in small batches with materials that improve with age.</p>
          <p>We believe fashion is at its most powerful when it is invisible, when you stop thinking about what you are wearing and start focusing on what you are doing.</p>
        </div>
        <button onClick={() => onNavigate("shop")} className="mt-10 border-b border-foreground/40 pb-1 text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent hover:text-accent">
          Shop the collection
        </button>
      </Reveal>
      <section className="mx-auto max-w-screen-xl px-6 py-6 md:px-12 md:py-20"><FAQs /></section>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
