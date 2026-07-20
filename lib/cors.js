// Allows the API to be called from a different origin than where it's hosted —
// needed when testing via webflow/local-test-page.html (opened as a local file,
// origin "null") or from the real Webflow domain once deployed.
//
// For production, consider restricting this to the client's actual Webflow domain
// instead of '*' once the real site URL is known.
export function applyCors(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return true; // caller should return immediately
    }
    return false;
}