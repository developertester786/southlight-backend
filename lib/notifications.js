import { sendSms } from './twilioClient.js';
import { sendEmail } from './gmail.js';
import { renderTemplate, renderEmailTemplate } from './templates.js';

// Fires all 6 notifications in parallel:
// client email, client SMS, agent email, agent SMS, admin email, admin SMS.
// Called once, after OTP verification succeeds.
export async function sendAllNotifications({ client, agent }) {
  const ctx = {
    clientName: client.name,
    clientFirstName: client.name.split(' ')[0],
    clientEmail: client.email,
    clientPhone: client.phone,

    lookingToDo: client.lookingToDo,
    requestType: client.lookingToDo,

    requestDescription:
      client.lookingToDo === 'Seller'
        ? 'the sale of your home'
        : client.lookingToDo === 'Buyer'
          ? 'the purchase of a home'
          : client.lookingToDo,

    county: agent.county,

    agentName: agent.name,
    agentFirstName: agent.name.split(' ')[0],

    agentRealty: agent.realty,
    agentWebsite: agent.website,
    agentImgUrl: agent.image,

    agentEmail: agent.email,
    agentPhone: agent.phone,
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
