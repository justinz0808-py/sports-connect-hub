import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allProfiles, getInitials, getTypeColor, sports, athletes } from '@/lib/mock-data';
import { AthleteProfile } from '@/lib/types';
import { Search as SearchIcon, CheckCircle, MapPin, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    return allProfiles.filter(p => {
      const q = query.toLowerCase();
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.sport.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const matchesSport = sportFilter === 'all' || p.sport === sportFilter;
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      return matchesQuery && matchesSport && matchesType;
    });
  }, [query, sportFilter, typeFilter]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container max-w-3xl">
        <h1 className="font-display text-2xl font-bold mb-6">Search</h1>

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search athletes, coaches, recruiters..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex gap-3 mb-4 flex-wrap overflow-hidden">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[160px] bg-secondary"><SelectValue placeholder="Sport" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] bg-secondary"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="athlete">Athletes</SelectItem>
                <SelectItem value="coach">Coaches</SelectItem>
                <SelectItem value="recruiter">Recruiters</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}

        <p className="text-sm text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? 's' : ''}</p>

        {/* Results */}
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
                <Link to={`/profile/${p.id}`} className="block glass-card p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground font-display">
                      {getInitials(p.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{p.name}</span>
                        {p.isVerified && <CheckCircle className="h-3.5 w-3.5 text-verified shrink-0" />}
                        <Badge className={getTypeColor(p.type) + ' capitalize text-[10px] shrink-0'}>{p.type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{p.sport}</span>
                        {athlete && <span>· {athlete.position}</span>}
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground hidden sm:block">
                      <div className="font-semibold text-foreground">{p.followers.toLocaleString()}</div>
                      <div>followers</div>
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
