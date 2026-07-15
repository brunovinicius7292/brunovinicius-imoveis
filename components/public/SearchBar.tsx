"use client";
export default function SearchBar() {
  return (
    <form
      className="flex w-full flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg shadow-navy-900/10 sm:flex-row sm:items-center"
      
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <svg
          aria-hidden="true"
          className="h-5 w-5 flex-shrink-0 text-navy-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 5.35 5.35a7.5 7.5 0 0 0 11.3 11.3Z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por cidade, bairro ou título do imóvel"
          className="w-full border-none bg-transparent py-2 font-body text-navy-800 placeholder:text-navy-300 focus:outline-none focus:ring-0"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-navy-800 px-6 py-3 font-body text-sm font-semibold text-white transition hover:bg-navy-700"
      >
        Buscar
      </button>
    </form>
  );
}
