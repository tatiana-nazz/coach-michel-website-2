import { productionOperationDescriptors } from './operations';
import { deliveryOperationDescriptors } from './delivery-operations';
import { screenRouteDefinitions } from '@/platform/routing/screen-routes';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const compiled = [...productionOperationDescriptors, ...deliveryOperationDescriptors].map(
  (operation) => {
    const names: string[] = [];
    const pattern = operation.path
      .split('/')
      .map((segment) => {
        const parameter = /^\{([a-zA-Z0-9_]+)\}$/.exec(segment);
        if (parameter?.[1]) {
          names.push(parameter[1]);
          return '([^/]+)';
        }
        return escapeRegex(segment);
      })
      .join('/');
    return { operation, names, pattern: new RegExp(`^${pattern}/?$`) };
  },
);
const pages = Object.values(screenRouteDefinitions).map(
  (screen) =>
    new RegExp(
      `^${screen.routeTemplate
        .split('/')
        .map((segment) => (/^\[.+\]$/.test(segment) ? '[^/]+' : escapeRegex(segment)))
        .join('/')}/?$`,
    ),
);

export function matchOperation(method: string, pathname: string) {
  for (const candidate of compiled) {
    if (candidate.operation.method !== method) continue;
    const match = candidate.pattern.exec(pathname);
    if (!match) continue;
    const params: Record<string, string> = {};
    try {
      candidate.names.forEach((name, index) => {
        const value = decodeURIComponent(match[index + 1] ?? '');
        if (
          !value.trim() ||
          value.length > 200 ||
          value === '.' ||
          value === '..' ||
          /[\u0000-\u001f]/.test(value)
        )
          throw Error('Invalid reference');
        params[name] = value;
      });
    } catch {
      return null;
    }
    return { operation: candidate.operation, params };
  }
  return null;
}

export function shouldRouteToApi(method: string, pathname: string, accept: string): boolean {
  if (!matchOperation(method, pathname)) return false;
  if (method !== 'GET' || !pages.some((pattern) => pattern.test(pathname))) return true;
  // The accepted page/API collisions explicitly negotiate JSON for API clients.
  return (
    accept.toLowerCase().includes('application/json') && !accept.toLowerCase().includes('text/html')
  );
}
