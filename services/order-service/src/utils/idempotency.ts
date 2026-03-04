import { randomUUID } from 'crypto';
export function getIdempotencyKey(headers: Record<string, any>): string {
  const key = headers['idempotency-key'];
  if (typeof key === 'string' && key.trim()) {
    return key.trim();
  }
  return randomUUID();
}

export interface IdempotentResponse {
  isFromCache: boolean;
  data: any;
  timestamp: string;
}

export function generateEventId(): string {
  return randomUUID();
}

export function createEventId(
  eventType: string,
  sourceId: string
): string {
  return `${eventType}:${sourceId}:${randomUUID()}`;
}

export function isValidIdempotencyKey(key: any): boolean {
  return typeof key === 'string' && key.trim().length > 0 && key.trim().length <= 255;
}

export function handleIdempotencyConflict(error: any): boolean {
  const isUniqueViolation = error?.code === '23505';
  return isUniqueViolation;
}


export const IDEMPOTENCY_KEY_RETENTION_HOURS = 48;
