export type OS = 'macos' | 'windows' | 'linux' | 'unknown';
export type Arch = 'arm64' | 'x64' | 'unknown';

export interface PlatformInput {
  userAgentData?: { platform?: string } | null;
  userAgent?: string;
  platform?: string;
}

export interface DetectedPlatform {
  os: OS;
  arch: Arch;
}

export interface NavigatorLike {
  userAgent?: string;
  platform?: string;
  userAgentData?: {
    platform?: string;
    getHighEntropyValues?: (
      hints: string[],
    ) => Promise<{ architecture?: string; bitness?: string }>;
  };
}

export function detectOs(input: PlatformInput): OS {
  const ua = (input.userAgent ?? '').toLowerCase();
  if (/(iphone|ipad|ipod|android|mobile)/.test(ua)) return 'unknown';

  const uaPlatform = input.userAgentData?.platform?.toLowerCase() ?? '';
  if (uaPlatform) {
    if (uaPlatform.includes('mac')) return 'macos';
    if (uaPlatform.includes('win')) return 'windows';
    if (uaPlatform.includes('linux') || uaPlatform.includes('chrome os')) {
      return 'linux';
    }
  }

  const platform = (input.platform ?? '').toLowerCase();
  if (platform.includes('mac')) return 'macos';
  if (platform.includes('win')) return 'windows';
  if (platform.includes('linux') || platform.includes('x11')) return 'linux';

  if (ua.includes('mac os x') || ua.includes('macintosh')) return 'macos';
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('linux') || ua.includes('x11')) return 'linux';
  return 'unknown';
}

export function detectArch(
  input: PlatformInput,
  os: OS = detectOs(input),
): Arch {
  const ua = (input.userAgent ?? '').toLowerCase();
  if (/(aarch64|arm64|apple silicon)/.test(ua)) return 'arm64';
  if (/(x86_64|win64|x64|amd64)/.test(ua)) return 'x64';
  if (os === 'macos') return 'arm64';
  if (os === 'windows' || os === 'linux') return 'x64';
  return 'unknown';
}

export async function detectPlatform(
  nav: NavigatorLike,
): Promise<DetectedPlatform> {
  const os = detectOs(nav);
  let arch = detectArch(nav, os);

  try {
    const high = await nav.userAgentData?.getHighEntropyValues?.([
      'architecture',
      'bitness',
    ]);
    if (high?.architecture === 'arm') arch = 'arm64';
    else if (high?.architecture === 'x86' && high.bitness === '64')
      arch = 'x64';
  } catch {
    // Detection is best-effort. Keep the user-agent result.
  }

  return { os, arch };
}
