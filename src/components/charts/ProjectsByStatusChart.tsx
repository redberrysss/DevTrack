import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import type { Project } from '@/types';
import { countProjectsByStatus } from '@/lib/stats';
import { ChartFrame, ChartTooltip } from './ChartFrame';

export function ProjectsByStatusChart({ projects }: { projects: Project[] }) {
  const data = countProjectsByStatus(projects).filter((entry) => entry.value > 0);
  const isEmpty = data.length === 0;

  return (
    <ChartFrame
      title="Projects by status"
      description="How your work is distributed across the pipeline."
      isEmpty={isEmpty}
      height={240}
      emptyTitle="No projects to chart yet"
      emptyDescription="Create your first project to see it tracked here."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="55%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
