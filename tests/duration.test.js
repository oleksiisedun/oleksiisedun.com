import { afterEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { formatElapsedDuration } from '../js/handlers.js';

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

  it('shows "0 days" when the start date is today', () => {
    freezeToday(2026, 9, 20);
    assert.equal(plain(formatElapsedDuration(new Date(2026, 8, 20))), '0 days');
  });

  it('wraps each number in the value span', () => {
    freezeToday(2026, 9, 20);
    assert.match(formatElapsedDuration(new Date(2025, 8, 20)), /<span class="value-text">1<\/span> year/);
  });
});
