# Flight data pipeline

## Active sources

The schedule and both route network views use one source:

- `public/data/CathayCargo_Schedule_AUG2026.xlsx`
- worksheet: `TimeTable`
- schedule period: 26 July 2026 to 29 August 2026
- data correct as of: 16 July 2026 00:00 HKT

`lib/schedule/workbook.ts` owns workbook parsing. `lib/schedule/validation.ts`
validates and normalizes every row. `lib/schedule/repository.ts` is the only module
that reads the source file; pages and API routes consume its `ScheduleDataset`.

Historical position CSV files under `db/route` are a separate dataset. They power
the flying route visualizer and must not be treated as timetable records.

## Validation contract

The importer checks the worksheet and 21 column headers, flight identity, airport
codes, itinerary membership, stop counts, validity dates, operating-day markers,
local times with day offsets, aircraft fields, and exact duplicates.

Invalid rows are excluded and exposed in `GET /api/schedule` metadata.

## Updating the schedule

Replace the workbook at the same path, then run:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

If a future workbook changes its worksheet or columns, update the adapter and its
contract deliberately. Do not add a second page-specific parser.

## Project boundaries

```text
app/                     Routes and HTTP delivery
components/schedule/     Schedule UI
components/route/        Network and playback UI
lib/schedule/            Workbook adapter, validation, repository
lib/route/               Historical track parsing
db/route/                Active historical CSV tracks
public/data/             Active published source workbook
misc/legacy/             Disabled features and non-runtime source files
```
