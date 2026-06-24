export type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  color: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Lav Diamond 18 Parça Su Seti",
    category: "Cam & Porselen",
    description: "Günlük ve misafir sofraları için parlak cam su seti.",
    price: 899,
    oldPrice: 1199,
    rating: 4.8,
    reviews: 126,
    badge: "Çok Satan",
    color: "from-sage/35 to-white"
  },
  {
    id: 2,
    name: "Keyfi Ala Üzüm Çay Bardağı 6’lı",
    category: "Çay & Kahve",
    description: "İnce belli form, zarif üzüm detayı ve şık sunum.",
    price: 349,
    oldPrice: 429,
    rating: 4.7,
    reviews: 84,
    badge: "İndirim",
    color: "from-blush/40 to-white"
  },
  {
    id: 3,
    name: "Açelya 6’lı Lokumluk",
    category: "Cam & Porselen",
    description: "Lokum, çikolata ve küçük ikramlar için porselen set.",
    price: 279,
    rating: 4.6,
    reviews: 51,
    color: "from-cream to-blush/30"
  },
  {
    id: 4,
    name: "Egehome 18 Parça Çay Seti",
    category: "Çay & Kahve",
    description: "Tabaklı fincan formuyla sıcak ve uyumlu çay sunumu.",
    price: 1299,
    oldPrice: 1499,
    rating: 4.9,
    reviews: 93,
    badge: "Yeni",
    color: "from-white to-sage/30"
  },
  {
    id: 5,
    name: "Tutku 12 Parça Bambu Fincan Takımı",
    category: "Çay & Kahve",
    description: "Bambu detaylı kahve fincanları ve modern servis hissi.",
    price: 749,
    rating: 4.8,
    reviews: 68,
    color: "from-cocoa/15 to-white"
  },
  {
    id: 6,
    name: "Barotti Cam Çay Demliği",
    category: "Mutfak",
    description: "Isıya dayanıklı cam gövde, ferah ve pratik demleme.",
    price: 599,
    oldPrice: 699,
    rating: 4.5,
    reviews: 42,
    color: "from-white to-blush/35"
  },
  {
    id: 7,
    name: "Bambu Sepet",
    category: "Organizer",
    description: "Banyo, mutfak ve raf düzeni için doğal dokulu sepet.",
    price: 229,
    rating: 4.7,
    reviews: 37,
    badge: "Stokta",
    color: "from-sage/25 to-cream"
  },
  {
    id: 8,
    name: "6’lı Baharat Seti",
    category: "Mutfak",
    description: "Tezgah düzeni için etiketli, kullanışlı baharat seti.",
    price: 399,
    oldPrice: 499,
    rating: 4.6,
    reviews: 74,
    badge: "Fırsat",
    color: "from-blush/35 to-cream"
  },
  {
    id: 9,
    name: "Gold Detaylı Dekoratif Vazo",
    category: "Dekorasyon",
    description: "Konsol ve salon köşeleri için pastel tonlu dekor vazo.",
    price: 549,
    rating: 4.8,
    reviews: 29,
    color: "from-white to-rosewood/20"
  },
  {
    id: 10,
    name: "Premium Servis Tabağı",
    category: "Kampanya",
    description: "Özel sofralar için geniş, kaliteli ve zarif servis tabağı.",
    price: 459,
    oldPrice: 649,
    rating: 4.9,
    reviews: 58,
    badge: "Açılışa Özel",
    color: "from-cream to-sage/25"
  }
];
