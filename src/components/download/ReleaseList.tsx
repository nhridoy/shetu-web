import { useEffect, useState } from 'react';
import fallbackData from '../../data/releases.json';
import { sessionCache } from '../../lib/browser';
import { getReleases, type ReleasesResult } from '../../lib/github';
import { formatReleaseDate, type Release } from '../../lib/releases';

const fallbackReleases = fallbackData.releases as Release[];

export interface ReleaseListProps {
  load?: () => Promise<ReleasesResult>;
}

export default function ReleaseList({ load }: ReleaseListProps) {
  const [releases, setReleases] = useState<Release[]>(fallbackReleases);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const result = load
          ? await load()
          : await getReleases({
              fallback: fallbackReleases,
              cache: sessionCache(),
            });
        if (!active) return;
        setReleases(result.releases);
        setSource(result.source);
      } catch {
        // Keep the committed snapshot.
      } finally {
        if (active) setChecked(true);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [load]);

  if (releases.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="text-sm text-muted">
          {checked
            ? 'Release history is unavailable right now.'
            : 'Release history is loaded from GitHub.'}
        </p>
        <a
          href="https://github.com/nhridoy/terra-client/releases"
          className="mt-3 inline-flex text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
        >
          View releases on GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checked && source === 'fallback' && (
        <p data-testid="release-fallback-notice" className="text-sm text-muted">
          Live release data is unavailable. Showing the last known release.
        </p>
      )}
      {releases.map((release) => (
        <article
          key={release.tag_name}
          className="rounded-xl border border-line bg-surface p-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-lg text-ink">{release.tag_name}</h2>
            {release.prerelease && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-800">
                Pre-release
              </span>
            )}
            <time
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
              dateTime={release.published_at}
            >
              {formatReleaseDate(release.published_at)}
            </time>
          </div>
          {release.name && release.name !== release.tag_name && (
            <p className="mt-2 text-sm text-muted">{release.name}</p>
          )}
          {release.body && (
            <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted">
              {release.body}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a
              href={release.html_url}
              className="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
            >
              Release notes
            </a>
            {release.assets.length > 0 && (
              <span className="text-muted">{release.assets.length} assets</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
