import { useEffect, useState } from 'react';
import fallbackData from '../../data/releases.json';
import { sessionCache } from '../../lib/browser';
import { getLatestRelease, type ReleaseResult } from '../../lib/github';
import type { Release } from '../../lib/releases';

const fallbackRelease = fallbackData.latest as Release;

export interface ReleaseTagProps {
  load?: () => Promise<ReleaseResult>;
}

/** Latest version tag; matches the release the download button links to. */
export default function ReleaseTag({ load }: ReleaseTagProps) {
  const [tag, setTag] = useState(fallbackRelease.tag_name);

  useEffect(() => {
    let active = true;
    (load
      ? load()
      : getLatestRelease({ fallback: fallbackRelease, cache: sessionCache() })
    )
      .then((result) => {
        if (active) setTag(result.release.tag_name);
      })
      .catch(() => {
        // Keep the committed snapshot.
      });
    return () => {
      active = false;
    };
  }, [load]);

  return <>{tag}</>;
}
