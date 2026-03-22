import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { allProfiles, getInitials, getTypeBorderColor, getTypeBadgeStyle, sports } from '@/lib/mock-data';
import { AthleteProfile } from '@/lib/types';
import { Search as SearchIcon, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const typeFilters = ['All', 'athlete', 'coach', 'recruiter'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('All');

  const results = useMemo(() => {
    return allProfiles.filter(p => {
      const q = query.toLowerCase();
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.sport.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const matchesSport = sportFilter === 'all' || p.sport === sportFilter;
      const matchesType = typeFilter === 'All' || p.type === typeFilter;
      return matchesQuery && matchesSport && matchesType;
    });
  }, [query, sportFilter, typeFilter]);

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
          {typeFilters.map(t => (
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
          {sports.map(s => (
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

        <p className="text-sm text-muted-foreground mb-3">{results.length} result{results.length !== 1 ? 's' : ''}</p>

        {/* Results — full width stacked cards */}
        <div className="space-y-3">
          {results.map((p, i) => {
            const athlete = p.type === 'athlete' ? (p as AthleteProfile) : null;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/profile/${p.id}`} className={`block glass-card p-4 rounded-xl border-l-4 ${getTypeBorderColor(p.type)} active:border-primary/30 transition-colors relative`}>
                  {/* Type badge top-right */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getTypeBadgeStyle(p.type)}`}>
                    {p.type}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                      {getInitials(p.name)}
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center gap-2">
                        <span className="text-lg truncate">{p.name}</span>
                        {p.isVerified && <CheckCircle className="h-3.5 w-3.5 text-verified shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span>{p.sport}</span>
                        {athlete && <span>· {athlete.position}</span>}
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-semibold text-foreground">{p.followers.toLocaleString()}</span> followers
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
