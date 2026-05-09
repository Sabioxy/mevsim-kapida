export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-emerald-950 sm:text-xl">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-emerald-800/80">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
