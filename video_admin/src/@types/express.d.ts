declare namespace Express {
  export interface Request {
    user: {
      id: string;
    };
    span: import('@opentelemetry/api').Span;
  }
}