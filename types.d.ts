// types.d.ts
import { NextRequest } from 'next/server';

declare module 'next' {
  interface RouteHandlerContext {
    params: Record<string, string>;
  }
  
  type RouteHandler = (
    req: NextRequest | Request,
    context: RouteHandlerContext
  ) => Promise<Response> | Response;
}
