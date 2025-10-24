import * as React from "react";

// Minimal Tooltip context/provider (no-op for now)
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Minimal TooltipTrigger (wraps children, passes props)
export const TooltipTrigger = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, ...props }, ref) => (
    <span ref={ref} {...props} style={{ cursor: "pointer", ...((props.style as React.CSSProperties) || {}) }}>
      {children}
    </span>
  )
);
TooltipTrigger.displayName = "TooltipTrigger";

// Minimal TooltipContent (shows content, could be improved later)
export function TooltipContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        position: "absolute",
        background: "#fff",
        color: "#222",
        padding: "3px 10px",
        borderRadius: 6,
        fontSize: 11,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #eee',
        zIndex: 1000,
        opacity: 0.97,
        ...((props.style as React.CSSProperties) || {})
      }}
    >
      {children}
    </div>
  );
}

// Minimal Tooltip wrapper (does not show/hide on hover yet)
export function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
