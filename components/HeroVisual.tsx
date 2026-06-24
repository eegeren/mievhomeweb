export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-lg border border-white/80 bg-gradient-to-br from-white via-cream to-blush/35 p-4 shadow-soft sm:p-6">
      <div className="absolute inset-x-8 top-8 h-20 rounded-lg bg-white/70" />
      <div className="relative grid h-full grid-cols-5 grid-rows-5 gap-3">
        <div className="col-span-3 row-span-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="h-full rounded-lg bg-gradient-to-br from-sage/35 to-white p-4">
            <div className="mx-auto h-24 w-24 rounded-full border-[10px] border-white bg-blush/40 shadow-sm sm:h-32 sm:w-32" />
            <div className="mx-auto mt-4 h-3 w-28 rounded-full bg-cocoa/20" />
          </div>
        </div>
        <div className="col-span-2 row-span-2 rounded-lg bg-rosewood/90 p-4 text-white shadow-sm">
          <div className="h-16 rounded-t-full border-8 border-white/35" />
          <div className="mt-3 h-2 w-16 rounded-full bg-white/60" />
          <div className="mt-2 h-2 w-10 rounded-full bg-white/40" />
        </div>
        <div className="col-span-2 row-span-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex h-full items-end justify-center gap-2 rounded-lg bg-cream">
            <span className="h-24 w-10 rounded-t-full bg-cocoa/25" />
            <span className="h-32 w-10 rounded-t-full bg-blush/55" />
            <span className="h-20 w-10 rounded-t-full bg-sage/45" />
          </div>
        </div>
        <div className="col-span-3 row-span-2 rounded-lg bg-cocoa/90 p-4 shadow-sm">
          <div className="grid h-full grid-cols-3 gap-3">
            <span className="rounded-lg bg-white/80" />
            <span className="rounded-lg bg-cream" />
            <span className="rounded-lg bg-blush/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
