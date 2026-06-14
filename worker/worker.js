const ALLOWED_ORIGINS = ['https://oleksiisedun.com', 'https://www.oleksiisedun.com'];

// Number of trailing days of analytics data to query.
const ANALYTICS_WINDOW_DAYS = 30;

/**
 * Builds CORS headers for a response, echoing back the request's origin if allowed.
 * @param {Request} request - The incoming request.
 * @returns {Record<string, string>} CORS headers to attach to the response.
 */
function getCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  /**
   * Proxies Cloudflare's GraphQL Analytics API, returning cached page-view/visitor
   * stats for the site. Handles CORS preflight and caches successful responses.
   * @param {Request} request - The incoming request.
   * @param {{ ACCOUNT_ID: string, SITE_TAG: string, CF_API_TOKEN: string }} env - Worker environment bindings.
   * @param {ExecutionContext} ctx - The worker execution context.
   * @returns {Promise<Response>} The analytics stats (or error) response.
   */
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    const cacheUrl = new URL(request.url);
    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (!response) {
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - ANALYTICS_WINDOW_DAYS);
      const dateString = windowStart.toISOString().split('T')[0];

      const query = `
        query {
          viewer {
            accounts(filter: { accountTag: "${env.ACCOUNT_ID}" }) {
              analytics: rumPageloadEventsAdaptiveGroups(
                limit: 1
                filter: { siteTag: "${env.SITE_TAG}", datetime_geq: "${dateString}T00:00:00Z" }
              ) {
                count
                sum { visits }
              }

              topCountries: rumPageloadEventsAdaptiveGroups(
                limit: 5
                filter: { siteTag: "${env.SITE_TAG}", datetime_geq: "${dateString}T00:00:00Z" }
                orderBy: [sum_visits_DESC]
              ) {
                sum { visits }
                dimensions { countryName }
              }
            }
          }
        }
      `;

      try {
        const cfResponse = await fetch('https://api.cloudflare.com/client/v4/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        const result = await cfResponse.json();

        if (result.errors) {
          throw new Error(`CF API ERROR: ${JSON.stringify(result.errors)}`);
        }

        const accountData = result?.data?.viewer?.accounts[0];

        if (!accountData) {
          throw new Error(`NO ACCOUNT DATA. CF RETURNED: ${JSON.stringify(result)}`);
        }

        const analytics = accountData.analytics[0];
        const stats = {
          totalViews: analytics?.count || 0,
          totalVisits: analytics?.sum?.visits || 0,
          topCountries: accountData.topCountries.map(c => ({
            country: c.dimensions.countryName || 'Unknown',
            views: c.sum?.visits || 0,
          })),
        };

        response = new Response(JSON.stringify(stats), {
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request),
            'Cache-Control': 'public, max-age=300',
          },
        });

        ctx.waitUntil(cache.put(cacheKey, response.clone()));

      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request),
          },
        });
      }
    }

    return response;
  },
};
