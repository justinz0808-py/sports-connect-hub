import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { feedPosts, getInitials, getTypeColor, timeAgo } from '@/lib/mock-data';
import { Heart, MessageCircle, Share2, CheckCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const sportFilters = ['All', 'Basketball', 'Football', 'Soccer', 'Track & Field', 'Volleyball', 'Baseball'];

export default function Feed() {
  const [activeSport, setActiveSport] = useState('All');
  const filtered = activeSport === 'All' ? feedPosts : feedPosts.filter(p => p.sport === activeSport);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Feed</h1>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        {/* Sport filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-4">
          {sportFilters.map(s => (
            <Button
              key={s}
              variant={activeSport === s ? 'default' : 'outline'}
              size="sm"
              className={activeSport === s ? 'bg-gradient-primary text-primary-foreground shrink-0' : 'shrink-0'}
              onClick={() => setActiveSport(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground font-display">
                  {getInitials(post.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{post.userName}</span>
                    {post.isVerified && <CheckCircle className="h-3.5 w-3.5 text-verified" />}
                    <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">{post.userType}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{timeAgo(post.createdAt)}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-1 px-1.5 py-0">{post.sport}</Badge>
                  <p className="mt-3 text-sm leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-6 mt-4 text-muted-foreground">
                    <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" /> {post.comments}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
                      <Share2 className="h-4 w-4" /> {post.shares}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
