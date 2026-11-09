import type { A11yReport } from '@storybook/addon-a11y';

export type Report = { type: string; status: string; result: A11yReport };

export function assertNoIncomplete(reports: Report[] | undefined, mode: string): void {
  const a11y = reports?.find((report) => report.type === 'a11y');
  if (!a11y || a11y.status === 'warning' || !('incomplete' in a11y.result)) return;
  const { incomplete } = a11y.result;
  if (incomplete.length === 0) return;
  const details = incomplete.map(
    ({ id, help, nodes }) =>
      `- ${id}: ${help}\n${nodes.map((node) => `    ${node.target.join(' ')}: ${node.failureSummary ?? ''}`).join('\n')}`,
  );
  throw new Error(
    `axe returned ${incomplete.length} incomplete (needs review) result(s) in ${mode}:\n${details.join('\n')}`,
  );
}
