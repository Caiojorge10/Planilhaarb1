/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações do Next.js
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://planilharb1.onrender.com/api/:path*',
      },
    ]
  },
}
 
module.exports = nextConfig 