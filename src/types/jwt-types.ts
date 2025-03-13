export interface JwtPayload {
  id: string;
  username: string;
  // Allow for additional string-indexed properties
  [key: string]: string | number | boolean;
}

export interface JwtOptions {
  expiresIn?: string | number;
  algorithm?: string;
  audience?: string | string[];
  issuer?: string;
  jwtid?: string;
  subject?: string;
  notBefore?: string | number;
  header?: Record<string, unknown>;
  keyid?: string;
  mutatePayload?: boolean;
  noTimestamp?: boolean;
  encoding?: string;
} 