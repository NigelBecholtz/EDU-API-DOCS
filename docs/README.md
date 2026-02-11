# EDU Immosurance API Documentation

This folder contains the **Zudoku**-powered API documentation for the EDU Immosurance API.

## Quick Start

```bash
npm install
npm run dev
```

The documentation site will be available at **http://localhost:3000**.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## Structure

- **`zudoku.config.ts`** — Zudoku configuration (navigation, API reference, docs)
- **`pages/`** — MDX documentation pages
- **`../openapi.yaml`** — OpenAPI 3.0 specification (in parent folder)

## Customization

- Edit `zudoku.config.ts` to change navigation, add APIs, or configure themes
- Add or edit `.mdx` files in `pages/docs/` for documentation content
- Update `../openapi.yaml` to reflect API changes

## Deployment

Build the static site:

```bash
npm run build
```

The output will be in the `dist` or `build` folder. Deploy to Vercel, Netlify, Cloudflare Pages, or any static hosting service.
