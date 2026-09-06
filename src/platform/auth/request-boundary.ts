/** Trust a configured deployment origin, never arbitrary forwarded-host headers. */
export function accessApplicationOrigin(request: Request): string {
  const configured = process.env.CMH_APP_ORIGIN;
  if (configured === undefined) return new URL(request.url).origin;
  const url = new URL(configured);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.origin !== configured ||
    url.username ||
    url.password
  )
    throw new Error('Invalid application origin');
  return url.origin;
}
export function isSameAccessOrigin(request: Request): boolean {
  try {
    return request.headers.get('origin') === accessApplicationOrigin(request);
  } catch {
    return false;
  }
}
export const accessNoStoreHeaders = { 'Cache-Control': 'private, no-store' } as const;
export function accessJson(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: accessNoStoreHeaders });
}
export function accessError(code: string, status: number): Response {
  return accessJson({ error: { code } }, status);
}
export function isSameOriginMutation(request: Request): boolean {
  return (
    isSameAccessOrigin(request) &&
    request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() === 'application/json'
  );
}
export async function readSmallJson(request: Request): Promise<unknown> {
  if (!isSameOriginMutation(request)) throw new Error('VALIDATION_FAILED');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('VALIDATION_FAILED');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 16_384) {
      await reader.cancel();
      throw new Error('VALIDATION_FAILED');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
