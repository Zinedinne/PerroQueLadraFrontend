import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

<<<<<<< HEAD
  
=======
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
        source: '/perfil',
        destination: '/eventos',
        permanent: false,
      },
      
    ];
  },
>>>>>>> 0616f1925c9f2bcaa55420195b9d60f1ecd92e22
};

export default nextConfig;
