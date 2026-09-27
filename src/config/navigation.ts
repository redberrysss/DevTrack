import { FolderKanban, LayoutDashboard, Settings, User } from 'lucide-react';
import { Github } from '@/components/ui/BrandIcons';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const mainNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview of your work' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, description: 'Manage projects and tasks' },
  { to: '/github', label: 'GitHub', icon: Github, description: 'Repositories and activity' },
  { to: '/profile', label: 'Profile', icon: User, description: 'Your public developer profile' },
  { to: '/settings', label: 'Settings', icon: Settings, description: 'Account, appearance and security' },
];
