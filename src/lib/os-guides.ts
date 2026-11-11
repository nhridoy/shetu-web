import { INSTALL_COMMANDS } from './site';

export type GuideOs = 'windows' | 'macos' | 'linux';

export interface OsGuide {
  label: string;
  archs: string;
  command: string;
  shell: string;
  formats: string[];
  installNote: string;
  firstLaunch: string[];
  updates: string;
  uninstall: string;
  dataDir: string;
}

// Facts from src/content/docs/desktop.mdx and terra-client's install.sh / install.ps1.
export const OS_GUIDES: Record<GuideOs, OsGuide> = {
  windows: {
    label: 'Windows',
    archs: 'x64 and ARM64',
    command: INSTALL_COMMANDS.windows,
    shell: 'PowerShell',
    formats: [
      'NSIS installer (.exe) for x64',
      'NSIS installer (.exe) for ARM64',
    ],
    installNote:
      'The script downloads the installer that matches your PC and runs it, so you skip the browser download warning.',
    firstLaunch: [
      'Terra is not signed by Microsoft yet, so SmartScreen may say "Windows protected your PC".',
      'Click More info, then Run anyway. You only do this once.',
      'If your browser says the file is not commonly downloaded, choose Keep.',
    ],
    updates:
      'Terra updates itself from GitHub Releases. In-app updates install without the SmartScreen warning.',
    uninstall: 'Uninstall Terra from Settings, then Apps.',
    dataDir: '%APPDATA%\\com.nhridoy.terra',
  },
  macos: {
    label: 'macOS',
    archs: 'Apple Silicon and Intel',
    command: INSTALL_COMMANDS.unix,
    shell: 'Terminal',
    formats: ['DMG for Apple Silicon (M1 and newer)', 'DMG for Intel'],
    installNote:
      'The script picks the right build for your Mac, installs Terra to /Applications and skips the first-launch warning.',
    firstLaunch: [
      'Terra is not notarized by Apple yet, so macOS may say it cannot verify the app.',
      'Drag Terra to Applications and open it once.',
      'Go to System Settings, then Privacy & Security, and click Open Anyway. You only do this once.',
    ],
    updates:
      'Terra updates itself from GitHub Releases. In-app updates install without the Gatekeeper warning.',
    uninstall: 'Quit Terra and move it from Applications to the Trash.',
    dataDir: '~/Library/Application Support/com.nhridoy.terra',
  },
  linux: {
    label: 'Linux',
    archs: 'x64 and ARM64',
    command: INSTALL_COMMANDS.unix,
    shell: 'Terminal',
    formats: [
      'AppImage for x64 and ARM64 (needs libfuse2)',
      '.deb for Debian and Ubuntu, x64 and ARM64',
    ],
    installNote:
      'On Debian and Ubuntu the script installs the .deb through apt. Elsewhere it puts the AppImage at ~/.local/bin/terra.',
    firstLaunch: [
      'The AppImage needs libfuse2. Most distributions ship it; otherwise install it with your package manager.',
      'If you downloaded the AppImage yourself, make it executable with chmod +x before running it.',
    ],
    updates:
      'The AppImage updates itself from GitHub Releases. With the .deb, Terra opens the release page so you can install the new package.',
    uninstall:
      'Delete the AppImage, or remove the .deb with your package manager.',
    dataDir: '~/.local/share/com.nhridoy.terra',
  },
};
