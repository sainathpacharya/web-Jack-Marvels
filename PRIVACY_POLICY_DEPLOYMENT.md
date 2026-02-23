# Privacy Policy Page – Deployment Notes

## URL

When deployed, the Privacy Policy is available at:

- **Path:** `/privacy-policy`
- **Example full URL (custom domain):** `https://yourdomain.com/privacy-policy`
- **Example full URL (GitHub Pages):** `https://<username>.github.io/<repo-name>/privacy-policy`

Use this URL in your **Alpha Vlogs** Google Play listing (Privacy Policy field).

---

## GitHub Pages (configured)

The project is set up to deploy to **GitHub Pages** via GitHub Actions.

### One-time setup

1. Push the repo to GitHub (if not already).
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to the `main` branch (or run the workflow manually: **Actions → Deploy to GitHub Pages → Run workflow**).

### After deployment

- Site URL: `https://<username>.github.io/<repo-name>/`
- Privacy Policy: `https://<username>.github.io/<repo-name>/privacy-policy`

If your default branch is `master` instead of `main`, edit `.github/workflows/deploy-pages.yml` and change `branches: [main]` to `branches: [master]`.

### Troubleshooting: "404 – There isn't a GitHub Pages site here"

This means no site has been published yet. Do this:

1. **Enable GitHub Actions as the source**
   - Open: **https://github.com/sainathpacharya/web-Jack-Marvels/settings/pages**
   - Under **Build and deployment**, set **Source** to **GitHub Actions** (not "Deploy from a branch").
   - Save.

2. **Run the deploy workflow**
   - Open: **https://github.com/sainathpacharya/web-Jack-Marvels/actions**
   - Click **Deploy to GitHub Pages** in the left sidebar.
   - Click **Run workflow** (dropdown) → **Run workflow**.
   - Wait for the run to finish (green check). The first run may take 1–2 minutes.

3. **Open the site**
   - After a successful run, the site is at:
     - **https://sainathpacharya.github.io/web-Jack-Marvels/**
     - **https://sainathpacharya.github.io/web-Jack-Marvels/privacy-policy**
   - If it still 404s, wait a minute and refresh (Pages can take a short time to update).

---

## SPA routing (no broken refresh)

The app uses **React Router v6** with **BrowserRouter**. For direct access and refresh to work (e.g. `https://yourdomain.com/privacy-policy`), the server must serve `index.html` for all routes (SPA fallback).

### Vercel

No extra config needed. Vercel’s default build serves the SPA correctly.

### Netlify

Add a `public/_redirects` file (or `netlify.toml` redirect):

```
/*    /index.html   200
```

### AWS (S3 + CloudFront)

- Configure the error document for 403/404 to be `index.html` (or use a Lambda@Edge/CloudFront function to serve `index.html` for non-file paths).

### Other static hosts

Ensure every path (e.g. `/privacy-policy`) returns the same `index.html` so the React app can handle the route.

---

## Build

- `npm run build` (Vite) outputs to `dist/`. Deploy the contents of `dist/` to your host.
