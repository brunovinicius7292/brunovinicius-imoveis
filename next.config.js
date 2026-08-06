// Host do Supabase Storage extraído da própria env var pública, para não
// duplicar a URL do projeto aqui e continuar funcionando em outros ambientes
// (dev/preview/produção) sem editar este arquivo.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    formats: ["image/avif", "image/webp"],
    // Fotos de imóveis raramente mudam depois de publicadas: mantemos a
    // versão otimizada no cache da Vercel por 1 ano, mesmo que o
    // Cache-Control do objeto no Supabase seja mais curto.
    minimumCacheTTL: 31536000,
  },
};

module.exports = nextConfig;
