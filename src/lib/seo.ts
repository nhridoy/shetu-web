import type {
  BreadcrumbList,
  Organization,
  SoftwareApplication,
  TechArticle,
  Thing,
  WebSite,
  WithContext,
} from 'schema-dts';
import type { OS } from './platform';
import type { Release } from './releases';
import { REPOS } from './site';

/** One schema.org node with its @context, typed by schema-dts. */
export type JsonLd = WithContext<Thing>;

export const SITE_URL = 'https://shetu.iamnahid.com';

export interface PageMeta {
  title: string;
  description: string;
}

export const PAGES = {
  '/': {
    title: 'Shetu · Free open-source SSH client and Termius alternative',
    description:
      'Shetu is a free, open-source SSH client for macOS, Windows and Linux with split terminals, SFTP, port forwarding and encrypted sync you can self-host.',
  },
  '/download': {
    title: 'Download Shetu · Free SSH client for macOS, Windows, Linux',
    description:
      'Download Shetu, the free open-source SSH client, for macOS, Windows and Linux on x64 and ARM64. One-line installers plus DMG, EXE, AppImage and DEB builds.',
  },
  '/download/windows': {
    title: 'Free open-source SSH and SFTP client for Windows · Shetu',
    description:
      'Install Shetu, a free open-source SSH and SFTP client for Windows on x64 and ARM64, with one PowerShell command or the installer, plus first-launch steps.',
  },
  '/download/macos': {
    title: 'Free open-source SSH and SFTP client for Mac · Shetu',
    description:
      'Install Shetu, a free open-source SSH and SFTP client for macOS on Apple Silicon and Intel, with one Terminal command or the DMG, plus first-launch steps.',
  },
  '/download/linux': {
    title: 'Free open-source SSH and SFTP client for Linux · Shetu',
    description:
      'Install Shetu, a free open-source SSH and SFTP client for Linux on x64 and ARM64, as an AppImage or a .deb, with a one-line installer and removal steps.',
  },
  '/termius-alternative': {
    title: 'Free, open-source Termius alternative for SSH · Shetu',
    description:
      'Looking for a Termius alternative? Shetu is a free, MIT-licensed SSH client with SFTP, port forwarding and encrypted sync you can run on your own server.',
  },
  '/self-hosted': {
    title: 'Self-hosted SSH sync server with Docker and Postgres · Shetu',
    description:
      "Run Shetu's open-source sync server with Docker and PostgreSQL. Keep SSH hosts, private keys and team vaults encrypted on infrastructure you control.",
  },
  '/changelog': {
    title: 'Shetu changelog · Every SSH client release and its downloads',
    description:
      'Every Shetu release with its notes and downloads for macOS, Windows and Linux. Shetu is the free, open-source SSH client and Termius alternative.',
  },
  '/docs': {
    title: 'Shetu docs · Install, self-host and secure your SSH client',
    description:
      'Guides to install the Shetu SSH client, self-host the sync server, understand the security model and fix common problems on macOS, Windows and Linux.',
  },
  '/security': {
    title: 'Shetu security · How your SSH private keys stay encrypted',
    description:
      'Shetu encrypts your vault on your device with Argon2id and XChaCha20-Poly1305. The sync server stores ciphertext, and SSH connects directly to your hosts.',
  },
  '/community': {
    title: 'Shetu community · Contribute to the open-source SSH client',
    description:
      'Shetu is MIT licensed and built in the open. Browse the client, server and website repositories, report issues and send your first pull request.',
  },
  '/privacy': {
    title: 'Shetu privacy policy · What the SSH client collects',
    description:
      'How Shetu handles your data: no tracking on this site, no telemetry in the app, and a sync server that stores your account and an encrypted vault.',
  },
  '/terms': {
    title: 'Shetu terms of use · Rules for the site and sync server',
    description:
      'The terms for using the Shetu website and hosted sync server. The open-source desktop client and server code stay under the MIT license.',
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

export function siteJsonLd(): [
  WithContext<WebSite>,
  WithContext<Organization>,
] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Shetu',
      url: `${SITE_URL}/`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Shetu',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/favicon.svg`,
      sameAs: Object.values(REPOS),
    },
  ];
}

export function softwareJsonLd(
  release: Release,
  os?: OS,
): WithContext<SoftwareApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Shetu',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: (os && OS_LABELS[os]) ?? 'macOS, Windows, Linux',
    softwareVersion: release.tag_name,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isAccessibleForFree: true,
    license: 'https://opensource.org/licenses/MIT',
    sameAs: REPOS.client,
    downloadUrl: absoluteUrl(os ? `/download/${os}` : '/download'),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map(
      (item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path),
      }),
    ),
  };
}

export function techArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  updated?: string;
  published?: string;
}): WithContext<TechArticle> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    image: absoluteUrl(ogImagePath(input.path)),
    author: { '@type': 'Organization', name: 'Shetu', url: `${SITE_URL}/` },
    ...(input.published && { datePublished: input.published }),
    // Google's Rich Results Test rejects a bare date here; send a full timestamp.
    ...(input.updated && {
      dateModified: new Date(input.updated).toISOString(),
    }),
    publisher: { '@type': 'Organization', name: 'Shetu', url: `${SITE_URL}/` },
  };
}

/** JSON for a <script type="application/ld+json"> block; `<` escaped so data cannot close the tag. */
export function jsonLdScript(data: WithContext<Thing>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
