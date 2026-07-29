import * as fs from 'fs';
import * as path from 'path';

export const repoRoot = path.resolve(__dirname, '..');

export function read(relPath: string): string {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf-8').replace(/\r\n/g, '\n');
}

export function readJson<T = Record<string, unknown>>(relPath: string): T {
  return JSON.parse(read(relPath)) as T;
}

export function exists(relPath: string): boolean {
  return fs.existsSync(path.join(repoRoot, relPath));
}

export function steeringFiles(): string[] {
  return fs
    .readdirSync(path.join(repoRoot, 'steering'))
    .filter((f) => f.endsWith('.md'))
    .sort();
}

export function walkJson(relDir: string): string[] {
  const out: string[] = [];
  const abs = path.join(repoRoot, relDir);
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(relDir, entry.name);
    if (entry.isDirectory()) out.push(...walkJson(rel));
    else if (entry.name.endsWith('.json')) out.push(rel);
  }
  return out;
}

export function marketProfilePaths(): string[] {
  return walkJson('templates/market-profiles')
    .filter((p) => !path.basename(p).startsWith('_'))
    .sort();
}

export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'UNVERIFIED'] as const;

export const FEATURE_STATUS_VALUES = [
  'allowed',
  'restricted',
  'prohibited',
  'unverified',
] as const;

export const LEGAL_STATUS_VALUES = [
  'regulated',
  'regulated-arcade',
  'compact-based',
  'prohibited',
  'grey',
  'offshore-only',
  'in-transition',
] as const;

export const CLASSIFICATION_TEST_VALUES = [
  'predominant-factor',
  'material-element',
  'any-chance',
  'chance-influence',
  'administrative-classification',
  'not-applicable',
  'unverified',
] as const;

export const EXPECTED_READMES = [
  { file: 'README.md', label: 'English' },
  { file: 'README_ZH.md', label: '繁體中文' },
  { file: 'README_CN.md', label: '简体中文' },
  { file: 'README_JP.md', label: '日本語' },
  { file: 'README_KR.md', label: '한국어' },
] as const;
