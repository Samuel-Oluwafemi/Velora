import { Check } from "lucide-react";

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className="fixed top-6 right-6 z-[100] flex items-center gap-3
      bg-foreground text-primary-foreground px-5 py-3 shadow-lg"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.75rem",
        letterSpacing: "0.02em",
      }}
    >
      <Check size={16} />
      <span>{message}</span>
    </div>
  );
}