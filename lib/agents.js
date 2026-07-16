// Looks up an agent's real, trusted contact info from Webflow's CMS, server-side.
// The browser only ever sends an agent ID/slug — never the agent's actual email/phone —
// so a tampered form submission can't redirect notifications to the wrong person.
//
// NOTE: field names below (email, phone, name) must match the actual field slugs
// in the client's Webflow "Agents" CMS collection. Confirm exact slugs before using.

export async function getAgent(agentId) {
  const res = await fetch(
    `https://api.webflow.com/v2/collections/${process.env.WEBFLOW_COLLECTION_ID}/items/${agentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
        'accept-version': '2.0.0',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Webflow CMS lookup failed for agent ${agentId}: ${res.status}`);
  }

  const item = await res.json();
  const fields = item.fieldData || {};

  return {
    id: agentId,
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
  };
}
