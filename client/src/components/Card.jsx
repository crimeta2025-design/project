import React from "react";

export function Card({ className = "", ...props }) {
  return (
    <div
      data-slot="card"
      className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }) {
  return (
    <div
      data-slot="card-header"
      className={`grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pb-6 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = "", ...props }) {
  return (
    <div
      data-slot="card-title"
      className={`leading-none font-semibold ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }) {
  return (
    <div
      data-slot="card-content"
      className={`px-6 ${className}`}
      {...props}
    />
  );
}
