# Sloan Hockey

Landing page for Sloan Hockey training, built with Vite, React, Tailwind CSS and Framer Motion.

## Run locally

```
npm install
npm run dev
```

## Publishing

Every push to `main` builds the site and deploys it to GitHub Pages through `.github/workflows/deploy.yml`, which pushes the build to the `gh-pages` branch. In Settings → Pages, the source should be "Deploy from a branch", branch `gh-pages`, folder `/ (root)`.
