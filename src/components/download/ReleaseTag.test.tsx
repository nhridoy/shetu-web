import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Release } from '../../lib/releases';
import ReleaseTag from './ReleaseTag';

const live = { tag_name: 'v9.9.9' } as Release;

describe('ReleaseTag', () => {
  it('shows the committed snapshot before live data arrives', () => {
    render(<ReleaseTag load={() => new Promise(() => {})} />);
    expect(screen.getByText('v0.0.15')).toBeInTheDocument();
  });

  it('switches to the live release the download button uses', async () => {
    render(
      <ReleaseTag load={async () => ({ release: live, source: 'live' })} />,
    );
    expect(await screen.findByText('v9.9.9')).toBeInTheDocument();
  });
});
