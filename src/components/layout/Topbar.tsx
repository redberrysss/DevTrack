import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, user } = useAuth();
  const displayName = profile?.name?.trim() || user?.displayName || 'Developer';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          className="px-2"
        >
          <Menu className="size-5" aria-hidden />
        </Button>

        <Logo to="/dashboard" className="min-w-0 flex-1" />

        <ThemeToggle />
        <Link to="/settings" aria-label="Open account settings" className="rounded-full">
          <Avatar name={displayName} src={profile?.avatar} size="sm" />
        </Link>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
