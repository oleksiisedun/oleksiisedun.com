const ALLOWED_ORIGINS = ['https://oleksiisedun.com', 'https://www.oleksiisedun.com'];

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
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    const cacheUrl = new URL(request.url);
    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (!response) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateString = thirtyDaysAgo.toISOString().split('T')[0];

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
                orderBy: [count_DESC]
              ) {
                count
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
            views: c.count,
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
