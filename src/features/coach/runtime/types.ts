import type { SupportedLocale } from '@/i18n/config';

export type CoachSection =
  | 'overview'
  | 'trainees'
  | 'trainee'
  | 'programs'
  | 'prepare'
  | 'exercises'
  | 'release'
  | 'completions'
  | 'reconciliation'
  | 'admin';
export type RecordRow = Record<string, unknown>;
export interface CoachItem {
  ref: string;
  title: string;
  description: string;
  status: string;
  date: string;
  versionRef: string;
  version: number;
  extra: RecordRow;
}
export interface CoachDataset {
  items: CoachItem[];
  error: boolean;
  total: number | null;
}
export interface CoachData {
  primary: CoachDataset;
  secondary: CoachDataset;
  tertiary: CoachDataset;
  disclosures?: CoachDataset;
  authority?: {
    principals: CoachItem[];
    grants: CoachItem[];
    roles: { value: string; label: string }[];
    capabilities: { value: string; label: string }[];
    resources: { value: string; label: string }[];
    error: boolean;
  };
}
export function row(value: unknown): RecordRow {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordRow)
    : {};
}
export function textValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
export function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
export function localized(value: unknown, locale: SupportedLocale): string {
  return typeof value === 'string'
    ? value
    : textValue(row(value)[locale]) || textValue(row(value).en);
}
export function collection(value: unknown): RecordRow[] {
  return Array.isArray(value) ? value.map(row) : [];
}
export function latestVersion(value: unknown, locale?: SupportedLocale): RecordRow {
  const versions = collection(value);
  const selected = locale ? versions.filter((version) => version.locale === locale) : versions;
  return (
    [...(selected.length ? selected : versions.filter((version) => version.locale === 'en'))].sort(
      (a, b) => numberValue(b.version_number) - numberValue(a.version_number),
    )[0] ?? {}
  );
}
export function titleFrom(value: unknown, locale: SupportedLocale, fallback: string): string {
  const object = row(value);
  return (
    localized(object.title, locale) ||
    localized(object.displayName, locale) ||
    localized(object.display_name, locale) ||
    fallback
  );
}
