export const SITE_NAME = 'Terra';
export const SITE_DESCRIPTION =
  'Terra is a free, open-source SSH client for macOS, Windows and Linux with split terminals, SFTP, port forwarding and encrypted sync you can self-host.';

export const REPOS = {
  monorepo: 'https://github.com/nhridoy/terra',
  client: 'https://github.com/nhridoy/terra-client',
  server: 'https://github.com/nhridoy/terra-server',
  web: 'https://github.com/nhridoy/terra-web',
} as const;

export const NAV_ITEMS = [
  { label: 'Features', href: '/#features' },
  { label: 'Download', href: '/download' },
  { label: 'Docs', href: '/docs' },
  { label: 'Security', href: '/security' },
  { label: 'Releases', href: '/releases' },
  { label: 'Community', href: '/community' },
] as const;

export const INSTALL_COMMANDS = {
  unix: 'curl -fsSL https://raw.githubusercontent.com/nhridoy/terra-client/main/install.sh | bash',
  windows:
    'irm https://raw.githubusercontent.com/nhridoy/terra-client/main/install.ps1 | iex',
} as const;

/** Page path as served (`/download`), from Astro's file-format path (`/download.html`). */
export function cleanPath(pathname: string): string {
  return pathname.replace(/\.html$/, '').replace(/\/index$/, '') || '/';
}
