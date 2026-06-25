"use client";

import Image from "next/image";
import {
  Bell,
  CreditCard,
  Heart,
  Instagram,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  Search,
  Settings,
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
  defaultDeliveryAddress?: string | null;
  defaultBillingAddress?: string | null;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
};

type CheckoutDetails = {
  deliveryAddress: string;
  billingAddress: string;
  paymentMethod: string;
};

type AccountOrder = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  deliveryAddress?: string | null;
  items: Array<{
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
    };
  }>;
};

type ProfileTab = "profile" | "addresses" | "orders" | "settings";

const instagramUrl = "https://www.instagram.com/mievhomebandirma";
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=17%20Eyl%C3%BCl%20Mahallesi%20%C3%87orap%C3%A7%C4%B1lar%20Sokak%20No%3A6%20Band%C4%B1rma%20Bal%C4%B1kesir";
const whatsappUrl = "https://wa.me/905000000000";
const address =
  "17 Eylül Mahallesi Çorapçılar Sokak No:6, Bandırma / Balıkesir";

export function Storefront() {
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<ProfileTab>("profile");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>({
    deliveryAddress: "",
    billingAddress: "",
    paymentMethod: "Kapıda ödeme"
  });

  useEffect(() => {
    let mounted = true;

    fetch("/api/auth/me")
      .then((response) => response.json() as Promise<{ user: AccountUser | null }>)
      .then((result) => {
        if (mounted) {
          setUser(result.user);
          if (result.user?.defaultDeliveryAddress) {
            setCheckoutDetails((current) => ({
              ...current,
              deliveryAddress: result.user?.defaultDeliveryAddress ?? "",
              billingAddress: result.user?.defaultBillingAddress ?? ""
            }));
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
        }
      });

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
      const search = query.toLocaleLowerCase("tr");
      const matchesQuery =
        product.name.toLocaleLowerCase("tr").includes(search) ||
        product.description.toLocaleLowerCase("tr").includes(search);

      return matchesQuery;
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

  function performSearch() {
    setQuery(searchDraft.trim());
  }

  async function createOrder() {
    if (cart.length === 0) {
      setCheckoutStatus("Sepetiniz boş.");
      return;
    }

    if (!checkoutDetails.deliveryAddress.trim()) {
      setCheckoutStatus("Teslimat adresi gerekli.");
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
          ...checkoutDetails,
          billingAddress:
            checkoutDetails.billingAddress || checkoutDetails.deliveryAddress,
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
      loadOrders();
    } catch (error) {
      setCheckoutStatus(
        error instanceof Error ? error.message : "Sipariş oluşturulamadı."
      );
    }
  }

  async function loadOrders() {
    try {
      const response = await fetch("/api/orders");

      if (!response.ok) {
        return;
      }

      const result = (await response.json()) as { orders: AccountOrder[] };
      setOrders(result.orders);
    } catch {
      setOrders([]);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
    setProfileOpen(false);
    setProfileMenuOpen(false);
  }

  function toggleAccountMenu() {
    if (user) {
      setProfileMenuOpen((current) => !current);
    } else {
      setAuthOpen(true);
    }
  }

  function openProfilePanel(tab: ProfileTab) {
    setProfileInitialTab(tab);
    setProfileMenuOpen(false);

    if (tab === "orders") {
      loadOrders();
    }

    setProfileOpen(true);
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

        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:h-20 lg:px-8">
          <a href="#anasayfa" className="flex shrink-0 items-center">
            <Image
              src="/miev-home-logo.png"
              alt="Miev Home"
              width={612}
              height={408}
              priority
              className="h-[76px] w-auto object-contain"
            />
          </a>

          <div className="mx-2 hidden flex-1 items-center gap-2 lg:flex">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9f5f57]" />
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    performSearch();
                  }
                }}
                placeholder="Ürün ara"
                className="h-11 w-full rounded-md border-2 border-transparent bg-[#fffaf4] px-4 pl-12 text-sm font-semibold outline-none transition placeholder:text-[#8f7b70] focus:border-[#9f5f57] focus:bg-white"
              />
            </div>
            <button
              className="h-11 rounded-md bg-[#9f5f57] px-6 text-sm font-black text-white transition hover:bg-[#6f4b3d]"
              onClick={performSearch}
            >
              Ara
            </button>
          </div>

          <div className="relative ml-auto hidden md:block">
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-[#2d2723] transition hover:bg-[#e9b7ad]/25 hover:text-[#9f5f57]"
              onClick={toggleAccountMenu}
            >
              <User className="h-4 w-4" />
              {user ? user.name ?? "Hesabım" : "Giriş Yap"}
            </button>
            {profileMenuOpen && user ? (
              <ProfileDropdown
                user={user}
                onOpen={openProfilePanel}
                onLogout={logout}
              />
            ) : null}
          </div>

          <div className="relative ml-auto md:hidden">
            <button
              aria-label={user ? "Profilim" : "Giriş yap"}
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-[#2d2723] transition hover:bg-[#e9b7ad]/25 hover:text-[#9f5f57]"
              onClick={toggleAccountMenu}
            >
              <User className="h-4 w-4" />
            </button>
            {profileMenuOpen && user ? (
              <ProfileDropdown
                user={user}
                onOpen={openProfilePanel}
                onLogout={logout}
              />
            ) : null}
          </div>

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

        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:hidden">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9f5f57]" />
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    performSearch();
                  }
                }}
                placeholder="Ürün ara"
                className="h-11 w-full rounded-md border-2 border-transparent bg-[#fffaf4] px-4 pl-12 text-sm font-semibold outline-none focus:border-[#9f5f57] focus:bg-white"
              />
            </div>
            <button
              className="h-11 rounded-md bg-[#9f5f57] px-5 text-sm font-black text-white"
              onClick={performSearch}
            >
              Ara
            </button>
          </div>
        </div>
      </header>

      <section id="urunler" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          checkoutDetails={checkoutDetails}
          onCheckoutDetailsChange={setCheckoutDetails}
        />
      ) : null}

      {authOpen ? (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuthenticated={(user) => {
            setUser(user);
            setAuthOpen(false);
            setProfileMenuOpen(true);
          }}
        />
      ) : null}

      {profileOpen && user ? (
        <ProfilePanel
          user={user}
          orders={orders}
          initialTab={profileInitialTab}
          onClose={() => setProfileOpen(false)}
          onLogout={logout}
          onUserUpdate={(user) => {
            setUser(user);
            setCheckoutDetails((current) => ({
              ...current,
              deliveryAddress: user.defaultDeliveryAddress ?? "",
              billingAddress: user.defaultBillingAddress ?? ""
            }));
          }}
          onReloadOrders={loadOrders}
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
      <div className={`relative aspect-[4/3] overflow-hidden rounded-md bg-gradient-to-br ${product.color} p-4`}>
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
      <h3 className="mt-2 min-h-12 text-base font-black leading-6 text-[#2d2723]">
        {product.name}
      </h3>
      <p className="mt-1 min-h-10 text-sm leading-5 text-[#6f4b3d]">
        {product.description}
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
  checkoutStatus,
  checkoutDetails,
  onCheckoutDetailsChange
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
  checkoutDetails: CheckoutDetails;
  onCheckoutDetailsChange: (details: CheckoutDetails) => void;
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

          {cart.length > 0 ? (
            <div className="mt-5 space-y-3 rounded-lg border border-cocoa/10 bg-white p-4">
              <p className="text-sm font-black text-ink">Teslimat ve ödeme</p>
              <textarea
                placeholder="Teslimat adresi"
                value={checkoutDetails.deliveryAddress}
                onChange={(event) =>
                  onCheckoutDetailsChange({
                    ...checkoutDetails,
                    deliveryAddress: event.target.value
                  })
                }
                className="min-h-20 w-full rounded-lg border border-cocoa/10 bg-porcelain px-3 py-2 text-sm font-semibold outline-none focus:border-rosewood/45"
              />
              <textarea
                placeholder="Fatura adresi (boş bırakılırsa teslimat adresi kullanılır)"
                value={checkoutDetails.billingAddress}
                onChange={(event) =>
                  onCheckoutDetailsChange({
                    ...checkoutDetails,
                    billingAddress: event.target.value
                  })
                }
                className="min-h-20 w-full rounded-lg border border-cocoa/10 bg-porcelain px-3 py-2 text-sm font-semibold outline-none focus:border-rosewood/45"
              />
              <select
                value={checkoutDetails.paymentMethod}
                onChange={(event) =>
                  onCheckoutDetailsChange({
                    ...checkoutDetails,
                    paymentMethod: event.target.value
                  })
                }
                className="h-11 w-full rounded-lg border border-cocoa/10 bg-porcelain px-3 text-sm font-bold outline-none focus:border-rosewood/45"
              >
                <option>Kapıda ödeme</option>
                <option>Mağazada ödeme</option>
                <option>Kart ile ödeme (yakında)</option>
              </select>
            </div>
          ) : null}
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

function ProfileDropdown({
  user,
  onOpen,
  onLogout
}: {
  user: AccountUser;
  onOpen: (tab: ProfileTab) => void;
  onLogout: () => void;
}) {
  const items = [
    { id: "profile" as const, label: "Profilim", icon: User },
    { id: "addresses" as const, label: "Adreslerim", icon: MapPin },
    { id: "orders" as const, label: "Siparişlerim", icon: PackageCheck },
    { id: "settings" as const, label: "Ayarlar", icon: Settings }
  ];

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-[#eadfd4] bg-white shadow-soft">
      <div className="border-b border-[#eadfd4] bg-[#fffaf4] px-4 py-3">
        <p className="text-sm font-black text-[#2d2723]">
          {user.name ?? "Miev Home müşterisi"}
        </p>
        <p className="mt-0.5 truncate text-xs font-semibold text-[#8f7b70]">
          {user.email}
        </p>
      </div>
      <div className="p-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-bold text-[#2d2723] transition hover:bg-[#e9b7ad]/20 hover:text-[#9f5f57]"
              onClick={() => onOpen(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
        <button
          className="mt-1 flex w-full items-center gap-3 rounded-md border-t border-[#eadfd4] px-3 py-2.5 text-left text-sm font-bold text-[#6f4b3d] transition hover:bg-[#e9b7ad]/20 hover:text-[#9f5f57]"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

function ProfilePanel({
  user,
  orders,
  initialTab,
  onClose,
  onLogout,
  onUserUpdate,
  onReloadOrders
}: {
  user: AccountUser;
  orders: AccountOrder[];
  initialTab: ProfileTab;
  onClose: () => void;
  onLogout: () => void;
  onUserUpdate: (user: AccountUser) => void;
  onReloadOrders: () => void;
}) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
    defaultDeliveryAddress: user.defaultDeliveryAddress ?? "",
    defaultBillingAddress: user.defaultBillingAddress ?? "",
    emailNotifications: user.emailNotifications ?? true,
    smsNotifications: user.smsNotifications ?? false
  });
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const result = (await response.json()) as {
        user?: AccountUser;
        error?: string;
      };

      if (!response.ok || !result.user) {
        throw new Error(result.error ?? "Profil kaydedilemedi.");
      }

      onUserUpdate(result.user);
      setStatus("Bilgiler kaydedildi.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profil kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "profile" as const, label: "Profil", icon: User },
    { id: "addresses" as const, label: "Adresler", icon: MapPin },
    { id: "orders" as const, label: "Siparişler", icon: PackageCheck },
    { id: "settings" as const, label: "Ayarlar", icon: Settings }
  ];

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label="Profil panelini kapat"
        className="absolute inset-0 bg-ink/45"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col bg-porcelain shadow-soft">
        <div className="flex items-center justify-between border-b border-cocoa/10 bg-white p-5">
          <div>
            <p className="text-sm font-bold text-rosewood">Hesabım</p>
            <h2 className="text-2xl font-black text-ink">
              {user.name ?? user.email}
            </h2>
          </div>
          <button
            aria-label="Kapat"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-cocoa/10 bg-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto border-b border-cocoa/10 bg-white p-3 md:flex-col md:border-b-0 md:border-r">
            {tabs.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-black transition ${
                    tab === item.id
                      ? "bg-rosewood text-white"
                      : "bg-porcelain text-cocoa hover:bg-blush/20"
                  }`}
                  onClick={() => {
                    setTab(item.id);
                    if (item.id === "orders") {
                      onReloadOrders();
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-black text-cocoa transition hover:bg-blush/20 md:mt-auto"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </nav>

          <div className="overflow-y-auto p-5">
            {tab === "profile" ? (
              <div className="space-y-4">
                <SectionTitle title="Profil Bilgileri" text="Ad, telefon ve e-posta bilgilerinizi görüntüleyin." />
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Ad Soyad"
                  className="h-12 w-full rounded-lg border border-cocoa/10 bg-white px-4 text-sm font-semibold outline-none focus:border-rosewood/45"
                />
                <input
                  value={user.email}
                  readOnly
                  className="h-12 w-full rounded-lg border border-cocoa/10 bg-white px-4 text-sm font-semibold text-cocoa/70"
                />
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  placeholder="Telefon numarası"
                  className="h-12 w-full rounded-lg border border-cocoa/10 bg-white px-4 text-sm font-semibold outline-none focus:border-rosewood/45"
                />
              </div>
            ) : null}

            {tab === "addresses" ? (
              <div className="space-y-4">
                <SectionTitle title="Adreslerim" text="Alışveriş sırasında kullanılacak varsayılan adresleri kaydedin." />
                <textarea
                  value={form.defaultDeliveryAddress}
                  onChange={(event) =>
                    setForm({ ...form, defaultDeliveryAddress: event.target.value })
                  }
                  placeholder="Varsayılan teslimat adresi"
                  className="min-h-28 w-full rounded-lg border border-cocoa/10 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-rosewood/45"
                />
                <textarea
                  value={form.defaultBillingAddress}
                  onChange={(event) =>
                    setForm({ ...form, defaultBillingAddress: event.target.value })
                  }
                  placeholder="Varsayılan fatura adresi"
                  className="min-h-28 w-full rounded-lg border border-cocoa/10 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-rosewood/45"
                />
              </div>
            ) : null}

            {tab === "orders" ? (
              <div className="space-y-4">
                <SectionTitle title="Siparişlerim" text="Oluşturduğunuz siparişleri buradan takip edin." />
                {orders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-cocoa/20 bg-white p-6 text-center text-sm font-bold text-cocoa">
                    Henüz sipariş bulunmuyor.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="rounded-lg border border-cocoa/10 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-ink">Sipariş #{order.id}</p>
                          <p className="mt-1 text-xs font-bold text-cocoa/65">
                            {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <span className="rounded-lg bg-cream px-3 py-1 text-xs font-black text-rosewood">
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-cocoa">
                        {order.items.map((item) => (
                          <p key={`${order.id}-${item.product.name}`}>
                            {item.product.name} x {item.quantity}
                          </p>
                        ))}
                      </div>
                      <p className="mt-4 text-right text-lg font-black text-rosewood">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {tab === "settings" ? (
              <div className="space-y-4">
                <SectionTitle title="Ayarlar" text="Bildirim ve hesap tercihlerinizi yönetin." />
                <ToggleRow
                  icon={Bell}
                  title="E-posta bildirimleri"
                  checked={form.emailNotifications}
                  onChange={(checked) =>
                    setForm({ ...form, emailNotifications: checked })
                  }
                />
                <ToggleRow
                  icon={MessageCircle}
                  title="SMS bildirimleri"
                  checked={form.smsNotifications}
                  onChange={(checked) =>
                    setForm({ ...form, smsNotifications: checked })
                  }
                />
                <div className="rounded-lg bg-white p-4 text-sm font-semibold leading-6 text-cocoa">
                  Şifre değiştirme ve kart saklama seçenekleri ödeme entegrasyonu
                  tamamlandığında aktif edilecektir.
                </div>
              </div>
            ) : null}

            <button
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-rosewood px-5 text-sm font-black text-white disabled:opacity-60"
              disabled={saving}
              onClick={saveProfile}
            >
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
            {status ? (
              <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-center text-xs font-bold text-cocoa">
                {status}
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-xl font-black text-ink">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-cocoa/70">{text}</p>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  checked,
  onChange
}: {
  icon: typeof Bell;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg bg-white p-4">
      <span className="flex items-center gap-3 text-sm font-black text-ink">
        <Icon className="h-5 w-5 text-rosewood" />
        {title}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-rosewood"
      />
    </label>
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
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreementsAccepted, setAgreementsAccepted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (mode === "register" && !agreementsAccepted) {
      setStatus("Üyelik sözleşmesi ve gizlilik politikası onayı gerekli.");
      return;
    }

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
          body: JSON.stringify({ name, phone, email, password })
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
            <>
              <input
                type="text"
                placeholder="Ad Soyad"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-12 w-full rounded-lg border border-cocoa/10 bg-white px-4 text-sm font-semibold outline-none focus:border-rosewood/45"
              />
              <input
                type="tel"
                placeholder="Telefon numarası"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-12 w-full rounded-lg border border-cocoa/10 bg-white px-4 text-sm font-semibold outline-none focus:border-rosewood/45"
              />
            </>
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
          {mode === "register" ? (
            <>
              <label className="flex items-start gap-3 rounded-lg bg-white p-3 text-xs font-semibold leading-5 text-cocoa">
                <input
                  type="checkbox"
                  checked={agreementsAccepted}
                  onChange={(event) => setAgreementsAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-rosewood"
                />
                <span>
                  Üyelik sözleşmesini ve gizlilik politikasını okudum, kabul
                  ediyorum.
                </span>
              </label>
              <p className="rounded-lg bg-cream px-3 py-2 text-xs font-semibold leading-5 text-cocoa">
                SMS veya e-posta doğrulaması canlı entegrasyon aşamasında
                etkinleştirilecektir.
              </p>
            </>
          ) : null}
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
