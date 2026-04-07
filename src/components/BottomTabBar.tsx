import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import { supabase } from '@/lib/supabase';

const tabs = [
  { label: 'HOME', href: '/feed', icon: Home },
  { label: 'SEARCH', href: '/search', icon: Search },
  { label: 'POST', href: '#post', icon: PlusCircle },
  { label: 'NOTIFS', href: '/notifications', icon: Bell },
  { label: 'PROFILE', href: '/profile', icon: User },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);
      setUnreadCount(count ?? 0);
    };
    fetchUnread();
  }, [location.pathname]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {tabs.map(tab => {
            const isPost = tab.href === '#post';
            const isActive = !isPost && (
              tab.href === '/feed'
                ? location.pathname === '/feed' || location.pathname === '/'
                : location.pathname.startsWith(tab.href)
            );

            if (isPost) {
              return (
                <button
                  key={tab.href}
                  onClick={() => setPostModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 active:scale-[0.9] transition-transform"
                >
                  <tab.icon className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-semibold tracking-wide text-primary">
                    {tab.label}
                  </span>
                </button>
              );
            }

            const isNotifs = tab.href === '/notifications';
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 active:scale-[0.9] transition-transform"
              >
                <div className="relative">
                  <tab.icon
                    className="h-5 w-5"
                    style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                  />
                  {isNotifs && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      <CreatePostModal
        open={postModalOpen}
        onOpenChange={setPostModalOpen}
        onPostCreated={() => navigate('/feed')}
      />
    </>
  );
}
