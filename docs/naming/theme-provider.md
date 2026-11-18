# Naming study — theme provider and its hook

Date: 2026-10-31. Method: official docs and current guides opened via web search during this study. Scope: the component a consumer wraps their app in to drive Omnia's theme (light/dark) and skin (default/pixel) axes, plus its read hook.

## Question

Omnia exports no theming entry point today; Storybook themes via `@storybook/addon-themes`. We need one exported provider that sets `data-theme`/`data-skin` and a hook to read the active pair. What should the provider and the hook be named?

## Survey

| System                      | Provider / wrapper                                    | Read hook               | Subtree theming            | Src |
| --------------------------- | ----------------------------------------------------- | ----------------------- | -------------------------- | --- |
| MUI                         | `ThemeProvider` (`cssVariables: true`; old `CssVarsProvider`) | `useColorScheme` | nested `ThemeProvider`     | S1  |
| Mantine                     | `MantineProvider`                                     | `useMantineColorScheme` | —                          | S2  |
| Chakra UI v3                | `ChakraProvider` + `ColorModeProvider` (wraps next-themes) | `useColorMode`     | `forcedTheme` subtree      | S3  |
| Ant Design                  | `ConfigProvider` (`theme.algorithm`)                  | —                       | nested `ConfigProvider`    | S4  |
| shadcn / next-themes        | `ThemeProvider`                                       | `useTheme`              | —                          | S5  |
| Radix Themes                | `Theme`                                               | —                       | nested `Theme`             | S6  |
| Fluent UI v9                | `FluentProvider`                                      | `useFluent`             | component-level provider   | S7  |
| styled-components / emotion | `ThemeProvider`                                       | `useTheme`              | nested, merges             | S8  |

## Patterns

- Generic `ThemeProvider`: MUI, shadcn/next-themes, styled-components, emotion — 4 of 8.
- `<Brand>Provider`: Mantine, Chakra, Fluent; Ant's `ConfigProvider` is a brand-flavoured generic.
- Short name: Radix `Theme`.
- `useTheme()` is the dominant hook name (next-themes, styled-components, emotion; MUI's `useTheme` returns the theme object, `useColorScheme` the mode).
- Subtree theming is common, but every system that offers it scopes tokens to the provider's element or class, not `:root`. Omnia's tokens are `:root`-anchored, so subtree theming is not available without de-rooting those selectors (ADR 0017).

## Options for Omnia

**A. `OmniaThemeProvider` + `useTheme()`.** Prefixed (ADR 0013 namespacing), precise (owns theme + skin), collision-safe: an unprefixed `ThemeProvider` from `@cfarkas/omnia` clashes on import with a consumer's existing MUI / styled-components `ThemeProvider`.

**B. `OmniaProvider`.** Brand-provider pattern (Mantine/Chakra/Fluent); room to also own locale later. But today it only does theme + skin, so the broader name is speculative.

**C. `ThemeProvider`.** Matches the dominant generic and pairs naturally with `useTheme()`. But unprefixed means an import collision, against ADR 0013's whole namespacing rationale.

## Recommendation

Option A: `OmniaThemeProvider` with `useTheme()`. The prefix is on-brand and collision-safe; "Theme" reasonably covers both axes since skin is a theming axis, and `useTheme()` is the near-universal hook name.

Prop names checked against the prop-naming rule (ADR 0015): `theme`, `skin`, `children` — none is a native HTML attribute name carrying a conflicting type, so no `variant<Axis>` rename is needed.

## Decision

Option A, chosen by the owner on 2026-10-31: `OmniaThemeProvider` + `useTheme()`, document-root target. Recorded alongside ADR 0017, which supersedes ADR 0004.

## Sources

All opened 2026-10-31.

- S1 MUI: https://mui.com/material-ui/customization/css-theme-variables/usage/
- S2 Mantine: https://mantine.dev/theming/color-schemes
- S3 Chakra UI v3: https://chakra-ui.com/color-mode , https://next.chakra-ui.com/docs/styling/dark-mode
- S4 Ant Design: https://ant.design/docs/react/customize-theme
- S5 shadcn / next-themes: https://ui.shadcn.com/docs/dark-mode/next
- S6 Radix Themes: https://www.radix-ui.com/themes/docs/components/theme
- S7 Fluent UI v9 (community guide; official `useFluent` page not opened): https://dev.to/paulgildea/getting-started-with-fluent-ui-react-v9-36de
- S8 styled-components / emotion: https://emotion.sh/docs/theming
