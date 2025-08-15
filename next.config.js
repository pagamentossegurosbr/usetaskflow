/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================
  // CONFIGURAÇÕES DE DESENVOLVIMENTO
  // ========================================
  
  // Desabilitar verificações durante o build para velocidade
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ========================================
  // OTIMIZAÇÕES DE PERFORMANCE
  // ========================================
  
  // Compressão e minificação
  swcMinify: true,
  compress: true,
  
  // Otimizações de imagens
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Otimizações de bundle
  experimental: {
    serverActions: true,
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts',
    ],
  },
  
  // ========================================
  // SEGURANÇA E CORS
  // ========================================
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // CORS headers para desenvolvimento
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000' 
              : process.env.NEXTAUTH_URL || 'https://your-domain.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
      // Headers específicos para APIs
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
          // CORS headers específicos para APIs
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000' 
              : process.env.NEXTAUTH_URL || 'https://your-domain.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
      // Headers para assets estáticos
      {
        source: '/:path*.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // ========================================
  // REDIRECIONAMENTOS
  // ========================================
  
  async redirects() {
    return [
      // Redirecionar HTTP para HTTPS apenas em produção
      ...(process.env.NODE_ENV === 'production' ? [{
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://:host/:path*',
        permanent: true,
      }] : []),
    ];
  },
  
  // ========================================
  // CONFIGURAÇÕES DE SERVIDOR
  // ========================================
  
  // Configurações de servidor para headers grandes
  serverRuntimeConfig: {
    maxHeaderSize: 32768, // 32KB
  },
  
  // ========================================
  // WEBPACK CONFIGURAÇÕES
  // ========================================
  
  webpack: (config, { isServer, dev }) => {
    // Otimizações para servidor
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    
    // Otimizações para produção
    if (!dev && !isServer) {
      // Split chunks otimizado
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // ========================================
  // CONFIGURAÇÕES DE BUILD
  // ========================================
  
  // Source maps apenas em desenvolvimento
  productionBrowserSourceMaps: false,
  
  // Remover header "Powered by"
  poweredByHeader: false,
  
  // ========================================
  // CONFIGURAÇÕES DE CACHE
  // ========================================
  
  // Cache de build
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // ========================================
  // CONFIGURAÇÕES DE LOGS
  // ========================================
  
  // Logs de build
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
