import { Input } from '@/components/ui/input';
import { Search, CheckCircle } from 'lucide-react';
import { getInitials, getTypeBorderColor, getTypeBadgeStyle } from '@/lib/mock-data';

const conversations = [
  { id: 1, name: 'Coach David Park', type: 'coach', isVerified: true, lastMessage: "Let's set up a meeting to discuss your progress.", time: '2h ago', unread: true },
  { id: 2, name: 'Sarah Chen', type: 'recruiter', isVerified: true, lastMessage: "I'd love to learn more about your stats this season.", time: '5h ago', unread: true },
  { id: 3, name: 'Jaylen Carter', type: 'athlete', isVerified: true, lastMessage: 'Great game yesterday! 🏈', time: '1d ago', unread: false },
  { id: 4, name: 'Maria Santos', type: 'coach', isVerified: true, lastMessage: 'Summer camp registration is open!', time: '2d ago', unread: false },
];

export default function Messages() {
  return (
    <div className="min-h-screen pt-14 pb-20">
      <div className="px-4 pt-4">
        <h1 className="font-display text-2xl tracking-wide mb-4">MESSAGES</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-10 bg-secondary border-border min-h-[44px]" />
        </div>

        <div className="space-y-1">
          {conversations.map(c => (
            <div
              key={c.id}
              className={`glass-card rounded-xl px-4 cursor-pointer active:border-primary/30 transition-colors flex items-center gap-3 border-l-4 ${getTypeBorderColor(c.type)} ${c.unread ? 'border-primary/20' : ''} relative`}
              style={{ height: 72 }}
            >
              {/* Type badge top-right */}
              <span className={`absolute top-2 right-3 text-[8px] font-bold uppercase px-1 py-0.5 rounded ${getTypeBadgeStyle(c.type)}`}>
                {c.type}
              </span>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground font-display">
                {getInitials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm truncate font-display tracking-wide ${c.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{c.name}</span>
                  {c.isVerified && <CheckCircle className="h-3 w-3 text-verified shrink-0" />}
                  <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{c.time}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${c.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{c.lastMessage}</p>
              </div>
              {c.unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Connect with users to start messaging.
        </p>
      </div>
    </div>
  );
}
