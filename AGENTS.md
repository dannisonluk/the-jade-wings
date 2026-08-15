# Engineering Priorities

These rules are the highest-priority project considerations for every change:

- Do not preserve backward compatibility. Remove obsolete paths instead of adding compatibility layers, fallbacks, or migrations.
- Choose the simplest implementation that fully meets the current requirements. Avoid speculative abstractions, configuration, and indirection.
- Grow the system in layers. Start from the smallest version that works end to end, and add each new capability on top of a product that already works. Never trade a working product for unfinished complexity.
- Keep components modular and concerns clearly separated.
- Prefer established, well-maintained libraries when they reduce overall complexity or improve reliability. Do not reimplement common functionality without a clear reason.
- Lean on the dependencies already in the project before writing your own implementation or adding packages. Do not assume a library lacks a capability without checking its documentation and types.
- Make architectural decisions for the long term. Do not accept a stopgap that only works for now and is meant to be replaced later.

## Repository Boundaries

- `app/` owns routes, layouts, and HTTP delivery only.
- `features/` owns domain UI, domain logic, and domain contracts.
- `components/ui/` owns reusable design-system primitives; `components/layout/` owns the application shell.
- `data/source/` contains externally supplied source files, `data/reference/` contains read-only application datasets, and `data/runtime/` contains API-managed writable data.
- `public/` contains only assets that browsers request directly.
- `archive/` contains non-runtime historical material and must never be imported by application code.
- All user-facing page routes live below a supported locale segment. APIs remain locale-neutral.
