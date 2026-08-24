import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));

const expectedMigrations = [
  [
    '20260824063341_0001_authorization_core.sql',
    '1dfe68599a2bff5fc8bd2ea597794eeb0a1b92a0fa22d9eb7bcfb6604d195cc7',
  ],
  [
    '20260824063413_0002_access_content_policy_core.sql',
    '3ff7aaf1b1a184599efc3098feddbc147e61dd0d50886c2a9ed808fa39605543',
  ],
  [
    '20260824063442_0003_training_completion_core.sql',
    '9f321608a7082be7da2e0c78cec6070f3b3191ceaca236634889b5ce7378c730',
  ],
  [
    '20260824063511_0004_reconciliation_support_operations.sql',
    '6d23200930cb6a265d74ba5bb6bbf14ee79c636333e834689af8609156b8bac8',
  ],
  [
    '20260824063543_0005_rls_indexes_seed_catalogs.sql',
    '84a45f6e38aa7f6ff3e328b7b8e6c5934c4d1aed8cd7b59f1ba82026f3bb866a',
  ],
  [
    '20260824064700_0006_supabase_acl_rls_hardening.sql',
    'd83c122b727f43d6c629536fc0bc15dfce923f929c7993fee9439b07e5704282',
  ],
] as const;

function readRepositoryFile(relativePath: string): Buffer {
  return readFileSync(`${repositoryRoot}/${relativePath}`);
}

function sha256(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

describe('P4-S06 governed Supabase source synchronization', () => {
  it('binds the server source to the dedicated Coach Michel Supabase project', () => {
    const source = readRepositoryFile('src/platform/auth/supabase-server.ts').toString('utf8');

    expect(source).toContain("export const SUPABASE_PROJECT_ID = 'szlcakassgylokircuxs';");
    expect(source).not.toContain('diawtfefkwgsukntogip');
  });

  it('materializes the exact six provider-applied migrations as repository source of truth', () => {
    const migrationDirectory = `${repositoryRoot}/supabase/migrations`;
    const actualNames = readdirSync(migrationDirectory)
      .filter((name) => name.endsWith('.sql'))
      .sort();
    const expectedNames = expectedMigrations.map(([name]) => name).sort();

    expect(actualNames).toEqual(expectedNames);

    for (const [name, expectedHash] of expectedMigrations) {
      expect(sha256(readFileSync(`${migrationDirectory}/${name}`))).toBe(expectedHash);
    }
  });
});
