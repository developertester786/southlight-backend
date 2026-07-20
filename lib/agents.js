// Looks up an agent's real, trusted contact info from Webflow's CMS, server-side.
// The browser only ever sends the agent's slug (read from the page URL, e.g.
// "lance-willard" from /agents/lance-willard) — never the agent's actual email/phone —
// so a tampered form submission can't redirect notifications to the wrong person.
//
// Webflow's API doesn't support fetching an item directly by slug, only by internal
// item ID, so this fetches the collection's items and matches by slug. Fine at this
// collection size (~20 agents); switch to a cached lookup if the collection grows large.

export async function getAgent(agentSlug) {
  const res = await fetch(
    `https://api.webflow.com/v2/collections/${process.env.WEBFLOW_COLLECTION_ID}/items?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
        'accept-version': '2.0.0',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Webflow CMS list failed: ${res.status}`);
  }

  const data = await res.json();
  const match = (data.items || []).find((item) => item.fieldData?.slug === agentSlug);

  if (!match) {
    throw new Error(`No agent found for slug "${agentSlug}"`);
  }

  const fields = match.fieldData;

  return {
    id: match.id,
    slug: agentSlug,
    name: fields.name,
    email: fields['agent-email-address'],
    phone: fields['agent-phone-number'],
    realty: fields['realty'],
    county: fields['county'],
    imgUrl: fields['agent-img-url'],
    website: fields['agent-website']
  };
}