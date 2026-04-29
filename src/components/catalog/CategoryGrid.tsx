import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/#category-${c.slug}`}
          className="rounded-xl border border-neutral-200 bg-white p-4 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}
