import { useTheme } from './useTheme';

export interface ChartTheme {
  dark: boolean;
  axis: string;
  grid: string;
  label: string;
}

/** Axis and grid colours that stay legible in both light and dark mode. */
export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  return {
    dark,
    axis: dark ? '#9aa5b4' : '#5a6472',
    grid: dark ? 'rgba(148,163,184,0.18)' : 'rgba(100,116,139,0.18)',
    label: dark ? '#9aa5b4' : '#5a6472',
  };
}
