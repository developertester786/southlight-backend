import { sendSms } from './twilioClient.js';
import { sendEmail } from './gmail.js';
import { renderTemplate, renderEmailTemplate } from './templates.js';

// Fires all 6 notifications in parallel:
// client email, client SMS, agent email, agent SMS, admin email, admin SMS.
// Called once, after OTP verification succeeds.
export async function sendAllNotifications({ client, agent }) {

  console.log(client.lookingToDo);
  // Convert Buyer/Seller/Investor into a readable sentence
  let requestDescription;

  switch (client.lookingToDo) {
    case 'Buyer':
    case 'Buy':
      requestDescription = 'the purchase of your home';
      break;

    case 'Seller':
    case 'Sell':
      requestDescription = 'the sale of your home';
      break;

    case 'Investor':
    case 'Investment':
    case 'Invest':
      requestDescription = 'your investment property search';
      break;

    default:
      requestDescription = client.lookingToDo;
  }

  const ctx = {
    // Client
    clientName: client.name,
    clientFirstName: client.name.split(' ')[0],
    clientEmail: client.email,
    clientPhone: client.phone,

    // Request
    lookingToDo: client.lookingToDo,
    requestType: client.lookingToDo,
    requestDescription,

    // Agent
    agentName: agent.name,
    agentFirstName: agent.name.split(' ')[0],
    agentEmail: agent.email,
    agentPhone: agent.phone,

    // These will work after you return them from agents.js
    agentRealty: agent.realty,
    agentWebsite: agent.website,
    agentImgUrl: agent.imgUrl,
    county: agent.county,
  };

  const clientEmailTpl = renderEmailTemplate('client-email.html', ctx);
  const agentEmailTpl = renderEmailTemplate('agent-email.html', ctx);
  const adminEmailTpl = renderEmailTemplate('admin-email.html', ctx);

  const results = await Promise.allSettled([
    sendEmail({ to: client.email, subject: clientEmailTpl.subject, html: clientEmailTpl.html }),
    sendSms(client.phone, renderTemplate('client-sms.txt', ctx)),
    sendEmail({ to: agent.email, subject: agentEmailTpl.subject, html: agentEmailTpl.html }),
    sendSms(agent.phone, renderTemplate('agent-sms.txt', ctx)),
    sendEmail({ to: process.env.ADMIN_EMAIL, subject: adminEmailTpl.subject, html: adminEmailTpl.html }),
    sendSms(process.env.ADMIN_PHONE, renderTemplate('admin-sms.txt', ctx)),
  ]);

  const failed = results
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.status === 'rejected');

  if (failed.length > 0) {
    const labels = ['client email', 'client SMS', 'agent email', 'agent SMS', 'admin email', 'admin SMS'];
    const details = failed.map(({ r, i }) => `${labels[i]}: ${r.reason}`).join('; ');
    // Logged rather than thrown, so a single failed notification (e.g. Twilio hiccup)
    // doesn't block the success response for the other 5. Adjust this policy if the
    // client wants an all-or-nothing guarantee instead.
    console.error('Some notifications failed:', details);
  }

  return { sent: 6 - failed.length, failed: failed.length };
}
