"use client";

import Image from "next/image";
import {
  CreditCard,
  Heart,
  Instagram,
  LockKeyhole,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Star,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { products as fallbackProducts, type Product } from "@/data/products";

type CartItem = Product & {
  quantity: number;
};

type AccountUser = {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
};

const instagramUrl = "https://www.instagram.com/mievhomebandirma";
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=17%20Eyl%C3%BCl%20Mahallesi%20%C3%87orap%C3%A7%C4%B1lar%20Sokak%20No%3A6%20Band%C4%B1rma%20Bal%C4%B1kesir";
const whatsappUrl = "https://wa.me/905000000000";
const address =
  "17 Eylül Mahallesi Çorapçılar Sokak No:6, Bandırma / Balıkesir";

const categories = [
  "Tümü",
  "Çay & Kahve",
  "Cam & Porselen",
  "Mutfak",
  "Dekorasyon",
  "Organizer",
  "Kampanya"
];

const navCategories = [
  "Züccaciye",
  "Ev & Yaşam",
  "Mutfak",
  "Cam",
  "Porselen",
  "Dekorasyon",
  "Organizer",
  "Kampanyalar",
  "Çok Satanlar",
  "Yeni Gelenler"
];

export function Storefront() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Products request failed");
        }

        return response.json() as Promise<Product[]>;
      })
      .then((products) => {
        if (mounted) {
          setProducts(products);
        }
      })
      .catch(() => {
        if (mounted) {
          setProducts(fallbackProducts);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "Tümü" || product.category === selectedCategory;
      const matchesQuery = product.name
        .toLocaleLowerCase("tr")
        .includes(query.toLocaleLowerCase("tr"));

      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => b.reviews - a.reviews);

  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 750 || subtotal === 0 ? 0 : 49;
  const total = subtotal + shipping;

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function updateQuantity(productId: number, quantity: number) {
    setCart((current) =>
      current
        .map((item) => (item.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  async function createOrder() {
    if (cart.length === 0) {
      setCheckoutStatus("Sepetiniz boş.");
      return;
    }

    setCheckoutStatus("Sipariş oluşturuluyor...");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user?.id,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      });

      const result = (await response.json()) as { id?: number; error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Sipariş oluşturulamadı.");
      }

      setCart([]);
      setCheckoutStatus(`Sipariş alındı. Sipariş No: ${result.id}`);
    } catch (error) {
      setCheckoutStatus(
        error instanceof Error ? error.message : "Sipariş oluşturulamadı."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf4ea] text-[#2d2723]">
      <header className="sticky top-0 z-40 border-b border-[#eadfd4] bg-white">
        <div className="hidden border-b border-[#f0e6dc] bg-[#fffaf4] md:block">
          <div className="mx-auto flex max-w-7xl justify-end gap-5 px-4 py-2 text-xs font-semibold text-[#6f4b3d] sm:px-6 lg:px-8">
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="hover:text-[#9f5f57]">
              Mağaza Konumu
            </a>
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="hover:text-[#9f5f57]">
              Instagram
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-[#9f5f57]">
              Yardım & Destek
            </a>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <button
            aria-label="Menüyü aç"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#eadfd4] bg-white lg:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <a href="#anasayfa" className="flex shrink-0 items-center">
            <Image
              src="/miev-home-logo.png"
              alt="Miev Home"
              width={612}
              height={408}
              priority
              className="h-11 w-auto object-contain sm:h-12"
            />
          </a>

          <div className="relative mx-2 hidden flex-1 lg:block">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9f5f57]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ürün, kategori veya kampanya ara"
              className="h-11 w-full rounded-md border-2 border-transparent bg-[#fffaf4] px-4 pr-12 text-sm font-semibold outline-none transition placeholder:text-[#8f7b70] focus:border-[#9f5f57] focus:bg-white"
            />
          </div>

          <button
            className="ml-auto hidden min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-[#2d2723] transition hover:bg-[#e9b7ad]/25 hover:text-[#9f5f57] md:inline-flex"
            onClick={() => setAuthOpen(true)}
          >
            <User className="h-4 w-4" />
            Giriş Yap
          </button>

          <button className="hidden min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-[#2d2723] transition hover:bg-[#e9b7ad]/25 hover:text-[#9f5f57] md:inline-flex">
            <Heart className="h-4 w-4" />
            Favorilerim
          </button>

          <button
            className="relative inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-[#2d2723] transition hover:bg-[#e9b7ad]/25 hover:text-[#9f5f57]"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Sepetim</span>
            {cartQuantity > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9f5f57] px-1.5 text-xs text-white">
                {cartQuantity}
              </span>
            ) : null}
          </button>
        </div>

        <nav className="hidden border-t border-[#f0e6dc] lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-4 text-sm font-bold text-[#2d2723] sm:px-6 lg:px-8">
            {navCategories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(
                    categories.includes(category) ? category : "Tümü"
                  )
                }
                className="shrink-0 border-b-2 border-transparent py-3 transition hover:border-[#9f5f57] hover:text-[#9f5f57]"
              >
                {category}
              </button>
            ))}
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9f5f57]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ürün ara"
              className="h-11 w-full rounded-md border-2 border-transparent bg-[#fffaf4] px-4 pr-12 text-sm font-semibold outline-none focus:border-[#9f5f57] focus:bg-white"
            />
          </div>
          {mobileMenuOpen ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-bold text-[#2d2723]">
              <button
                className="rounded-md bg-[#fffaf4] px-4 py-3 text-left"
                onClick={() => setAuthOpen(true)}
              >
                Giriş Yap
              </button>
              <a className="rounded-md bg-[#fffaf4] px-4 py-3" href="#urunler">
                Ürünler
              </a>
              <a className="rounded-md bg-[#fffaf4] px-4 py-3" href="#kampanyalar">
                Kampanyalar
              </a>
              <a className="rounded-md bg-[#fffaf4] px-4 py-3" href="#konum">
                Mağaza
              </a>
            </div>
          ) : null}
        </div>
      </header>

      <section id="urunler" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => addToCart(product)}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-[#eadfd4] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          <TrustItem icon={LockKeyhole} title="Güvenli alışveriş" text="Demo ödeme akışı ve sipariş özeti" />
          <TrustItem icon={MessageCircle} title="WhatsApp destek" text="Ürün soruları için hızlı iletişim" />
          <TrustItem icon={MapPin} title="Bandırma mağaza" text="Yerinde inceleme ve teslim alma" />
        </div>
      </section>

      <section
        id="kampanyalar"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="grid gap-8 rounded-md bg-[#9f5f57] p-6 text-white shadow-sm md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-white/80">
              Kampanyalar
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Özel günlere ve açılışa özel fırsatlar
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-white/80">
              Sepette indirim, mağazadan teslim ve stoklarla sınırlı ürün
              fırsatları için Miev Home Bandırma’yı takip edin.
            </p>
            <p className="mt-4 text-sm font-bold text-white">
              Fırsatlar stoklarla sınırlıdır.
            </p>
          </div>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-black text-[#9f5f57]"
          >
            <Instagram className="h-4 w-4" />
            Instagram’da Gör
          </a>
        </div>
      </section>

      <section id="konum" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-md border border-[#eadfd4] bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#9f5f57]">
              Mağaza
            </p>
            <h2 className="mt-3 text-3xl font-black">Miev Home Bandırma</h2>
            <p className="mt-3 leading-7 text-[#6f4b3d]">{address}</p>
            <p className="mt-3 font-bold text-[#6f4b3d]">Her gün 09:00 - 21:00</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#9f5f57] px-5 text-sm font-black text-white"
              >
                <MapPin className="h-4 w-4" />
                Yol Tarifi Al
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#eadfd4] px-5 text-sm font-black text-[#6f4b3d]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
          <iframe
            title="Miev Home Bandırma Google Maps konumu"
            className="h-[360px] w-full border-0 lg:h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=17%20Eyl%C3%BCl%20Mahallesi%20%C3%87orap%C3%A7%C4%B1lar%20Sokak%20No%3A6%20Band%C4%B1rma%20Bal%C4%B1kesir&output=embed"
          />
        </div>
      </section>

      <footer className="border-t border-[#eadfd4] bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-[#6f4b3d] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-black text-[#2d2723]">Miev Home Bandırma</p>
            <p className="mt-1">{address}</p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <a className="font-bold text-[#9f5f57]" href={instagramUrl} target="_blank" rel="noreferrer">
              @mievhomebandirma
            </a>
            <p>© 2026 Miev Home. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {cartOpen ? (
        <CartDrawer
          cart={cart}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          onClose={() => setCartOpen(false)}
          onUpdate={updateQuantity}
          onAuth={() => setAuthOpen(true)}
          onCheckout={createOrder}
          checkoutStatus={checkoutStatus}
        />
      ) : null}

      {authOpen ? (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuthenticated={(user) => {
            setUser(user);
            setAuthOpen(false);
          }}
        />
      ) : null}
    </main>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(price);
}

function TrustItem({
  icon: Icon,
  title,
  text
}: {
  icon: typeof LockKeyhole;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-md bg-[#fffaf4] p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e9b7ad]/25 text-[#9f5f57]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-black text-[#2d2723]">{title}</p>
        <p className="text-sm text-[#6f4b3d]">{text}</p>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onAdd
}: {
  product: Product;
  onAdd: () => void;
}) {
  return (
    <article className="group flex h-full flex-col rounded-md border border-[#eadfd4] bg-white p-3 transition hover:border-[#9f5f57] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className={`relative aspect-[3/4] overflow-hidden rounded-md bg-gradient-to-br ${product.color} p-4`}>
        {product.badge ? (
          <span className="absolute left-2 top-2 rounded-sm bg-[#9f5f57] px-2 py-1 text-[11px] font-black text-white">
            {product.badge}
          </span>
        ) : null}
        <button
          aria-label="Favorilere ekle"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#6f4b3d] shadow-sm transition hover:text-[#9f5f57]"
        >
          <Heart className="h-4 w-4" />
        </button>
        <div className="flex h-full items-end justify-center gap-3">
          <span className="h-20 w-20 rounded-full border-[10px] border-white bg-blush/45 shadow-sm" />
          <span className="h-28 w-16 rounded-b-lg rounded-t-full border-[8px] border-white bg-sage/40 shadow-sm" />
          <span className="h-16 w-16 rounded-full border-[8px] border-white bg-cocoa/20 shadow-sm" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#6f4b3d]">
        <Star className="h-4 w-4 fill-rosewood text-rosewood" />
        {product.rating}
        <span className="font-semibold text-[#8f7b70]">({product.reviews})</span>
      </div>
      <h3 className="mt-2 min-h-12 text-sm font-bold leading-6 text-[#2d2723]">
        {product.name}
      </h3>
      <p className="mt-1 min-h-10 text-xs leading-5 text-[#6f4b3d]">
        {product.description}
      </p>
      <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#8f7b70]">
        {product.category}
      </p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-xl font-black text-[#9f5f57]">
          {formatPrice(product.price)}
        </span>
        {product.oldPrice ? (
          <span className="pb-0.5 text-xs font-bold text-[#8f7b70] line-through">
            {formatPrice(product.oldPrice)}
          </span>
        ) : null}
      </div>
      <button
        onClick={onAdd}
        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#9f5f57] px-4 text-sm font-black text-white transition hover:bg-[#6f4b3d]"
      >
        <ShoppingCart className="h-4 w-4" />
        Sepete Ekle
      </button>
    </article>
  );
}

function CartDrawer({
  cart,
  subtotal,
  shipping,
  total,
  onClose,
  onUpdate,
  onAuth,
  onCheckout,
  checkoutStatus
}: {
  cart: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onClose: () => void;
  onUpdate: (productId: number, quantity: number) => void;
  onAuth: () => void;
  onCheckout: () => void;
  checkoutStatus: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Sepeti kapat"
        className="absolute inset-0 bg-ink/45"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-porcelain shadow-soft">
        <div className="flex items-center justify-between border-b border-cocoa/10 p-5">
          <div>
            <p className="text-sm font-bold text-rosewood">Sepetim</p>
            <h2 className="text-2xl font-black">Sipariş özeti</h2>
          </div>
          <button
            aria-label="Kapat"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-cocoa/10 bg-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="rounded-lg border border-dashed border-cocoa/20 p-6 text-center">
              <ShoppingCart className="mx-auto h-10 w-10 text-cocoa/35" />
              <p className="mt-4 font-black">Sepetiniz boş</p>
              <p className="mt-2 text-sm text-cocoa/65">
                Ürünleri sepete ekleyerek sipariş oluşturmaya başlayın.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="rounded-lg border border-cocoa/10 bg-white p-4">
                  <div className="flex gap-4">
                    <div className={`h-20 w-20 shrink-0 rounded-lg bg-gradient-to-br ${item.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-black leading-6">{item.name}</p>
                      <p className="mt-1 text-sm font-bold text-rosewood">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-cocoa/10">
                      <button
                        aria-label="Adedi azalt"
                        className="flex h-10 w-10 items-center justify-center"
                        onClick={() => onUpdate(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-black">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Adedi artır"
                        className="flex h-10 w-10 items-center justify-center"
                        onClick={() => onUpdate(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-black">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-cocoa/10 bg-white p-5">
          <SummaryRow label="Ara toplam" value={formatPrice(subtotal)} />
          <SummaryRow
            label="Teslimat"
            value={shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
          />
          <div className="my-4 h-px bg-cocoa/10" />
          <SummaryRow label="Toplam" value={formatPrice(total)} strong />
          <button
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-rosewood px-5 text-sm font-black text-white transition hover:bg-cocoa"
            onClick={onCheckout}
          >
            <CreditCard className="h-4 w-4" />
            Siparişi Oluştur
          </button>
          <button
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-cocoa/10 bg-white px-5 text-sm font-black text-cocoa"
            onClick={onAuth}
          >
            Hesaba Giriş Yap
          </button>
          {checkoutStatus ? (
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-center text-xs font-bold text-cocoa">
              {checkoutStatus}
            </p>
          ) : null}
          <p className="mt-3 text-center text-xs font-semibold text-cocoa/55">
            Ödeme entegrasyonu sonraki aşamada eklenebilir.
          </p>
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-1 ${strong ? "text-lg font-black" : "text-sm font-bold text-cocoa/75"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function AuthModal({
  onClose,
  onAuthenticated
}: {
  onClose: () => void;
  onAuthenticated: (user: AccountUser) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        }
      );
      const result = (await response.json()) as AccountUser & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "İşlem tamamlanamadı.");
      }

      onAuthenticated(result);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        aria-label="Üyelik penceresini kapat"
        className="absolute inset-0 bg-ink/50"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-lg bg-porcelain p-6 shadow-soft">
        <button
          aria-label="Kapat"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border border-cocoa/10 bg-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-rosewood">
          Üyelik
        </p>
        <h2 className="mt-2 text-3xl font-black">
          {mode === "login" ? "Miev hesabına giriş yap" : "Yeni üyelik oluştur"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-cocoa/70">
          Sipariş takibi, favoriler, adres defteri ve kampanya bildirimleri için
          üyelik alanı hazırlandı.
        </p>

        <div className="mt-6 space-y-3">
          {mode === "register" ? (
            <input
              type="text"
              placeholder="Ad Soyad"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 w-full rounded-lg border border-cocoa/10 bg-white px-4 text-sm font-semibold outline-none focus:border-rosewood/45"
            />
          ) : null}
          <input
            type="email"
            placeholder="E-posta adresi"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-lg border border-cocoa/10 bg-white px-4 text-sm font-semibold outline-none focus:border-rosewood/45"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-lg border border-cocoa/10 bg-white px-4 text-sm font-semibold outline-none focus:border-rosewood/45"
          />
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-rosewood px-5 text-sm font-black text-white disabled:opacity-60"
            disabled={loading}
            onClick={submit}
          >
            {loading
              ? "İşleniyor..."
              : mode === "login"
                ? "Giriş Yap"
                : "Üyelik Oluştur"}
          </button>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-cocoa/10 bg-white px-5 text-sm font-black text-cocoa"
            onClick={() => {
              setStatus(null);
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login" ? "Yeni Üyelik Oluştur" : "Giriş Ekranına Dön"}
          </button>
          {status ? (
            <p className="rounded-lg bg-cream px-3 py-2 text-center text-xs font-bold text-cocoa">
              {status}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-bold text-cocoa/65">
          <span className="rounded-lg bg-white p-3">Favoriler</span>
          <span className="rounded-lg bg-white p-3">Adresler</span>
          <span className="rounded-lg bg-white p-3">Siparişler</span>
        </div>
      </div>
    </div>
  );
}
