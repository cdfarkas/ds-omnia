import { afterEach } from 'vitest';
import { assertNoIncomplete, type Report } from './axe-incomplete';

// addon-a11y fails only on violations; axe "incomplete" (needs review) results must fail too.
afterEach(({ task }) => {
  const { theme, skin } = document.documentElement.dataset;
  assertNoIncomplete(
    (task.meta as { reports?: Report[] }).reports,
    `theme=${theme} skin=${skin}`,
  );
});
