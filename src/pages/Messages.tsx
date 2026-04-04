import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, Send } from 'lucide-react';
import { getInitials, getTypeBorderColor, getTypeBadgeStyle } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const conversations = [
  { id: 1, name: 'Coach David Park', type: 'coach', isVerified: true, lastMessage: "Let's set up a meeting to discuss your progress.", time: '2h ago', unread: true },
  { id: 2, name: 'Sarah Chen', type: 'recruiter', isVerified: true, lastMessage: "I'd love to learn more about your stats this season.", time: '5h ago', unread: true },
  { id: 3, name: 'Jaylen Carter', type: 'athlete', isVerified: true, lastMessage: 'Great game yesterday! 🏈', time: '1d ago', unread: false },
  { id: 4, name: 'Maria Santos', type: 'coach', isVerified: true, lastMessage: 'Summer camp registration is open!', time: '2d ago', unread: false },
];

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvo, setSelectedConvo] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!messageText.trim()) return;
    toast({ title: 'Message sent!', description: `Your message to ${conversations.find(c => c.id === selectedConvo)?.name} was sent.` });
    setMessageText('');
  };

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

        <div className="space-y-1">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConvo(selectedConvo === c.id ? null : c.id)}
              className={`w-full text-left glass-card rounded-xl px-4 cursor-pointer active:scale-[0.98] transition-all flex items-center gap-3 border-l-4 ${getTypeBorderColor(c.type)} ${selectedConvo === c.id ? 'ring-1 ring-primary' : ''} relative`}
              style={{ height: 72 }}
            >
              <span className={`absolute top-2 right-3 text-[8px] font-bold uppercase px-1 py-0.5 rounded ${getTypeBadgeStyle(c.type)}`}>
                {c.type}
              </span>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                {getInitials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm truncate ${c.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{c.name}</span>
                  {c.isVerified && <CheckCircle className="h-3 w-3 text-verified shrink-0" />}
                  <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{c.time}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${c.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{c.lastMessage}</p>
              </div>
              {c.unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
            </button>
          ))}
        </div>

        {/* Quick reply when a conversation is selected */}
        {selectedConvo && (
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="bg-elevated border-border min-h-[44px] flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim()}
              size="icon"
              className="min-h-[44px] min-w-[44px] active:scale-[0.9] transition-transform"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          Tap a conversation to reply.
        </p>
      </div>
    </div>
  );
}
