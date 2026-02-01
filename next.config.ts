import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async redirects() {
    return [
      
      {
        source: '/productos/:path*',
        destination: '/eventos',
        permanent: false,
      },
      {
        source: '/carrito',
        destination: '/eventos',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/eventos',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/eventos',
        permanent: false,
      },
      {
        source: '/perfil',
        destination: '/eventos',
        permanent: false,
      },
      
    ];
  },
};

export default nextConfig;