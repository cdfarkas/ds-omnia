---
'@cdfarkas/omnia': minor
---

Add the `AppHeader` organism: the global app header (`AppHeader.Brand`, `AppHeader.Nav`,
`AppHeader.Actions`) that goes inside `PageTemplate.Header`. Every part renders a `<div>`, so the
page keeps one banner landmark; the parts wrap instead of overflowing at 320 CSS px.
