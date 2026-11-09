import type { Arch, OS } from './platform';

export type Format = 'dmg' | 'exe' | 'appimage' | 'deb';

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  body: string;
  assets: ReleaseAsset[];
}

export interface PlatformAsset {
  os: OS;
  arch: Arch;
  format: Format;
  label: string;
  url: string;
  size: number;
}

const FORMATS: Record<string, Format> = {
  dmg: 'dmg',
  exe: 'exe',
  appimage: 'appimage',
  deb: 'deb',
};

function extension(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toLowerCase() : '';
}

function archOf(name: string): Arch {
  const lower = name.toLowerCase();
  if (/(aarch64|arm64|apple[-_ ]?silicon)/.test(lower)) return 'arm64';
  if (/(x86_64|amd64|x64|intel)/.test(lower)) return 'x64';
  return 'unknown';
}

function labelFor(os: OS, arch: Arch, format: Format): string {
  const osName =
    os === 'macos' ? 'macOS' : os === 'windows' ? 'Windows' : 'Linux';
  const archName = arch === 'arm64' ? 'ARM64' : 'x64';
  const formatName =
    format === 'dmg'
      ? 'DMG'
      : format === 'exe'
        ? 'Installer'
        : format === 'appimage'
          ? 'AppImage'
          : 'DEB';
  return `${osName} ${archName} (${formatName})`;
}

export function parseRelease(raw: unknown): Release {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid release payload');
  }

  const value = raw as Record<string, unknown>;
  const assets = Array.isArray(value.assets) ? value.assets : [];

  return {
    tag_name: String(value.tag_name ?? ''),
    name: String(value.name ?? value.tag_name ?? ''),
    published_at: String(value.published_at ?? ''),
    html_url: String(value.html_url ?? ''),
    prerelease: Boolean(value.prerelease),
    body: String(value.body ?? ''),
    assets: assets
      .map((asset) => {
        const item = asset as Record<string, unknown>;
        return {
          name: String(item.name ?? ''),
          browser_download_url: String(item.browser_download_url ?? ''),
          size: Number(item.size ?? 0),
        };
      })
      .filter((asset) => asset.name && asset.browser_download_url),
  };
}

export function mapAssets(release: Release): PlatformAsset[] {
  const mapped: PlatformAsset[] = [];

  for (const asset of release.assets) {
    const format = FORMATS[extension(asset.name)];
    if (!format) continue;

    const os: OS =
      format === 'dmg' ? 'macos' : format === 'exe' ? 'windows' : 'linux';
    const arch = archOf(asset.name);
    if (arch === 'unknown') continue;

    mapped.push({
      os,
      arch,
      format,
      label: labelFor(os, arch, format),
      url: asset.browser_download_url,
      size: asset.size,
    });
  }

  return mapped;
}

export function pickRecommended(
  assets: PlatformAsset[],
  platform: { os: OS; arch: Arch },
): PlatformAsset | null {
  const sameOs = assets.filter((asset) => asset.os === platform.os);
  if (sameOs.length === 0) return null;

  const sameArch = sameOs.filter((asset) => asset.arch === platform.arch);
  const pool = sameArch.length > 0 ? sameArch : sameOs;
  const preference: Format[] =
    platform.os === 'linux'
      ? ['appimage', 'deb', 'dmg', 'exe']
      : ['dmg', 'exe', 'appimage', 'deb'];

  for (const format of preference) {
    const found = pool.find((asset) => asset.format === format);
    if (found) return found;
  }

  return pool[0] ?? null;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${rounded} ${units[exponent]}`;
}

export function formatReleaseDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
