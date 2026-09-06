import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const SUPABASE_PROJECT_ID = 'szlcakassgylokircuxs';

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = requiredEnvironmentValue('NEXT_PUBLIC_SUPABASE_URL');
  const publishableKey = requiredEnvironmentValue('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch (error) {
          // Server Components cannot persist cookies. The proxy already refreshes them.
          if (!(error instanceof Error) || !error.message.includes('Cookies can only be modified'))
            throw error;
        }
      },
    },
  });
}
