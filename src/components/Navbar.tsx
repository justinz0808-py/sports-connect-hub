import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="text-base font-bold text-primary-foreground">L</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight">THE LOCKER ROOM</span>
        </Link>
        <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </nav>
  );
}
