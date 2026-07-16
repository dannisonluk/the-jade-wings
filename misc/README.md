# Miscellaneous archive

`misc/legacy` contains files intentionally removed from the runtime application.
Nothing in this directory should be imported by `app`, `components`, or `lib`.

- `flight-history`: disabled page/API source and nine historical XLSX files.
- `route-kml`: KML copies of tracks; the visualizer uses CSV files in `db/route`.
- `schedule-json`: superseded JSON schedules and the old schedule table component.

Keep new production data in its owning feature directory. Use this archive only
when a removed feature or source must remain recoverable.
