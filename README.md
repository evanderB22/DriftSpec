# DriftSpec — Deployment Guide

## What's in this folder
This is a complete, ready-to-deploy web app:
- `src/App.jsx` — the whole app UI (home, form, loading, paywall, results)
- `netlify/functions/generate-plan.js` — a serverless function that safely
  talks to Claude on your behalf. Your API key lives here, NEVER in the
  browser code.
- `netlify.toml` — tells Netlify how to build and route the site.

## How to deploy on Netlify

### 1. Get an Anthropic API key
- Go to https://console.anthropic.com
- Sign up / log in, go to "API Keys", create a new key
- Copy it — you'll need it in step 4
- Note: this requires adding billing to your Anthropic console account.
  Each generated plan costs a fraction of a cent, but you need a payment
  method on file to get a key.

### 2. Push this folder to GitHub
- Create a new repo on https://github.com (can be private)
- Upload all files in this folder to that repo
  (easiest: use GitHub's "uploading an existing file" drag-and-drop in
  the browser, or use GitHub Desktop if you want a GUI)

### 3. Connect the repo to Netlify
- Go to https://app.netlify.com
- Click "Add new site" → "Import an existing project"
- Choose GitHub, select your DriftSpec repo
- Build command: `npm run build`
- Publish directory: `dist`
- Click Deploy

### 4. Add your API key as an environment variable
- In Netlify: Site settings → Environment variables → Add a variable
- Key: `ANTHROPIC_API_KEY`
- Value: (paste the key from step 1)
- Redeploy the site after adding this (Deploys tab → Trigger deploy)

### 5. Connect your domain (driftspec.co)
- In Netlify: Site settings → Domain management → Add a custom domain
- Enter driftspec.co
- Netlify will give you DNS records (usually a couple of A/CNAME records)
- Go to GoDaddy → your domain → DNS settings → add those records
- Takes 10 minutes to a few hours to fully propagate

## Testing locally before deploying (optional)
If you want to test on your own computer first, you'll need Node.js
installed (https://nodejs.org), then:
```
npm install
npm run dev
```
Note: the AI feature won't work locally unless you also run Netlify's
local dev tool (`netlify dev`) with your API key set in a `.env` file —
the README above's live deployment path is the simplest way to get a
fully working version in front of real users.
