import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { feedPosts, getInitials, getTypeBorderColor, getTypeBadgeStyle, timeAgo } from '@/lib/mock-data';
import { Heart, MessageCircle, Share2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const sportFilters = ['All', 'Basketball', 'Football', 'Soccer', 'Track & Field', 'Volleyball', 'Baseball'];

export default function Feed() {
  const [activeSport, setActiveSport] = useState('All');
  const filtered = activeSport === 'All' ? feedPosts : feedPosts.filter(p => p.sport === activeSport);

  return (
    <div className="min-h-screen pt-14 pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-2xl mb-4">FEED</h1>

        {/* Sport filter pills — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none -mx-4 px-4">
          {sportFilters.map(s => (
            <Button
              key={s}
              variant={activeSport === s ? 'default' : 'outline'}
              size="sm"
              className={`shrink-0 min-h-[44px] rounded-full ${activeSport === s ? 'bg-gradient-primary text-primary-foreground' : ''}`}
              onClick={() => setActiveSport(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 rounded-xl border-l-4 ${getTypeBorderColor(post.userType)} relative`}
            >
              {/* Type badge top-right */}
              <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getTypeBadgeStyle(post.userType)}`}>
                {post.userType}
              </span>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                  {getInitials(post.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap pr-16">
                    <span className="text-base">{post.userName}</span>
                    {post.isVerified && <CheckCircle className="h-3.5 w-3.5 text-verified" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{post.sport}</Badge>
                    <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-6 mt-4 text-muted-foreground">
                    <button className="flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] justify-center active:text-primary transition-colors">
                      <Heart className="h-4 w-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] justify-center active:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" /> {post.comments}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] justify-center active:text-primary transition-colors">
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
