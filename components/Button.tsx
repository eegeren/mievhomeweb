import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  href: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  external?: boolean;
};

const variants = {
  primary:
    "bg-rosewood text-white shadow-soft hover:bg-cocoa focus-visible:outline-rosewood",
  secondary:
    "border border-rosewood/20 bg-white/80 text-cocoa hover:border-rosewood/45 hover:bg-white focus-visible:outline-rosewood",
  ghost:
    "bg-ink text-white hover:bg-cocoa focus-visible:outline-ink"
};

export function Button({
  children,
  href,
  icon: Icon,
  variant = "primary",
  className = "",
  external = false
}: ButtonProps) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a className={classes} href={href} target="_blank" rel="noreferrer">
        {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : null}
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}
