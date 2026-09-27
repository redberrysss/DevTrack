import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { GithubRepo } from '@/types';
import { countReposByLanguage, languageColor } from '@/lib/stats';
import { useChartTheme } from '@/hooks/useChartTheme';
import { ChartFrame, ChartTooltip } from './ChartFrame';

export function GithubLanguagesChart({ repos }: { repos: GithubRepo[] }) {
  const theme = useChartTheme();
  const data = countReposByLanguage(repos);

  return (
    <ChartFrame
      title="Repositories by language"
      description="Primary language of your public GitHub repositories."
      isEmpty={data.length === 0}
      height={260}
      emptyTitle="No repositories to chart"
      emptyDescription="Connect a GitHub username that has public repositories."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -18 }} barCategoryGap="28%">
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis
            dataKey="language"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.axis, fontSize: 12 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={48}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: theme.axis, fontSize: 12 }}
            width={44}
          />
          <Tooltip
            cursor={{ fill: theme.grid }}
            content={<ChartTooltip valueFormatter={(value) => `${value} repos`} />}
          />
          <Bar dataKey="count" name="Repositories" radius={[6, 6, 0, 0]} maxBarSize={46}>
            {data.map((entry, index) => (
              <Cell key={entry.language} fill={languageColor(entry.language, index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
