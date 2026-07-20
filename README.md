# Intro Request Backend

Backend for the Southlight Introduction Request workflow.

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

To run locally:

```bash
vercel dev
```


## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables.
4. Deploy the project.

---

## Gmail OAuth Setup

1. Configure the Gmail API in Google Cloud.
2. Add the production OAuth Redirect URI.
3. Visit:

```
https://your-domain.vercel.app/api/oauth-authorize
```

4. Complete the authorization.
5. Copy the generated Refresh Token into:

```
GMAIL_REFRESH_TOKEN
```

6. Redeploy the project.

---

## Webflow Integration

1. Open:

```
webflow/custom-code.html
```

2. Replace:

```javascript
const API_BASE = 'http://localhost:3000/api';
```

with your production URL.

3. Copy the contents of `custom-code.html` into Webflow before the closing `</body>` tag.

4. Publish the site.

---

## Email & SMS Templates

Notification templates are located in the `templates` folder.

The templates support dynamic placeholders and can be edited without modifying the backend notification logic.

---

## Notes

- Do not commit the `.env` file.
- Update `API_BASE` before publishing.
- Agent information is loaded dynamically from the Webflow CMS.