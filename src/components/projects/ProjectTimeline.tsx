import { CalendarCheck, CalendarPlus, Clock, Flag } from 'lucide-react';

import type { Project } from '@/types';
import { formatIsoDate, formatRelativeTime } from '@/utils/format';
import { getStatusMeta } from '@/utils/constants';

interface TimelineEntry {
  icon: typeof Flag;
  label: string;
  value: string;
  muted?: boolean;
}

export function ProjectTimeline({ project }: { project: Project }) {
  const entries: TimelineEntry[] = [
    {
      icon: Flag,
      label: 'Current status',
      value: getStatusMeta(project.status).label,
    },
    {
      icon: CalendarPlus,
      label: 'Start date',
      value: formatIsoDate(project.startDate),
    },
    {
      icon: CalendarCheck,
      label: 'End date',
      value: project.endDate ? formatIsoDate(project.endDate) : 'Not scheduled',
      muted: !project.endDate,
    },
    {
      icon: Clock,
      label: 'Last updated',
      value: formatRelativeTime(project.updatedAt ?? project.createdAt),
    },
  ];

  return (
    <ol className="relative space-y-4 border-l border-line pl-5">
      {entries.map((entry) => (
        <li key={entry.label} className="relative">
          <span
            aria-hidden
            className="absolute -left-[30px] flex size-5 items-center justify-center rounded-full border border-line bg-surface text-ink-subtle"
          >
            <entry.icon className="size-3" />
          </span>
          <p className="text-xs font-medium tracking-wide text-ink-subtle uppercase">{entry.label}</p>
          <p className={`mt-0.5 text-sm ${entry.muted ? 'text-ink-subtle' : 'text-ink'}`}>{entry.value}</p>
        </li>
      ))}
    </ol>
  );
}
