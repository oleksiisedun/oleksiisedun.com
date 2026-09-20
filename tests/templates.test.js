import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  errorSpan,
  generateAnalyticsTemplate,
  generateTrackersTemplate,
  generateUnknownCommandTemplate,
  sectionHeader,
  valueSpan,
} from '../js/templates.js';

/**
 * Strips HTML tags so assertions read as the text the user sees.
 * @param {string} html
 * @returns {string}
 */
const plain = (html) => html.replace(/<[^>]+>/g, '');

describe('span helpers', () => {
  it('wrap content in their themed classes', () => {
    assert.equal(valueSpan(5), '<span class="value-text">5</span>');
    assert.equal(errorSpan('boom'), '<span class="error-text">boom</span>');
    assert.equal(sectionHeader('Trackers'), '<span class="section-header">[Trackers]</span>');
  });
});

describe('generateAnalyticsTemplate', () => {
  it('renders totals and aligned country rows', () => {
    const out = plain(
      generateAnalyticsTemplate({
        totalVisits: 12,
        totalViews: 34,
        topCountries: [
          { country: 'Ukraine', views: 100 },
          { country: 'Poland', views: 7 },
        ],
      }),
    );
    assert.match(out, /Unique Visitors : 12/);
    assert.match(out, /Page Views {6}: 34/);
    assert.match(out, /Ukraine \| 100/);
    assert.match(out, /Poland {2}\| 7/); // padded to the longest country name
  });

  it('defaults missing totals to 0 and omits the country table', () => {
    const out = plain(generateAnalyticsTemplate({}));
    assert.match(out, /Unique Visitors : 0/);
    assert.match(out, /Page Views {6}: 0/);
    assert.doesNotMatch(out, /Top Countries/);
  });

  it('omits the country table for an empty list', () => {
    assert.doesNotMatch(plain(generateAnalyticsTemplate({ topCountries: [] })), /Top Countries/);
  });
});

describe('generateTrackersTemplate', () => {
  it('renders one icon-labeled block per tracker', () => {
    const out = generateTrackersTemplate([
      { icon: 'fa-a', label: 'First', sentence: 'one' },
      { icon: 'fa-b', label: 'Second', sentence: 'two' },
    ]);
    assert.match(out, /<i class="fas fa-a"><\/i> First\n {2}one/);
    assert.match(out, /<i class="fas fa-b"><\/i> Second\n {2}two/);
  });
});

describe('generateUnknownCommandTemplate', () => {
  const commands = { help: {}, skills: {}, analytics: {}, trackers: {}, clear: {} };

  it('names the unknown command and lists every available one', () => {
    const out = plain(generateUnknownCommandTemplate('foo', commands));
    assert.match(out, /Command not found: foo/);
    for (const name of Object.keys(commands)) assert.ok(out.includes(name), `missing ${name}`);
    assert.match(out, /Type 'help' for more information\./);
  });

  it('lays commands out three per row', () => {
    const rows = plain(generateUnknownCommandTemplate('foo', commands))
      .split('\n')
      .filter((line) => line.startsWith('  '));
    assert.equal(rows.length, 2);
    assert.equal(rows[0].trim().split(/\s+/).length, 3);
    assert.equal(rows[1].trim().split(/\s+/).length, 2);
  });
});
