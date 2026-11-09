export const SITE_NAME = 'Terra';
export const SITE_DESCRIPTION =
  'The open-source, self-hostable SSH client. Direct SSH, encrypted vaults, SFTP, and port forwarding in one desktop workspace.';

export const REPOS = {
  monorepo: 'https://github.com/nhridoy/terra',
  client: 'https://github.com/nhridoy/terra-client',
  server: 'https://github.com/nhridoy/terra-server',
  web: 'https://github.com/nhridoy/terra-web',
} as const;

export const NAV_ITEMS = [
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
