import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0-100
  indicatorClassName?: string; // Class name for the indicator div
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, style, indicatorClassName, className, ...props }, ref) => {
    // Remove indicatorClassName from props to avoid passing it to the DOM
    return (
      <div
        ref={ref}
        className={className}
        {...props}
        style={{
          width: "100%",
          height: 8,
          background: "#eee",
          borderRadius: 4,
          overflow: "hidden",
          ...style,
        }}
      >
        <div
          className={indicatorClassName}
          style={{
            width: `${value}%`,
            height: "100%",
            background: indicatorClassName ? undefined : "#4f46e5",
            transition: "width 0.2s",
          }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
