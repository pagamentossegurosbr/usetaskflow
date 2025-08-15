interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requisições por janela
  message?: string; // Mensagem de erro personalizada
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();
    
    const key = this.getKey(identifier);
    const now = Date.now();
    
    if (!this.store[key] || this.store[key].resetTime < now) {
      // Reset ou primeira requisição
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: this.store[key].resetTime
      };
    }

    if (this.store[key].count >= this.config.maxRequests) {
      // Limite excedido
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime
      };
    }

    // Incrementar contador
    this.store[key].count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime
    };
  }

  reset(identifier: string): void {
    const key = this.getKey(identifier);
    delete this.store[key];
  }

  getInfo(identifier: string): { count: number; remaining: number; resetTime: number } | null {
    const key = this.getKey(identifier);
    const now = Date.now();
    
    if (!this.store[key] || this.store[key].resetTime < now) {
      return null;
    }

    return {
      count: this.store[key].count,
      remaining: this.config.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime
    };
  }
}

// Configurações de rate limiting para diferentes endpoints
export const rateLimiters = {
  // Rate limiting para criação de tarefas (5 por minuto)
  taskCreation: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 5,
    message: 'Muitas tarefas criadas. Aguarde um pouco antes de criar mais.'
  }),

  // Rate limiting para XP (10 por minuto)
  xpGain: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10,
    message: 'Muitas atualizações de XP. Aguarde um pouco.'
  }),

  // Rate limiting para Pomodoro (3 por minuto)
  pomodoro: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 3,
    message: 'Muitas sessões Pomodoro. Aguarde um pouco.'
  }),

  // Rate limiting para autenticação (3 por minuto)
  auth: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 3,
    message: 'Muitas tentativas de login. Aguarde um pouco.'
  }),

  // Rate limiting para API geral (100 por minuto)
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100,
    message: 'Muitas requisições. Aguarde um pouco.'
  })
};

// Função helper para verificar rate limit
export function checkRateLimit(
  limiter: RateLimiter, 
  identifier: string
): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
  const result = limiter.checkLimit(identifier);
  
  return {
    ...result,
    message: result.allowed ? undefined : 'Rate limit excedido. Tente novamente em alguns segundos.'
  };
}

// Função para obter headers de rate limit
export function getRateLimitHeaders(
  limiter: RateLimiter,
  identifier: string
): Record<string, string> {
  const info = limiter.getInfo(identifier);
  
  if (!info) {
    return {
      'X-RateLimit-Limit': '0',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '0'
    };
  }

  return {
    'X-RateLimit-Limit': info.count.toString(),
    'X-RateLimit-Remaining': info.remaining.toString(),
    'X-RateLimit-Reset': info.resetTime.toString()
  };
}

// Middleware para Next.js API routes
export function withRateLimit(
  limiter: RateLimiter,
  getIdentifier: (req: Request) => string
) {
  return function(handler: Function) {
    return async function(req: Request, ...args: any[]) {
      const identifier = getIdentifier(req);
      const rateLimitResult = checkRateLimit(limiter, identifier);
      
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({ 
            error: rateLimitResult.message || 'Rate limit excedido' 
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
              ...getRateLimitHeaders(limiter, identifier)
            }
          }
        );
      }

      // Adicionar headers de rate limit à resposta
      const response = await handler(req, ...args);
      
      if (response instanceof Response) {
        const headers = new Headers(response.headers);
        Object.entries(getRateLimitHeaders(limiter, identifier)).forEach(([key, value]) => {
          headers.set(key, value);
        });
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }

      return response;
    };
  };
}

// Função para obter identificador do usuário
export function getUserIdentifier(req: Request): string {
  // Em produção, você deve usar o ID do usuário autenticado
  // Por enquanto, vamos usar o IP como fallback
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  // Se tiver session, usar o email do usuário
  // Isso seria implementado com NextAuth
  return ip;
}

// Função para obter identificador por IP
export function getIPIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}
