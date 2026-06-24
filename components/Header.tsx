import Image from "next/image";
import { Instagram } from "lucide-react";
import { Button } from "@/components/Button";

const navItems = [
  { label: "Ana Sayfa", href: "#anasayfa" },
  { label: "Ürünler", href: "#urunler" },
  { label: "Kampanyalar", href: "#kampanyalar" },
  { label: "Konum", href: "#konum" },
  { label: "İletişim", href: "#iletisim" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-rosewood/10 bg-porcelain/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#anasayfa" className="flex min-w-0 items-center">
          <Image
            src="/miev-home-logo.png"
            alt="Miev Home Züccaciye"
            width={612}
            height={408}
            priority
            className="h-16 w-auto object-contain sm:h-20"
          />
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Ana menü">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-cocoa/80 transition hover:text-rosewood"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button
          href="https://www.instagram.com/mievhomebandirma"
          icon={Instagram}
          variant="secondary"
          external
          className="px-4"
        >
          Instagram
        </Button>
      </div>
      <nav
        className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 pb-3 text-sm font-semibold text-cocoa/75 sm:px-6 lg:hidden"
        aria-label="Mobil menü"
      >
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className="shrink-0 hover:text-rosewood">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
