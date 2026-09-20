import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/worker.js';

const ENV = { ACCOUNT_ID: 'acct', SITE_TAG: 'site', CF_API_TOKEN: 'token' };
const ORIGIN = 'https://oleksiisedun.com';

/**
 * Builds a GET request to the worker from a given Origin.
 * @param {string} [origin]
 * @returns {Request}
 */
const makeRequest = (origin = ORIGIN) => new Request('https://analytics.example/', { headers: { Origin: origin } });

/**
 * Builds a Cloudflare GraphQL response body with the given analytics and country rows.
 * @param {object} [overrides]
 * @returns {object}
 */
const cfResult = (overrides = {}) => ({
  data: {
    viewer: {
      accounts: [
        {
          analytics: [{ count: 50, sum: { visits: 20 } }],
          topCountries: [
            { dimensions: { countryName: 'Ukraine' }, sum: { visits: 9 } },
            { dimensions: { countryName: '' }, sum: { visits: 3 } },
          ],
          ...overrides,
        },
      ],
    },
  },
});

/**
 * Stubs the global `fetch` used for the upstream Cloudflare call.
 * @param {object} body - JSON body the fake upstream returns.
 * @returns {import('node:test').Mock<typeof fetch>}
 */
const stubUpstream = (body) => {
  const stub = mock.fn(async () => new Response(JSON.stringify(body)));
  globalThis.fetch = /** @type {typeof fetch} */ (stub);
  return stub;
};

describe('analytics worker', () => {
  let cache;
  let ctx;
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    cache = { match: mock.fn(async () => undefined), put: mock.fn(async () => {}) };
    globalThis.caches = /** @type {any} */ ({ default: cache });
    ctx = { waitUntil: mock.fn() };
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    delete globalThis.caches;
  });

  it('answers CORS preflight without touching the upstream API', async () => {
    const upstream = stubUpstream(cfResult());
    const res = await worker.fetch(
      new Request('https://analytics.example/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }),
      ENV,
      ctx,
    );
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
    assert.equal(res.headers.get('Access-Control-Allow-Methods'), 'GET, OPTIONS');
    assert.equal(upstream.mock.callCount(), 0);
  });

  it('echoes allowed origins and falls back to the primary origin otherwise', async () => {
    stubUpstream(cfResult());
    const www = await worker.fetch(makeRequest('https://www.oleksiisedun.com'), ENV, ctx);
    assert.equal(www.headers.get('Access-Control-Allow-Origin'), 'https://www.oleksiisedun.com');

    const evil = await worker.fetch(makeRequest('https://evil.example'), ENV, ctx);
    assert.equal(evil.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  });

  it('maps the GraphQL result to stats, defaults unknown countries and caches the response', async () => {
    const upstream = stubUpstream(cfResult());
    const res = await worker.fetch(makeRequest(), ENV, ctx);

    assert.deepEqual(await res.json(), {
      totalViews: 50,
      totalVisits: 20,
      topCountries: [
        { country: 'Ukraine', views: 9 },
        { country: 'Unknown', views: 3 },
      ],
    });
    assert.equal(res.headers.get('Cache-Control'), 'public, max-age=300');
    assert.equal(cache.put.mock.callCount(), 1);
    assert.equal(ctx.waitUntil.mock.callCount(), 1);

    const [url, init] = upstream.mock.calls[0].arguments;
    assert.equal(url, 'https://api.cloudflare.com/client/v4/graphql');
    assert.equal(init.headers.Authorization, 'Bearer token');
    assert.match(JSON.parse(init.body).query, /accountTag: "acct"/);
  });

  it('returns zeros when the account has no analytics rows', async () => {
    stubUpstream(cfResult({ analytics: [], topCountries: [] }));
    const res = await worker.fetch(makeRequest(), ENV, ctx);
    assert.deepEqual(await res.json(), { totalViews: 0, totalVisits: 0, topCountries: [] });
  });

  it('serves a cached response without calling the upstream API', async () => {
    const upstream = stubUpstream(cfResult());
    const cached = new Response('cached');
    cache.match = mock.fn(async () => cached);

    const res = await worker.fetch(makeRequest(), ENV, ctx);
    assert.equal(res, cached);
    assert.equal(upstream.mock.callCount(), 0);
  });

  it('returns a 500 with the error message when Cloudflare reports errors', async () => {
    stubUpstream({ errors: [{ message: 'bad token' }] });
    const res = await worker.fetch(makeRequest(), ENV, ctx);
    assert.equal(res.status, 500);
    assert.match((await res.json()).error, /CF API ERROR/);
    assert.equal(cache.put.mock.callCount(), 0);
  });

  it('returns a 500 when the response has no account data', async () => {
    stubUpstream({ data: { viewer: { accounts: [] } } });
    const res = await worker.fetch(makeRequest(), ENV, ctx);
    assert.equal(res.status, 500);
    assert.match((await res.json()).error, /NO ACCOUNT DATA/);
  });
});
