import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import type { Task } from '@/types';
import { computeTaskStats } from '@/lib/stats';
import { ChartFrame, ChartTooltip } from './ChartFrame';

export function TaskCompletionChart({ tasks }: { tasks: Task[] }) {
  const stats = computeTaskStats(tasks);
  const data = [
    { key: 'completed', label: 'Completed', value: stats.completed, color: '#10b981' },
    { key: 'remaining', label: 'Remaining', value: stats.remaining, color: '#cbd5e1' },
  ].filter((entry) => entry.value > 0);

  return (
    <ChartFrame
      title="Task completion"
      description="Completed versus open tasks across all projects."
      isEmpty={stats.total === 0}
      height={240}
      emptyTitle="No tasks yet"
      emptyDescription="Add tasks to a project and your completion rate appears here."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="82%" paddingAngle={2} stroke="none">
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip valueFormatter={(value) => `${value} tasks`} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
