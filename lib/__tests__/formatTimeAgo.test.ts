// lib/__tests__/formatTimeAgo.test.ts
import { formatTimeAgo } from '../formatTimeAgo';

describe('formatTimeAgo', () => {
  const now = new Date('2026-05-16T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => jest.useRealTimers());

  it('returns "just now" for less than 1 minute', () => {
    const date = new Date('2026-05-16T11:59:30Z').toISOString();
    expect(formatTimeAgo(date)).toBe('just now');
  });

  it('returns minutes for less than 1 hour', () => {
    const date = new Date('2026-05-16T11:45:00Z').toISOString();
    expect(formatTimeAgo(date)).toBe('15m ago');
  });

  it('returns hours for less than 1 day', () => {
    const date = new Date('2026-05-16T09:00:00Z').toISOString();
    expect(formatTimeAgo(date)).toBe('3h ago');
  });

  it('returns days for 1 day or more', () => {
    const date = new Date('2026-05-14T12:00:00Z').toISOString();
    expect(formatTimeAgo(date)).toBe('2d ago');
  });
});
