export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {subtitle ? <p className="text-sm text-neutral-600 mt-1">{subtitle}</p> : null}
    </div>
  );
}