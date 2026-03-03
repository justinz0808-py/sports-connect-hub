import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { feedPosts, getInitials, getTypeColor, timeAgo, allProfiles, coaches } from '@/lib/mock-data';
import { CoachProfile } from '@/lib/types';
import { Heart, MessageCircle, Share2, CheckCircle, Filter, ArrowLeft, Users, MapPin, UserPlus, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CoachDirectorySidebar from '@/components/CoachDirectorySidebar';

const sportFilters = ['All', 'Basketball', 'Football', 'Soccer', 'Track & Field', 'Volleyball', 'Baseball'];

export default function Feed() {
  const [activeSport, setActiveSport] = useState('All');
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const filtered = activeSport === 'All' ? feedPosts : feedPosts.filter(p => p.sport === activeSport);
  const selectedCoach = selectedCoachId ? coaches.find(c => c.id === selectedCoachId) as CoachProfile | undefined : undefined;

  return (
    <div className="min-h-screen pt-16">
      <div className="flex">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-12">
            <AnimatePresence mode="wait">
              {selectedCoach ? (
                <CoachInlineProfile key="profile" coach={selectedCoach} onBack={() => setSelectedCoachId(null)} />
              ) : (
                <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="font-display text-2xl font-bold">Feed</h1>
                    <div className="flex items-center gap-2">
                      {/* Mobile coaches toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 lg:hidden"
                        onClick={() => setShowSidebar(true)}
                      >
                        <Users className="h-4 w-4" /> Coaches
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                        <Filter className="h-4 w-4" /> Filter
                      </Button>
                    </div>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-[280px] shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
          <CoachDirectorySidebar
            onSelectCoach={setSelectedCoachId}
            selectedCoachId={selectedCoachId}
          />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                onClick={() => setShowSidebar(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-16 right-0 bottom-0 z-50 w-[300px] lg:hidden"
              >
                <CoachDirectorySidebar
                  onSelectCoach={(id) => { setSelectedCoachId(id); setShowSidebar(false); }}
                  selectedCoachId={selectedCoachId}
                  onClose={() => setShowSidebar(false)}
                  className="h-full"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CoachInlineProfile({ coach, onBack }: { coach: CoachProfile; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Button variant="ghost" size="sm" className="gap-2 mb-4 text-muted-foreground" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Back to Feed
      </Button>

      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-accent text-xl font-bold text-accent-foreground font-display">
            {getInitials(coach.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl font-bold">{coach.name}</h1>
              {coach.isVerified && <CheckCircle className="h-5 w-5 text-verified" />}
              <Badge className="bg-accent text-accent-foreground capitalize text-xs">Coach</Badge>
            </div>
            <p className="text-accent font-semibold mt-1 text-sm">{coach.title}</p>
            <p className="text-sm text-muted-foreground">{coach.organization}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{coach.location}</span>
            </div>
            <div className="flex gap-6 mt-3 text-sm">
              <span><strong className="text-foreground">{coach.followers.toLocaleString()}</strong> <span className="text-muted-foreground">followers</span></span>
              <span><strong className="text-foreground">{coach.following.toLocaleString()}</strong> <span className="text-muted-foreground">following</span></span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 flex-wrap">
          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 gap-2"><UserPlus className="h-4 w-4" />Follow</Button>
          <Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" />Message</Button>
        </div>
      </div>

      <div className="glass-card p-6 mt-4">
        <h2 className="font-display text-lg font-semibold mb-2">About</h2>
        <p className="text-muted-foreground leading-relaxed text-sm">{coach.bio}</p>
      </div>

      <div className="glass-card p-6 mt-4">
        <h2 className="font-display text-lg font-semibold mb-3">Program Details</h2>
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Organization:</span> <span className="font-medium">{coach.organization}</span></p>
          <p><span className="text-muted-foreground">Sports:</span> <span className="font-medium">{coach.sportsOffered.join(', ')}</span></p>
          <p><span className="text-muted-foreground">Location:</span> <span className="font-medium">{coach.location}</span></p>
        </div>
      </div>

      {/* Coach's posts */}
      <div className="glass-card p-6 mt-4">
        <h2 className="font-display text-lg font-semibold mb-3">Recent Posts</h2>
        {feedPosts.filter(p => p.userId === coach.id).length > 0 ? (
          <div className="space-y-3">
            {feedPosts.filter(p => p.userId === coach.id).map(post => (
              <div key={post.id} className="rounded-lg bg-secondary p-4">
                <p className="text-sm leading-relaxed">{post.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{timeAgo(post.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        )}
      </div>
    </motion.div>
  );
}
