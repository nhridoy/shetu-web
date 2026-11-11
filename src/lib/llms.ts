import { absoluteUrl, PAGES } from './seo';
import { REPOS } from './site';

export interface LlmsLink {
  path: string;
  title: string;
  description: string;
}

const line = (link: LlmsLink) =>
  `- [${link.title}](${absoluteUrl(link.path)}): ${link.description}`;

/** /llms.txt in the llmstxt.org format: name, summary, then sections of links. */
export function buildLlmsTxt(input: {
  pages: LlmsLink[];
  docs: LlmsLink[];
}): string {
  return [
    '# Terra',
    '',
    `> ${PAGES['/'].description}`,
    '',
    'Terra is an MIT-licensed desktop SSH client (Tauri, Rust, React) for macOS, Windows and Linux on x64 and ARM64, that signs in and syncs through a Go server you can run yourself. SSH connects directly from the device; the vault is encrypted on the device with Argon2id and XChaCha20-Poly1305 before sync. Release builds are not notarized by Apple or signed by Microsoft yet. There are no mobile apps, and no Mosh, Telnet or Termius import yet.',
    '',
    '## Pages',
    '',
    ...input.pages.map(line),
    '',
    '## Docs',
    '',
    ...input.docs.map(line),
    '',
    '## Source',
    '',
    `- [terra](${REPOS.monorepo}): Project home, docs and issues`,
    `- [terra-client](${REPOS.client}): Desktop app source`,
    `- [terra-server](${REPOS.server}): Sync server source`,
    `- [terra-web](${REPOS.web}): This website`,
    '',
  ].join('\n');
}
