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
npx tsc --noEmit
npm run build
```

## Structure

```text
app/                 App Router pages and API routes
components/          Feature and shared UI
lib/schedule/        Cargo workbook parsing, validation and repository
lib/route/           Historical track parsing
db/route/            Runtime CSV track data
db/json/             Small runtime JSON datasets
public/data/         Active Cathay Cargo schedule workbook
public/images/       Runtime images
misc/legacy/         Disabled features and archived source data
types/               Shared application contracts
```

The schedule page, schedule API, and 2D/3D network maps all use
`public/data/CathayCargo_Schedule_AUG2026.xlsx`. See
`docs/flight-data-pipeline.md` before replacing or changing its schema.
