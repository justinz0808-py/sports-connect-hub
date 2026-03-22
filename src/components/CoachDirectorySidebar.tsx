import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { coaches, getInitials, sports } from '@/lib/mock-data';
import { CoachProfile } from '@/lib/types';
import { Search, CheckCircle, MapPin, UserPlus, UserCheck, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoachDirectorySidebarProps {
  onSelectCoach: (coachId: string) => void;
  selectedCoachId?: string | null;
  className?: string;
  onClose?: () => void;
}

const coachSports = ['All', ...Array.from(new Set(coaches.flatMap(c => c.sportsOffered)))];

export default function CoachDirectorySidebar({ onSelectCoach, selectedCoachId, className = '', onClose }: CoachDirectorySidebarProps) {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return coaches.filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.organization.toLowerCase().includes(q) || c.sport.toLowerCase().includes(q);
      const matchesSport = sportFilter === 'All' || c.sportsOffered.includes(sportFilter);
      return matchesQuery && matchesSport;
    });
  }, [query, sportFilter]);

  const toggleFollow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFollowedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className={`flex flex-col border-l border-border bg-card/50 backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            Coaches Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{coaches.length} coaches</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7 lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search coaches..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-secondary border-border"
          />
        </div>
      </div>

      {/* Sport filter chips */}
      <div className="flex gap-1.5 overflow-x-auto px-3 py-3 scrollbar-none">
        {coachSports.map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              sportFilter === s
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Coach list */}
      <ScrollArea className="flex-1">
        <div className="px-3 pb-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-xs text-muted-foreground">No coaches found</p>
                <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => { setQuery(''); setSportFilter('All'); }}>
                  Clear filters
                </Button>
              </motion.div>
            ) : (
              filtered.map((coach, i) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  index={i}
                  isFollowed={followedIds.has(coach.id)}
                  isSelected={selectedCoachId === coach.id}
                  onSelect={() => onSelectCoach(coach.id)}
                  onToggleFollow={(e) => toggleFollow(e, coach.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* View All link */}
      <div className="p-3 border-t border-border">
        <a href="/search?type=coach" className="text-xs text-primary hover:underline font-medium">
          View full directory →
        </a>
      </div>
    </div>
  );
}

function CoachCard({
  coach, index, isFollowed, isSelected, onSelect, onToggleFollow
}: {
  coach: CoachProfile;
  index: number;
  isFollowed: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFollow: (e: React.MouseEvent) => void;
}) {
  const followerCount = coach.followers + (isFollowed ? 1 : 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02 }}
      onClick={onSelect}
      className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-card ${
        isSelected
          ? 'border-accent/50 bg-accent/5'
          : 'border-border hover:border-muted-foreground/20 bg-card/60'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-accent text-xs font-bold text-accent-foreground">
          {getInitials(coach.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold truncate">{coach.name}</span>
            {coach.isVerified && <CheckCircle className="h-3 w-3 text-verified shrink-0" />}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{coach.organization}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">{coach.sport}</Badge>
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="h-2.5 w-2.5" />{coach.location}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">{followerCount.toLocaleString()} followers</span>
        <Button
          size="sm"
          variant={isFollowed ? 'secondary' : 'default'}
          className={`h-6 text-[10px] px-2.5 gap-1 ${
            isFollowed
              ? ''
              : 'bg-gradient-primary text-primary-foreground hover:opacity-90'
          }`}
          onClick={onToggleFollow}
        >
          {isFollowed ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
          {isFollowed ? 'Following' : 'Follow'}
        </Button>
      </div>
    </motion.div>
  );
}
