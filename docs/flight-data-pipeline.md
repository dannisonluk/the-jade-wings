# Flight data pipeline

## Active sources

The schedule and both route network views use one source:

- `data/source/schedule/CathayCargo_Schedule_AUG2026.xlsx`
- worksheet: `TimeTable`
- schedule period: 26 July 2026 to 29 August 2026
- data correct as of: 16 July 2026 00:00 HKT

`features/schedule/server/workbook.ts` owns workbook parsing,
`features/schedule/server/validation.ts` validates and normalizes every row,
and `features/schedule/server/repository.ts` is the only module that reads the
source file. Pages and API routes consume its `ScheduleDataset`.

Historical position CSV files under `data/source/route-tracks` are a
separate dataset. They power the flying route visualizer and must not be
treated as timetable records.

## Validation contract

The importer checks the worksheet and 21 column headers, flight identity,
airport codes, itinerary membership, stop counts, validity dates, operating-day
markers, local times with day offsets, aircraft fields, and exact duplicates.

Invalid rows are excluded and exposed in `GET /api/schedule` metadata.

## Updating the schedule

Replace the workbook at the same path, then run:

```powershell
npm run lint
npm run typecheck
npm run build
```

If a future workbook changes its worksheet or columns, update the adapter and
its contract deliberately. Do not add a second page-specific parser.

## Project boundaries

```text
app/                    Routes, layouts and HTTP delivery
components/             Shared UI and application shell
features/schedule/      Workbook adapter, validation and schedule UI
features/routes/        Route maps and historical-track playback
data/source/            External source files used by runtime code
data/reference/         Read-only application datasets
data/runtime/           API-managed writable datasets
public/                 Browser-served assets only
archive/                Disabled features and non-runtime source files
```
