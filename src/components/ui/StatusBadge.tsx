import type { ProjectStatus } from '@/types';
import { getStatusMeta } from '@/utils/constants';
import { cn } from '@/utils/cn';
import { Badge } from './Badge';

export interface StatusBadgeProps {
  status: ProjectStatus | string;
  className?: string;
}

/** Status is communicated with a label *and* a dot — never colour alone. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = getStatusMeta(status);
  return (
    <Badge className={cn(meta.badgeClass, className)} dot dotClassName={meta.barClass}>
      {meta.label}
    </Badge>
  );
}
