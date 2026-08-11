// Vercel Serverless Function — proxies the Facebook Graph API so the Page
// access token never reaches the browser. Vercel automatically deploys any
// file in /api as a serverless function, reachable at /api/facebook-posts.
//
// Required environment variables (set in the Vercel dashboard, NOT committed):
//   FB_PAGE_ID       numeric ID of the Páteo Facebook Page
//   FB_ACCESS_TOKEN  long-lived Page access token
//
// Optional:
//   FB_GRAPH_VERSION Graph API version (defaults below); bump when Meta deprecates one.

const DEFAULT_GRAPH_VERSION = 'v21.0';

export default async function handler(req, res) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_ACCESS_TOKEN;
  const version = process.env.FB_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;

  if (!pageId || !token) {
    res.status(500).json({ error: 'Server is missing FB_PAGE_ID or FB_ACCESS_TOKEN.' });
    return;
  }

  const fields = [
    'message',
    'created_time',
    'permalink_url',
    'full_picture',
  ].join(',');

  const url =
    `https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}/posts` +
    `?fields=${encodeURIComponent(fields)}&limit=6&access_token=${encodeURIComponent(token)}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const fbRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    const data = await fbRes.json();

    if (!fbRes.ok || data.error) {
      const message = data?.error?.message || `Graph API returned HTTP ${fbRes.status}`;
      // 502: upstream (Facebook) problem, not a bug in our function.
      res.status(502).json({ error: message });
      return;
    }

    // Keep only posts that have something to show, and expose a minimal shape.
    const posts = (data.data || [])
      .filter((p) => p.message || p.full_picture)
      .map((p) => ({
        id: p.id,
        message: p.message || '',
        createdTime: p.created_time || null,
        permalink: p.permalink_url || `https://www.facebook.com/${pageId}`,
        image: p.full_picture || null,
      }));

    // Cache at Vercel's edge for 15 min; keep serving the last good copy for up
    // to an hour while it refreshes in the background. Protects Graph rate limits
    // and makes the endpoint fast even under traffic.
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    res.status(200).json({ posts });
  } catch (err) {
    const message = err?.name === 'AbortError' ? 'Facebook request timed out.' : (err?.message || 'Unknown error');
    res.status(502).json({ error: message });
  }
}
