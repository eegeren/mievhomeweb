import type { LucideIcon } from "lucide-react";

type CategoryCardProps = {
  title: string;
  icon: LucideIcon;
};

export function CategoryCard({ title, icon: Icon }: CategoryCardProps) {
  return (
    <article className="group rounded-lg border border-rosewood/10 bg-white/75 p-5 shadow-sm transition hover:-translate-y-1 hover:border-rosewood/25 hover:shadow-soft">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blush/20 text-rosewood">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
    </article>
  );
}
