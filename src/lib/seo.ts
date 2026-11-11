import type { OS } from './platform';
import type { Release } from './releases';
import { REPOS } from './site';

export const SITE_URL = 'https://terra.iamnahid.com';

export interface PageMeta {
  title: string;
  description: string;
}

export const PAGES = {
  '/': {
    title: 'Terra · Free open-source SSH client and Termius alternative',
    description:
      'Terra is a free, open-source SSH client for macOS, Windows and Linux with split terminals, SFTP, port forwarding and encrypted sync you can self-host.',
  },
  '/download': {
    title: 'Download Terra · Free SSH client for macOS, Windows, Linux',
    description:
      'Download Terra, the free open-source SSH client, for macOS, Windows and Linux on x64 and ARM64. One-line installers plus DMG, EXE, AppImage and DEB builds.',
  },
  '/download/windows': {
    title: 'Free open-source SSH client for Windows · Terra',
    description:
      'Install Terra, a free open-source SSH and SFTP client for Windows on x64 and ARM64, with one PowerShell command or the installer, plus first-launch steps.',
  },
  '/download/macos': {
    title: 'Free open-source SSH client for Mac · Terra',
    description:
      'Install Terra, a free open-source SSH and SFTP client for macOS on Apple Silicon and Intel, with one Terminal command or the DMG, plus first-launch steps.',
  },
  '/download/linux': {
    title: 'Free open-source SSH client for Linux · Terra',
    description:
      'Install Terra, a free open-source SSH and SFTP client for Linux on x64 and ARM64, as an AppImage or a .deb, with a one-line installer and removal steps.',
  },
  '/termius-alternative': {
    title: 'Open-source Termius alternative · Terra',
    description:
      'Looking for a Termius alternative? Terra is a free, MIT-licensed SSH client with SFTP, port forwarding and encrypted sync you can run on your own server.',
  },
  '/self-hosted': {
    title: 'Self-hosted SSH sync server · Terra',
    description:
      "Run Terra's open-source sync server with Docker and PostgreSQL. Keep SSH hosts, private keys and team vaults encrypted on infrastructure you control.",
  },
  '/changelog': {
    title: 'Terra changelog · Every release and its downloads',
    description:
      'Every Terra release with its notes and downloads for macOS, Windows and Linux. Terra is the free, open-source SSH client and Termius alternative.',
  },
  '/docs': {
    title: 'Terra docs · Install, self-host and secure Terra',
    description:
      'Guides to install the Terra SSH client, self-host the sync server, understand the security model and fix common problems on macOS, Windows and Linux.',
  },
  '/security': {
    title: 'Terra security · How your SSH keys stay encrypted',
    description:
      'Terra encrypts your vault on your device with Argon2id and XChaCha20-Poly1305. The sync server stores ciphertext, and SSH connects directly to your hosts.',
  },
  '/community': {
    title: 'Terra community · Contribute to the open-source SSH client',
    description:
      'Terra is MIT licensed and built in the open. Browse the client, server and website repositories, report issues and send your first pull request.',
  },
} satisfies Record<string, PageMeta>;

export type StaticPath = keyof typeof PAGES;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function ogImagePath(pathname: string): string {
  return pathname === '/' ? '/og/index.png' : `/og${pathname}.png`;
}

const OS_LABELS: Partial<Record<OS, string>> = {
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
};

export function siteJsonLd(): object[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Terra',
      url: `${SITE_URL}/`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Terra',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/favicon.svg`,
      sameAs: Object.values(REPOS),
    },
  ];
}

export function softwareJsonLd(release: Release, os?: OS): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Terra',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: (os && OS_LABELS[os]) ?? 'macOS, Windows, Linux',
    softwareVersion: release.tag_name,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: REPOS.client,
    downloadUrl: absoluteUrl(os ? `/download/${os}` : '/download'),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function techArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  updated?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(input.updated && { dateModified: input.updated }),
    publisher: { '@type': 'Organization', name: 'Terra', url: `${SITE_URL}/` },
  };
}
