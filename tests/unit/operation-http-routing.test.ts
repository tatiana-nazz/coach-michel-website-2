import { describe, it, expect } from 'vitest';
import { matchOperation, shouldRouteToApi } from '@/platform/api/route-matcher';
import { productionOperationDescriptors } from '@/platform/api/operations';

describe('production API route negotiation', () => {
  it('resolves every registered production operation at its existing path', () => {
    for (const operation of productionOperationDescriptors) {
      const path = operation.path.replace(/\{[a-zA-Z0-9_]+\}/g, 'opaque-123');
      expect(matchOperation(operation.method, path)?.operation.operationId).toBe(
        operation.operationId,
      );
    }
  });
  it('keeps the trainee page and JSON endpoint separate at the same URL', () => {
    expect(shouldRouteToApi('GET', '/trainee/today', 'text/html,application/xhtml+xml')).toBe(
      false,
    );
    expect(shouldRouteToApi('GET', '/trainee/today', 'application/json')).toBe(true);
    expect(shouldRouteToApi('GET', '/coach/trainees', 'text/html')).toBe(false);
    expect(shouldRouteToApi('GET', '/coach/trainees', 'application/json')).toBe(true);
  });
  it('routes commands and non-page queries without replacing ordinary pages', () => {
    expect(shouldRouteToApi('POST', '/coach/session-drafts', '*/*')).toBe(true);
    expect(shouldRouteToApi('GET', '/public/overview', '*/*')).toBe(true);
    expect(shouldRouteToApi('GET', '/about', 'application/json')).toBe(false);
    expect(matchOperation('DELETE', '/coach/session-drafts')).toBeNull();
  });
  it('decodes references exactly once and rejects malformed or path traversal refs', () => {
    expect(matchOperation('GET', '/coach/trainees/person%2F123')?.params).toEqual({
      trainee_ref: 'person/123',
    });
    expect(matchOperation('GET', '/coach/trainees/%2E%2E')).toBeNull();
    expect(matchOperation('GET', '/coach/trainees/%zz')).toBeNull();
    expect(matchOperation('GET', '/coach/trainees/%00')).toBeNull();
  });
});
