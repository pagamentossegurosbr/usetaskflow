import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ========================================
// MIDDLEWARE PARA CORS E AUTENTICAÇÃO
// ========================================

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ========================================
  // CONFIGURAÇÃO DE CORS
  // ========================================
  
  // Determinar origem permitida baseada no ambiente
  const allowedOrigin = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.NEXTAUTH_URL || 'https://your-domain.com';

  // Headers de CORS
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // ========================================
  // HEADERS DE SEGURANÇA
  // ========================================
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // ========================================
  // HANDLING DE REQUESTS OPTIONS (CORS PREFLIGHT)
  // ========================================
  
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // ========================================
  // PROTEÇÃO DE ROTAS API
  // ========================================
  
  // Proteger rotas de API que requerem autenticação
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/auth/') &&
      !request.nextUrl.pathname.startsWith('/api/webhooks/')) {
    
    // Verificar se há token de autenticação
    const authHeader = request.headers.get('authorization');
    const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!authHeader && !sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // ========================================
  // REDIRECIONAMENTOS ESPECÍFICOS
  // ========================================
  
  // Redirecionar HTTP para HTTPS em produção
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') === 'http') {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    return NextResponse.redirect(url, 301);
  }

  // ========================================
  // LOGGING PARA DESENVOLVIMENTO
  // ========================================
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`);
  }

  return response;
}

// ========================================
// CONFIGURAÇÃO DE MATCHING
// ========================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};