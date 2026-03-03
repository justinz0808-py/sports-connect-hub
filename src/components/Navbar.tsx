import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, MessageSquare, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Feed', href: '/feed', icon: Bell },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Profile', href: '/profile/a1', icon: User },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">L</span>
          </div>
          <span className="font-display text-lg font-bold tracking-tight">The Locker Room</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.href} to={item.href}>
              <Button
                variant={location.pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          {isLanding && (
            <Link to="/feed">
              <Button size="sm" className="ml-2 bg-gradient-primary font-semibold text-primary-foreground hover:opacity-90">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {navItems.map(item => (
                <Link key={item.href} to={item.href} onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              {isLanding && (
                <Link to="/feed" onClick={() => setOpen(false)}>
                  <Button className="mt-2 w-full bg-gradient-primary font-semibold text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
