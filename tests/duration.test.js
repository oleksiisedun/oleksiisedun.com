import { afterEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { formatElapsedDuration } from '../src/js/handlers.js';

/**
 * Freezes `Date` at a local calendar date for the duration of a test.
 * @param {number} year
 * @param {number} month - 1-based month.
 * @param {number} day
 * @returns {void}
 */
const freezeToday = (year, month, day) => {
  mock.timers.enable({ apis: ['Date'], now: new Date(year, month - 1, day) });
};

/**
 * Strips the value-highlighting spans so assertions read as plain text.
 * @param {string} html
 * @returns {string}
 */
const plain = (html) => html.replace(/<[^>]+>/g, '');

describe('formatElapsedDuration', () => {
  afterEach(() => mock.timers.reset());

  it('shows years, months and days', () => {
    freezeToday(2026, 9, 20);
    assert.equal(plain(formatElapsedDuration(new Date(2011, 11, 12))), '14 years 9 months 8 days');
  });

  it('uses singular units for 1', () => {
    freezeToday(2026, 2, 26);
    assert.equal(plain(formatElapsedDuration(new Date(2025, 0, 25))), '1 year 1 month 1 day');
  });

  it('omits zero years and months', () => {
    freezeToday(2026, 3, 1);
    assert.equal(plain(formatElapsedDuration(new Date(2026, 1, 25))), '4 days');
  });

  it('borrows days from the previous month when the day-of-month is earlier', () => {
    freezeToday(2026, 3, 10);
    // 25 Feb -> 10 Mar 2026: 13 days (Feb has 28 days in 2026)
    assert.equal(plain(formatElapsedDuration(new Date(2026, 1, 25))), '13 days');
  });

  it('uses the leap-year length of February when borrowing', () => {
    freezeToday(2028, 3, 10);
    // 25 Feb -> 10 Mar 2028: 14 days (Feb has 29 days in 2028)
    assert.equal(plain(formatElapsedDuration(new Date(2028, 1, 25))), '14 days');
  });

  it('borrows a month across a year boundary', () => {
    freezeToday(2026, 1, 5);
    assert.equal(plain(formatElapsedDuration(new Date(2025, 10, 20))), '1 month 16 days');
  });

  describe('month-end start dates', () => {
    const cases = [
      { today: [2026, 2, 27], start: [2026, 1, 31], expected: '27 days' },
      { today: [2026, 2, 28], start: [2026, 1, 31], expected: '1 month' }, // clamped to 28 Feb
      { today: [2026, 3, 1], start: [2026, 1, 31], expected: '1 month 1 day' },
      { today: [2026, 3, 1], start: [2026, 1, 30], expected: '1 month 1 day' },
      { today: [2026, 3, 31], start: [2026, 1, 31], expected: '2 months' },
      { today: [2028, 2, 29], start: [2028, 1, 31], expected: '1 month' }, // clamped to 29 Feb (leap year)
      { today: [2028, 2, 28], start: [2028, 1, 31], expected: '28 days' },
      { today: [2027, 2, 28], start: [2026, 2, 28], expected: '1 year' },
      { today: [2027, 2, 27], start: [2024, 2, 29], expected: '2 years 11 months 29 days' },
      { today: [2027, 2, 28], start: [2024, 2, 29], expected: '3 years' }, // 29 Feb clamped to 28 Feb
    ];
    for (const { today, start, expected } of cases) {
      it(`${start.join('-')} -> ${today.join('-')}: ${expected}`, () => {
        freezeToday(...today);
        assert.equal(plain(formatElapsedDuration(new Date(start[0], start[1] - 1, start[2]))), expected);
      });
    }
  });

  it('never reports a negative day count for any start day', () => {
    freezeToday(2026, 3, 1);
    for (let day = 1; day <= 31; day++) {
      const out = plain(formatElapsedDuration(new Date(2026, 0, day)));
      assert.doesNotMatch(out, /-\d/, `start day ${day}: ${out}`);
    }
  });

  it('shows "0 days" when the start date is today', () => {
    freezeToday(2026, 9, 20);
    assert.equal(plain(formatElapsedDuration(new Date(2026, 8, 20))), '0 days');
  });

  it('wraps each number in the value span', () => {
    freezeToday(2026, 9, 20);
    assert.match(formatElapsedDuration(new Date(2025, 8, 20)), /<span class="value-text">1<\/span> year/);
  });
});
