import { useEffect, useState } from "react";

const SESSION_KEY = "velora-intro-seen";

function isFirstVisitThisTab() {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "true";
  } catch {
    return false;
  }
}

export function HomepageIntro() {
  const [visible, setVisible] = useState(isFirstVisitThisTab);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // The intro remains limited to this mounted app when session storage is unavailable.
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reducedMotion ? 900 : 2400;
    let intervalId: number | undefined;
    let exitTimerId: number | undefined;
    let removeTimerId: number | undefined;

    const startTimerId = window.setTimeout(() => {
      const startedAt = performance.now();
      intervalId = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        const easedProgress = Math.min(100, (elapsed / duration) * 100);
        setProgress(Math.floor(easedProgress));

        if (easedProgress >= 100) {
          if (intervalId !== undefined) window.clearInterval(intervalId);
          setProgress(100);
          exitTimerId = window.setTimeout(() => {
            setExiting(true);
            removeTimerId = window.setTimeout(
              () => setVisible(false),
              reducedMotion ? 0 : 850,
            );
          }, 450);
        }
      }, 24);
    }, reducedMotion ? 100 : 450);

    return () => {
      window.clearTimeout(startTimerId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
      if (exitTimerId !== undefined) window.clearTimeout(exitTimerId);
      if (removeTimerId !== undefined) window.clearTimeout(removeTimerId);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex min-h-[100svh] flex-col items-center justify-center bg-[#171714] px-6 text-[#F8F6F2] transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none ${
        exiting ? "-translate-y-full" : "translate-y-0"
      }`}
      aria-label="VELORA introduction"
      aria-live="polite"
    >
      <div className="absolute left-6 right-6 top-8 flex items-center justify-between sm:left-10 sm:right-10 sm:top-10">
        <span className="text-[0.58rem] uppercase tracking-[0.22em] text-[#c8b38e]/70">
          Considered essentials
        </span>
        <span className="text-[0.58rem] uppercase tracking-[0.22em] text-[#c8b38e]/70">
          Est. 2026
        </span>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center">
        <p
          className="text-[clamp(3.4rem,12vw,6.5rem)] font-light leading-none tracking-[0.16em]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          VELORA
        </p>
        <p className="mt-5 text-[0.62rem] uppercase tracking-[0.32em] text-[#c8b38e]">
          Dress with intention
        </p>

        <div
          className="mt-14 w-full"
          role="progressbar"
          aria-label="VELORA introduction"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="h-px w-full overflow-hidden bg-white/15">
            <div
              className="h-full bg-[#c8b38e] transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[0.58rem] uppercase tracking-[0.18em] text-white/45">
            <span>Opening the collection</span>
            <span>{progress.toString().padStart(2, "0")}%</span>
          </div>
        </div>
      </div>

      <span className="absolute bottom-8 text-[0.55rem] uppercase tracking-[0.24em] text-white/35 sm:bottom-10">
        Quiet luxury · Everyday form
      </span>
    </div>
  );
}
