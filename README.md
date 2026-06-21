# GODMODE++ Frontend

Static vanilla-JS frontend for GODMODE++.

## Production setup

1. Set your backend URL in `index.html` by uncommenting:
   - `window.GODMODE_API_BASE = "https://your-backend-domain.com"`
2. Serve this repository over HTTPS.
3. Ensure `service-worker.js`, `manifest.json`, and `/icons/*` are deployed at the site root.
4. Confirm backend CORS allows your frontend domain.

## Local run

Open `index.html` with a local static server and keep backend at `http://localhost:8000` (or set `window.GODMODE_API_BASE`).

## Go-live checklist

- [ ] Backend URL in `index.html` points to production HTTPS API
- [ ] Login/signup/forgot/reset flows work end-to-end
- [ ] `/health`, prediction, and pick endpoints respond from production
- [ ] Stripe upgrade links open and premium gating behaves correctly
- [ ] PWA install prompt appears and app icon loads
- [ ] HTTPS and valid TLS certificate enabled
