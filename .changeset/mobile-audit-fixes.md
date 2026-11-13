---
'@cdfarkas/omnia': patch
---

Fix the 320 CSS px layout: `Stat` figures drop from 3rem to 2rem in a list narrower than 24rem;
`Checkbox` and `Switch` inputs get a transparent hit area of at least 24×24 CSS px (WCAG 2.5.8)
around an unchanged visible control; `NavBar` links are at least 24px tall and wrapped rows use a
12px row gap (`--omnia-navbar-gap-y` default, was 8px).
