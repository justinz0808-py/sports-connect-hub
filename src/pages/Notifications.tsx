import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getInitials, timeAgo } from '@/lib/mock-data';
import { Bell, Check, Loader2, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActorProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow';
  post_id: string | null;
  read_at: string | null;
  created_at: string;
  actor: ActorProfile | null;
}

function NotifSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl animate-pulse">
      <div className="h-10 w-10 rounded-full bg-secondary shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-secondary rounded w-3/4" />
        <div className="h-2 bg-secondary rounded w-1/4" />
      </div>
    </div>
  );
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  like: <Heart className="h-3.5 w-3.5 text-red-400" />,
  comment: <MessageCircle className="h-3.5 w-3.5 text-blue-400" />,
  follow: <UserPlus className="h-3.5 w-3.5 text-green-400" />,
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      setCurrentUserId(user.id);

      // Fetch notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(60);

      const rawNotifs = notifs ?? [];

      // Fetch actor profiles in one query
      const actorIds = [...new Set(rawNotifs.map((n: Notification) => n.actor_id))];
      let profileMap = new Map<string, ActorProfile>();
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', actorIds);
        (profiles ?? []).forEach((p: ActorProfile) => profileMap.set(p.id, p));
      }

      setNotifications(rawNotifs.map((n: Notification) => ({
        ...n,
        actor: profileMap.get(n.actor_id) ?? null,
      })));
      setLoading(false);
    };
    init();
  }, []);

  const markAllRead = async () => {
    if (!currentUserId) return;
    const now = new Date().toISOString();
    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', currentUserId)
      .is('read_at', null);
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })));
  };

  const markRead = async (id: string) => {
    const now = new Date().toISOString();
    await supabase.from('notifications').update({ read_at: now }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: now } : n));
  };

  const getMessage = (n: Notification) => {
    const name = n.actor?.full_name ?? n.actor?.username ?? 'Someone';
    switch (n.type) {
      case 'like':    return `${name} liked your post`;
      case 'comment': return `${name} commented on your post`;
      case 'follow':  return `${name} followed you`;
      default:        return `${name} interacted with you`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="min-h-screen pt-14 pb-20">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl">NOTIFICATIONS</h1>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {loading && (
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => <NotifSkeleton key={i} />)}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Bell className="h-14 w-14 text-muted-foreground/20" />
            <p className="text-muted-foreground text-sm">No notifications yet.</p>
            <p className="text-xs text-muted-foreground/60">
              You'll see likes, comments, and follows here.
            </p>
          </div>
        )}

        {!loading && (
          <div className="space-y-1">
            {notifications.map(n => {
              const isUnread = !n.read_at;
              const actorName = n.actor?.full_name ?? n.actor?.username ?? '?';
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-colors active:scale-[0.99] ${
                    isUnread
                      ? 'bg-primary/5 border-l-4 border-l-primary'
                      : 'glass-card border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Actor avatar */}
                  <div className="relative shrink-0">
                    {n.actor?.avatar_url ? (
                      <img
                        src={n.actor.avatar_url}
                        alt={actorName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                        {getInitials(actorName)}
                      </div>
                    )}
                    {/* Type icon badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center">
                      {TYPE_ICON[n.type]}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{getMessage(n)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>

                  {/* Unread dot */}
                  {isUnread && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
