---
"@gentleduck/calendar": patch
---

Fix importing `@gentleduck/calendar` or `@gentleduck/calendar/adapter` without `date-fns`, `dayjs` and `luxon` installed (#545). Both entry points imported every adapter statically, so Node failed with `ERR_MODULE_NOT_FOUND` and bundlers such as Vite and esbuild could not resolve the missing library, even when only `NativeAdapter` was used.

The adapters for a date library now live at their own subpaths: `@gentleduck/calendar/adapter/date-fns`, `@gentleduck/calendar/adapter/dayjs` and `@gentleduck/calendar/adapter/luxon`. The root and `/adapter` keep `NativeAdapter`, `PersianAdapter`, `IslamicAdapter` and `HebrewAdapter`.

**Breaking:** `DateFnsAdapter`, `DayjsAdapter` and `LuxonAdapter` are no longer exported from the root or `/adapter`. Import each from its subpath:

```ts
import { DayjsAdapter } from '@gentleduck/calendar/adapter/dayjs'
```
