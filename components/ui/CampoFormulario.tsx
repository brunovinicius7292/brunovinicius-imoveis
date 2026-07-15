export const classesInput =
  "w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-navy-800 focus:border-gold-400 focus:outline-none";

export function Campo({
  label,
  obrigatorio,
  className = "",
  children,
}: {
  label: string;
  obrigatorio?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block font-body text-sm font-medium text-navy-700">
        {label}
        {obrigatorio && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
