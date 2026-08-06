# FitPlate

FitPlate is a calm, local-first calorie-aware food suggestor demo. It bundles a small reviewed food dataset, keeps profile and today's log in `localStorage`, and has no backend, API keys, or runtime network calls.

## Run locally

```bash
npm install
npm run dev
```

To test the production build:

```bash
npm run build
npm run preview
```

The Vite preview uses the same repository subpath as GitHub Pages, so check it at `/<REPO_NAME>/` (currently `/fitplate/`).

## GitHub Pages deployment

1. In `vite.config.ts`, set the `REPO_NAME` constant to the repository name **exactly**. The value must match the GitHub repository name, including capitalization.
2. In GitHub, open **Settings → Pages → Source** and choose **GitHub Actions**.

After that, pushes to `main` build and deploy through `.github/workflows/deploy.yml`. No secrets or environment variables are required.

FitPlate is demo data, not medical or dietary advice. Verify allergens yourself before eating anything.
