# Archive

This directory is intentionally outside the runtime import graph. It contains
legacy source files and unfinished drafts kept for reference only.

- `legacy/data/flight-history`: the hidden flight-history feature and its old spreadsheets
- `legacy/data/route-kml`: KML copies replaced by CSV tracks in `data/source`
- `legacy/data/schedule-json`: the old JSON schedule implementation replaced by the Cargo workbook
- `drafts`: pages that are not part of the current product
- `unused-data` and `unused-code`: files with no active consumer

Do not import files from this directory into `app/`, `features/`, or `components/`.
