# Jade Wings

Fan-made Cathay information app built with Next.js 15 and React 19.

## Development

```powershell
npm install
npm run dev
```

Quality gates:

```powershell
npm run lint
npm run typecheck
npm run build
```

## Structure

```text
app/[locale]/          Localized pages and the application shell
app/api/                Locale-neutral HTTP endpoints
components/ui/         Reusable design-system primitives
components/layout/     Navigation, language switcher and footer
features/              Domain UI, contracts and server-side logic
data/source/            Supplied schedule workbook and route-track CSVs
data/reference/         Read-only maps, airport and fleet datasets
data/runtime/           API-managed writable data
public/                 Browser-served images and 3D models only
archive/                Non-runtime legacy files and unfinished drafts
```

The supported locales are `en` and `zh-HK`. Locale URLs are explicit, for
example `/en/schedule` and `/zh-HK/schedule`. The language selector preserves
the current page while changing the locale.

The schedule page, schedule API, and 2D/3D network maps all use
`data/source/schedule/CathayCargo_Schedule_AUG2026.xlsx`. See
`docs/flight-data-pipeline.md` before replacing or changing its schema.
