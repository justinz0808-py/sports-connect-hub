import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';

const tabs = [
  { label: 'Home', href: '/feed', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Post', href: '/post', icon: PlusCircle },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Profile', href: '/profile/a1', icon: User },
];

export default function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map(tab => {
          const isActive = tab.href === '/feed'
            ? location.pathname === '/feed' || location.pathname === '/'
            : location.pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2"
            >
              <tab.icon
                className="h-5 w-5"
                style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
