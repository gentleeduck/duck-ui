---
'@gentleduck/hooks': patch
---

`useMediaQuery` no longer throws where there is no `matchMedia`, as on a server render or in jsdom.
