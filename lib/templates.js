import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');

// Loads a template file and swaps {{placeholder}} tokens for real values.
// ctx example: { clientName, clientEmail, clientPhone, agentName, agentEmail, agentPhone, lookingToDo }
export function renderTemplate(fileName, ctx) {
  let text = fs.readFileSync(path.join(TEMPLATES_DIR, fileName), 'utf8');
  for (const [key, value] of Object.entries(ctx)) {
    text = text.replaceAll(`{{${key}}}`, value ?? '');
  }
  return text;
}

// Pulls the <title>/first line as the email subject, rest as body.
// Simple convention: first line of the .html template is "Subject: ..." then a blank line, then the HTML body.
export function renderEmailTemplate(fileName, ctx) {
  const full = renderTemplate(fileName, ctx);
  const [firstLine, ...rest] = full.split('\n');
  const subject = firstLine.replace(/^Subject:\s*/i, '').trim();
  const html = rest.join('\n').trim();
  return { subject, html };
}
