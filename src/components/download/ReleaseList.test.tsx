import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Release } from '../../lib/releases';
import ReleaseList from './ReleaseList';

const release: Release = {
  tag_name: 'v1.0.0',
  name: 'Terra 1.0.0',
  published_at: '2026-02-01T00:00:00Z',
  html_url: 'https://github.com/nhridoy/terra-client/releases/tag/v1.0.0',
  prerelease: true,
  body: 'A big release.',
  assets: [],
};

describe('ReleaseList', () => {
  it('renders live releases with tag, date, and prerelease label', async () => {
    render(
      <ReleaseList
        load={async () => ({ releases: [release], source: 'live' })}
      />,
    );
    expect(await screen.findByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Pre-release')).toBeInTheDocument();
    expect(screen.getByText('Feb 1, 2026')).toBeInTheDocument();
    expect(screen.getByText('A big release.')).toBeInTheDocument();
  });

  it('shows a GitHub fallback when no releases are available', async () => {
    render(
      <ReleaseList load={async () => ({ releases: [], source: 'fallback' })} />,
    );
    expect(
      await screen.findByText('Release history is unavailable right now.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View releases on GitHub' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/nhridoy/terra-client/releases',
    );
  });
});
