import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { getInitials, getTypeBorderColor, getTypeBadgeStyle } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';

interface MsgProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  user_type: string | null;
}

interface RawMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  partner: MsgProfile;
  lastMessage: string;
  lastTime: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ConvoSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 animate-pulse" style={{ height: 72 }}>
      <div className="h-11 w-11 rounded-full bg-secondary shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-secondary rounded w-1/3" />
        <div className="h-3 bg-secondary rounded w-2/3" />
      </div>
    </div>
  );
}

export default function Messages() {
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<RawMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<MsgProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const profilesMapRef = useRef<Map<string, MsgProfile>>(new Map());

  const buildConversations = useCallback((msgs: RawMessage[], userId: string) => {
    const map = new Map<string, Conversation>();
    for (const msg of msgs) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const partner = profilesMapRef.current.get(partnerId);
      if (!partner) continue;
      if (!map.has(partnerId)) {
        map.set(partnerId, { partner, lastMessage: msg.content, lastTime: msg.created_at });
      }
    }
    setConversations(Array.from(map.values()));
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, created_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    const msgs = (data as RawMessage[]) ?? [];

    const partnerIdSet = new Set<string>();
    for (const m of msgs) {
      partnerIdSet.add(m.sender_id === userId ? m.receiver_id : m.sender_id);
    }
    const partnerIds = Array.from(partnerIdSet);

    if (partnerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, user_type')
        .in('id', partnerIds);
      if (profiles) {
        for (const p of profiles as MsgProfile[]) profilesMapRef.current.set(p.id, p);
      }
    }

    setAllMessages(msgs);
    buildConversations(msgs, userId);
    return profilesMapRef.current;
  }, [buildConversations]);

  // ── Initial load ─────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      const profilesMap = await fetchMessages(user.id);
      setLoading(false);

      const openWith = location.state?.openConversationWith as string | undefined;
      if (openWith) {
        const existing = profilesMap.get(openWith);
        if (existing) {
          setSelectedPartner(existing);
        } else {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, user_type')
            .eq('id', openWith)
            .single();
          if (data) setSelectedPartner(data as MsgProfile);
        }
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Realtime: subscribe to new messages when a thread is open ────────
  useEffect(() => {
    if (!selectedPartner || !currentUserId) return;

    const partnerId = selectedPartner.id;

    const channel = supabase
      .channel(`thread-${currentUserId}-${partnerId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as RawMessage;
          // Only handle messages in this thread
          const isThisThread =
            (msg.sender_id === currentUserId && msg.receiver_id === partnerId) ||
            (msg.sender_id === partnerId && msg.receiver_id === currentUserId);
          if (!isThisThread) return;

          // Skip messages we already have (optimistic duplicates)
          setAllMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [msg, ...prev];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedPartner, currentUserId]);

  // ── Scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPartner, allMessages]);

  const threadMessages = selectedPartner
    ? [...allMessages]
        .filter(m =>
          (m.sender_id === currentUserId && m.receiver_id === selectedPartner.id) ||
          (m.sender_id === selectedPartner.id && m.receiver_id === currentUserId)
        )
        .reverse()
    : [];

  const handleSend = async () => {
    if (!messageText.trim() || !currentUserId || !selectedPartner || isSending) return;
    setIsSending(true);

    const optimisticId = `temp-${Date.now()}`;
    const optimistic: RawMessage = {
      id: optimisticId,
      sender_id: currentUserId,
      receiver_id: selectedPartner.id,
      content: messageText.trim(),
      created_at: new Date().toISOString(),
    };
    setAllMessages(prev => [optimistic, ...prev]);
    setMessageText('');

    const { data: inserted } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: selectedPartner.id,
        content: optimistic.content,
      })
      .select('id, sender_id, receiver_id, content, created_at')
      .single();

    // Replace optimistic message with real one
    if (inserted) {
      setAllMessages(prev =>
        prev.map(m => m.id === optimisticId ? inserted as RawMessage : m)
      );
      // Update conversations list
      buildConversations(
        allMessages.map(m => m.id === optimisticId ? inserted as RawMessage : m),
        currentUserId
      );
    }

    setIsSending(false);
  };

  const userType = (p: MsgProfile) => p.user_type ?? 'athlete';
  const displayName = (p: MsgProfile) => p.full_name ?? p.username ?? 'Unknown';

  const filteredConvos = conversations.filter(c => {
    const name = displayName(c.partner).toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || c.lastMessage.toLowerCase().includes(q);
  });

  // ── Thread view ──────────────────────────────────────────────────────
  if (selectedPartner) {
    const partnerType = userType(selectedPartner);
    return (
      <div className="min-h-screen pt-14 pb-0 flex flex-col">
        {/* Thread header */}
        <div className="fixed top-14 left-0 right-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedPartner(null)}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-secondary active:scale-[0.9] transition-transform"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          {selectedPartner.avatar_url ? (
            <img src={selectedPartner.avatar_url} alt={displayName(selectedPartner)} className="h-9 w-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
              {getInitials(displayName(selectedPartner))}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{displayName(selectedPartner)}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{partnerType}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 pt-[100px] pb-20 space-y-3">
          {threadMessages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-10">
              No messages yet. Say hello!
            </p>
          )}
          {threadMessages.map(msg => {
            const isMine = msg.sender_id === currentUserId;
            const isOptimistic = msg.id.startsWith('temp-');
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-opacity ${
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary text-foreground rounded-bl-sm'
                  } ${isOptimistic ? 'opacity-60' : 'opacity-100'}`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border px-4 py-3 flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="bg-secondary border-border min-h-[44px] flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            size="icon"
            className="min-h-[44px] min-w-[44px] shrink-0 active:scale-[0.9] transition-transform"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }

  // ── Inbox view ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-14 pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-2xl mb-4">MESSAGES</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border min-h-[44px]"
          />
        </div>

        {loading && (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <ConvoSkeleton key={i} />)}
          </div>
        )}

        {!loading && filteredConvos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
            </p>
          </div>
        )}

        {!loading && (
          <div className="space-y-1">
            {filteredConvos.map(c => {
              const pt = userType(c.partner);
              return (
                <button
                  key={c.partner.id}
                  onClick={() => setSelectedPartner(c.partner)}
                  className={`w-full text-left glass-card rounded-xl px-4 cursor-pointer active:scale-[0.98] transition-all flex items-center gap-3 border-l-4 ${getTypeBorderColor(pt)} relative`}
                  style={{ height: 72 }}
                >
                  <span className={`absolute top-2 right-3 text-[8px] font-bold uppercase px-1 py-0.5 rounded ${getTypeBadgeStyle(pt)}`}>
                    {pt}
                  </span>
                  {c.partner.avatar_url ? (
                    <img src={c.partner.avatar_url} alt={displayName(c.partner)} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                      {getInitials(displayName(c.partner))}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm truncate text-foreground">{displayName(c.partner)}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{timeAgo(c.lastTime)}</span>
                    </div>
                    <p className="text-xs truncate mt-0.5 text-muted-foreground">{c.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
