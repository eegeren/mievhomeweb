import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/Button";

type ProductCardProps = {
  name: string;
  description: string;
};

export function ProductCard({ name, description }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-cocoa/10 bg-porcelain p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-5 aspect-[4/3] rounded-lg border border-white bg-gradient-to-br from-white via-cream to-blush/30 p-4">
        <div className="flex h-full items-end justify-center gap-2">
          <span className="h-14 w-14 rounded-full border-4 border-white/90 bg-sage/40 shadow-sm" />
          <span className="h-20 w-16 rounded-b-lg rounded-t-full border-4 border-white/90 bg-rosewood/25 shadow-sm" />
          <span className="h-11 w-11 rounded-full border-4 border-white/90 bg-cocoa/20 shadow-sm" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-ink">{name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-cocoa/75">{description}</p>
      <Button
        href="#iletisim"
        icon={ShoppingBag}
        variant="secondary"
        className="mt-5 w-full"
      >
        Mağazada İncele
      </Button>
    </article>
  );
}
