import * as React from "react";

export function Avatar({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        borderRadius: "50%",
        overflow: "hidden",
        display: "inline-block",
        width: 40,
        height: 40,
        ...((props.style as React.CSSProperties) || {})
      }}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      {...props}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        ...((props.style as React.CSSProperties) || {})
      }}
    />
  );
}

export function AvatarFallback({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#eee",
        color: "#666",
        fontWeight: 600,
        ...((props.style as React.CSSProperties) || {})
      }}
    >
      {children}
    </div>
  );
}
