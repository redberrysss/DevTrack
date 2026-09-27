import { CheckCircle2, CircleDashed, ListTodo } from 'lucide-react';

import type { Task } from '@/types';
import { computeTaskStats } from '@/lib/stats';
import { Card, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Loading';
import { LinkButton } from '@/components/ui/LinkButton';

export function TaskProgressCard({ tasks, loading }: { tasks: Task[]; loading: boolean }) {
  const stats = computeTaskStats(tasks);

  return (
    <Card>
      <CardHeader
        title="Task progress"
        description="Across every project you are tracking."
        actions={
          <LinkButton to="/projects" variant="ghost" size="sm">
            Manage tasks
          </LinkButton>
        }
      />

      <div className="mt-5">
        {loading ? (
          <Skeleton className="h-2 w-full" />
        ) : (
          <ProgressBar
            value={stats.percentComplete}
            label="Overall completion"
            showValue
            srDescription={`${stats.completed} of ${stats.total} tasks completed`}
          />
        )}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, tone: 'text-ink' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, tone: 'text-positive' },
          { label: 'Remaining', value: stats.remaining, icon: CircleDashed, tone: 'text-ink-muted' },
        ].map((item) => (
          <div key={item.label} className="rounded-[var(--radius-control)] border border-line bg-surface-muted/50 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <item.icon className="size-3.5" aria-hidden />
              {item.label}
            </dt>
            <dd className={`mt-1 text-lg font-semibold tabular-nums ${item.tone}`}>
              {loading ? <Skeleton className="h-6 w-8" /> : item.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
