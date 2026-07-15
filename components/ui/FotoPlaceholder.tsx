export default function FotoPlaceholder({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-navy-100 ${className}`}
      role="img"
      aria-label="Foto do imóvel indisponível"
    >
      <svg
        aria-hidden="true"
        className="h-10 w-10 text-navy-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 4.5h18a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V5.25A.75.75 0 0 1 3 4.5Z"
        />
        <circle cx="8.25" cy="8.25" r="1.5" />
      </svg>
    </div>
  );
}
