/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Fotos de imóveis (Supabase Storage) — usado pelos cards do Radar de
      // compatibilidade (components/admin/FotoCardRadar.tsx) com next/image.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Miniaturas de vídeo do YouTube (lib/utils/youtube.ts).
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
};

module.exports = nextConfig;
