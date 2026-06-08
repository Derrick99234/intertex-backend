import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private allowedOrigins: string[];

  constructor() {
    const raw = process.env.CORS_ORIGIN || '';
    this.allowedOrigins = raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
      return;
    }

    const origin = req.headers['origin'] as string | undefined;
    const referer = req.headers['referer'] as string | undefined;
    const source = origin || referer;

    if (!source) {
      next();
      return;
    }

    try {
      const parsed = new URL(source);
      const isAllowed =
        this.allowedOrigins.length === 0 ||
        this.allowedOrigins.some(
          (allowed) =>
            parsed.hostname === new URL(allowed).hostname ||
            parsed.hostname.endsWith('.intertexng.shop') ||
            parsed.hostname === 'localhost' ||
            parsed.hostname === '127.0.0.1',
        );

      if (!isAllowed) {
        res.status(403).json({ message: 'CSRF validation failed' });
        return;
      }
    } catch {
      next();
      return;
    }

    next();
  }
}
