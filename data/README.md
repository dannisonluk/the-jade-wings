# Data boundaries

- `source/` is for externally supplied source files. Runtime code may read it,
  but application requests must not write to it.
- `reference/` contains read-only data imported by features.
- `runtime/` contains data managed by API routes and may be written in a
  deployment that provides persistent storage.

`public/` is deliberately not a data directory. Keep browser assets there;
server-only datasets belong under this directory.
