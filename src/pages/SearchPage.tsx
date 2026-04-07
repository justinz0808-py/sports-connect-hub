import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInitials, getTypeBorderColor, getTypeBadgeStyle } from '@/lib/mock-data';
import { Search as SearchIcon, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const SPORTS = ['Basketball', 'Football', 'Soccer', 'Baseball', 'Track & Field', 'Volleyball', 'Swimming', 'Tennis', 'Golf', 'Lacrosse', 'Wrestling', 'Other'];
const TYPE_FILTERS = ['All', 'athlete', 'coach', 'recruiter'];

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  user_type: string | null;
  sport: string | null;
  school: string | null;
  location: string | null;
}

function ProfileSkeleton() {
  return (
    <div className="glass-card p-4 rounded-xl border-l-4 border-l-border animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-secondary shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary rounded w-1/3" />
          <div className="h-3 bg-secondary rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('All');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search query by 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Re-fetch whenever debounced query or filters change
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);

      let q = supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, user_type, sport, school, location');

      if (debouncedQuery) {
        q = q.or(
          `full_name.ilike.%${debouncedQuery}%,username.ilike.%${debouncedQuery}%,sport.ilike.%${debouncedQuery}%`
        );
      }
      if (typeFilter !== 'All') {
        q = q.eq('user_type', typeFilter);
      }
      if (sportFilter !== 'all') {
        q = q.ilike('sport', sportFilter);
      }

      const { data } = await q.order('full_name').limit(50);
      setProfiles((data as Profile[]) ?? []);
      setLoading(false);
    };

    fetchProfiles();
  }, [debouncedQuery, sportFilter, typeFilter]);

  return (
    <div className="min-h-screen pt-14 pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-2xl mb-4">SEARCH</h1>

        {/* Search bar */}
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search athletes, coaches, recruiters..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 bg-secondary border-border min-h-[44px]"
          />
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none -mx-4 px-4">
          {TYPE_FILTERS.map(t => (
            <Button
              key={t}
              variant={typeFilter === t ? 'default' : 'outline'}
              size="sm"
              className={`shrink-0 min-h-[44px] rounded-full capitalize ${typeFilter === t ? 'bg-gradient-primary text-primary-foreground' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === 'All' ? 'All' : `${t}s`}
            </Button>
          ))}
        </div>

        {/* Sport filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none -mx-4 px-4">
          <Button
            variant={sportFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="shrink-0 min-h-[36px] rounded-full text-xs"
            onClick={() => setSportFilter('all')}
          >
            All Sports
          </Button>
          {SPORTS.map(s => (
            <Button
              key={s}
              variant={sportFilter === s ? 'secondary' : 'ghost'}
              size="sm"
              className="shrink-0 min-h-[36px] rounded-full text-xs"
              onClick={() => setSportFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-3">
            {profiles.length} result{profiles.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <ProfileSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && profiles.length === 0 && (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground text-sm">No profiles found.</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="space-y-3">
            {profiles.map((p, i) => {
              const userType = p.user_type ?? 'athlete';
              const displayName = p.full_name ?? p.username ?? 'Unknown';
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={`/profile/${p.id}`}
                    className={`block glass-card p-4 rounded-xl border-l-4 ${getTypeBorderColor(userType)} active:border-primary/30 transition-colors relative`}
                  >
                    <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getTypeBadgeStyle(userType)}`}>
                      {userType}
                    </span>
                    <div className="flex items-center gap-3">
                      {p.avatar_url ? (
                        <img
                          src={p.avatar_url}
                          alt={displayName}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                          {getInitials(displayName)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-16">
                        <span className="text-lg truncate block">{displayName}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          {p.sport && <span>{p.sport}</span>}
                          {p.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{p.location}
                            </span>
                          )}
                        </div>
                        {p.school && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.school}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
