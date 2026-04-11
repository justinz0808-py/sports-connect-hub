import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInitials, getTypeBorderColor, getTypeBadgeStyle, timeAgo } from '@/lib/mock-data';
import { Heart, MessageCircle, Share2, PenSquare, Loader2, Send, MoreHorizontal, Trash2, X, Plus, RefreshCw, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import CreatePostModal from '@/components/CreatePostModal';

const SPORT_FILTERS = ['All', 'Basketball', 'Football', 'Soccer', 'Baseball', 'Track & Field', 'Volleyball', 'Swimming', 'Tennis', 'Golf', 'Lacrosse', 'Wrestling', 'Other'];
const PAGE_SIZE = 10;

interface PostProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  user_type: string | null;
  sport: string | null;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  sport: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: PostProfile | null;
}

interface StoryProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface CommentProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profiles: CommentProfile | null;
}

function PostSkeleton() {
  return (
    <div className="glass-card p-4 rounded-xl border-l-4 border-l-border animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-secondary shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary rounded w-1/3" />
          <div className="h-3 bg-secondary rounded w-1/4" />
          <div className="h-3 bg-secondary rounded w-full mt-3" />
          <div className="h-3 bg-secondary rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [activeSport, setActiveSport] = useState('All');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  const [pendingNewPosts, setPendingNewPosts] = useState<Post[]>([]);

  // Pull-to-refresh
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Double-tap tracking
  const lastTapRef = useRef<Record<string, number>>({});

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentLoading, setCommentLoading] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Set<string>>(new Set());
  const [menuOpenPostId, setMenuOpenPostId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Stories state
  const navigate = useNavigate();
  const [storyProfiles, setStoryProfiles] = useState<StoryProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<StoryProfile | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('viewedStories') ?? '[]')); }
    catch { return new Set(); }
  });

  const { toast } = useToast();

  // ── Fetch a page of posts ────────────────────────────────────────────
  const fetchPostsPage = useCallback(async (pageIndex: number, replace: boolean) => {
    const { data } = await supabase
      .from('posts')
      .select(`*, profiles(id, full_name, username, avatar_url, user_type, sport)`)
      .order('created_at', { ascending: false })
      .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);

    const fetched = (data as Post[]) ?? [];
    setHasMore(fetched.length === PAGE_SIZE);
    if (replace) {
      setPosts(fetched);
    } else {
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        return [...prev, ...fetched.filter(p => !existingIds.has(p.id))];
      });
    }
    return fetched;
  }, []);

  const fetchPosts = useCallback(async () => {
    setPage(0);
    await fetchPostsPage(0, true);
  }, [fetchPostsPage]);

  // ── Initial load ─────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        setCurrentUserId(user.id);

        const [likesRes, profileRes, followsRes] = await Promise.all([
          supabase.from('likes').select('post_id').eq('user_id', user.id),
          supabase.from('profiles').select('id, full_name, username, avatar_url, sport').eq('id', user.id).single(),
          supabase.from('follows').select('following_id').eq('follower_id', user.id),
        ]);

        // Redirect to setup if profile is incomplete — covers both new users and
        // legacy users who may have a username but never completed the sport step.
        const p = profileRes.data as (StoryProfile & { sport: string | null }) | null;
        if (!p?.username || !p?.sport) {
          navigate('/profile/setup', { replace: true });
          return;
        }

        if (likesRes.data) {
          setLikedPosts(new Set(likesRes.data.map((l: { post_id: string }) => l.post_id)));
        }

        if (profileRes.data) {
          // Redirect to profile setup if username is not set
          if (!profileRes.data.username) {
            navigate('/profile/setup');
            return;
          }
          setCurrentUserProfile(profileRes.data as StoryProfile);
        }

        const followingIds = (followsRes.data ?? []).map((f: { following_id: string }) => f.following_id);
        if (followingIds.length > 0) {
          const { data: storyData } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', followingIds)
            .limit(20);
          setStoryProfiles((storyData ?? []) as StoryProfile[]);
        }
      }

      await fetchPostsPage(0, true);
      setLoading(false);
    };

    init();
  }, [fetchPostsPage, navigate]);

  // ── Realtime: new posts ──────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('feed-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          // Skip own posts — they're added immediately via fetchPosts after modal
          if (payload.new.user_id === currentUserId) return;

          // Fetch full post with profile join
          const { data } = await supabase
            .from('posts')
            .select(`*, profiles(id, full_name, username, avatar_url, user_type, sport)`)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setPendingNewPosts(prev => [data as Post, ...prev]);
            setNewPostsAvailable(true);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  // ── Infinite scroll ──────────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          await fetchPostsPage(nextPage, false);
          setLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPostsPage]);

  // ── Pull-to-refresh ──────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) setPullY(Math.min(dy * 0.4, 70));
  };

  const handleTouchEnd = async () => {
    if (pullY > 50) {
      setIsPulling(true);
      setPullY(0);
      await fetchPosts();
      setIsPulling(false);
    } else {
      setPullY(0);
    }
  };

  // ── Show pending realtime posts ──────────────────────────────────────
  const showNewPosts = () => {
    setPosts(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      return [...pendingNewPosts.filter(p => !existingIds.has(p.id)), ...prev];
    });
    setPendingNewPosts([]);
    setNewPostsAvailable(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Double-tap to like ───────────────────────────────────────────────
  const handlePostTap = (postId: string) => {
    const now = Date.now();
    const last = lastTapRef.current[postId] ?? 0;
    if (now - last < 350) {
      if (!likedPosts.has(postId)) toggleLike(postId);
      lastTapRef.current[postId] = 0;
    } else {
      lastTapRef.current[postId] = now;
    }
  };

  // ── Like ─────────────────────────────────────────────────────────────
  const toggleLike = async (postId: string) => {
    if (!currentUserId) return;

    const isLiked = likedPosts.has(postId);
    const currentPost = posts.find(p => p.id === postId);
    const newCount = Math.max(0, (currentPost?.likes_count ?? 0) + (isLiked ? -1 : 1));

    // Optimistic update immediately
    setLikedPosts(prev => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newCount } : p));

    if (isLiked) {
      await supabase.from('likes').delete().eq('user_id', currentUserId).eq('post_id', postId);
    } else {
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: postId });
      if (currentPost && currentPost.user_id !== currentUserId) {
        supabase.from('notifications').insert({
          user_id: currentPost.user_id,
          actor_id: currentUserId,
          type: 'like',
          post_id: postId,
        });
      }
    }
    await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
  };

  // ── Comments ─────────────────────────────────────────────────────────
  const toggleComments = async (postId: string) => {
    const isExpanded = expandedComments.has(postId);
    setExpandedComments(prev => {
      const next = new Set(prev);
      isExpanded ? next.delete(postId) : next.add(postId);
      return next;
    });

    if (!isExpanded && !comments[postId]) {
      setCommentLoading(prev => new Set(prev).add(postId));
      const { data } = await supabase
        .from('comments')
        .select(`*, profiles(id, full_name, username, avatar_url)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      setComments(prev => ({ ...prev, [postId]: (data as Comment[]) ?? [] }));
      setCommentLoading(prev => { const next = new Set(prev); next.delete(postId); return next; });
    }
  };

  const submitComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content || !currentUserId || commentSubmitting.has(postId)) return;

    setCommentSubmitting(prev => new Set(prev).add(postId));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    const currentPost = posts.find(p => p.id === postId);
    const newCount = (currentPost?.comments_count ?? 0) + 1;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: newCount } : p));

    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: currentUserId, post_id: postId, content })
      .select(`*, profiles(id, full_name, username, avatar_url)`)
      .single();

    if (!error && data) {
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), data as Comment] }));
      if (currentPost && currentPost.user_id !== currentUserId) {
        supabase.from('notifications').insert({
          user_id: currentPost.user_id,
          actor_id: currentUserId,
          type: 'comment',
          post_id: postId,
        });
      }
      await supabase.from('posts').update({ comments_count: newCount }).eq('id', postId);
    } else if (error) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: newCount - 1 } : p));
    }

    setCommentSubmitting(prev => { const next = new Set(prev); next.delete(postId); return next; });
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const deletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setMenuOpenPostId(null);
    await supabase.from('comments').delete().eq('post_id', postId);
    await supabase.from('likes').delete().eq('post_id', postId);
    await supabase.from('posts').delete().eq('id', postId);
    toast({ title: 'Post deleted' });
  };

  const handleShare = (postId: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/post/${postId}`);
    toast({ title: 'Link copied!', description: 'Post link copied to clipboard.' });
  };

  const filtered = activeSport === 'All'
    ? posts
    : posts.filter(p => p.sport?.toLowerCase() === activeSport.toLowerCase());

  return (
    <div
      className="min-h-screen pt-14 pb-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullY > 0 || isPulling) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isPulling ? 48 : pullY, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <RefreshCw className={`h-5 w-5 text-primary ${isPulling ? 'animate-spin' : ''}`} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-4">
        <h1 className="text-2xl mb-4">FEED</h1>

        {/* "New posts" pill */}
        <AnimatePresence>
          {newPostsAvailable && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center mb-3"
            >
              <button
                onClick={showNewPosts}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg active:scale-[0.96] transition-transform"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                New posts — tap to load
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stories bar */}
        {(currentUserProfile || storyProfiles.length > 0) && (
          <div className="flex gap-3 overflow-x-auto pb-3 mb-4 scrollbar-none -mx-4 px-4">
            {currentUserProfile && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div className="relative h-14 w-14">
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-border">
                    {currentUserProfile.avatar_url ? (
                      <img src={currentUserProfile.avatar_url} alt="You" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {getInitials(currentUserProfile.full_name ?? currentUserProfile.username ?? 'Me')}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                    <Plus className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground w-14 truncate text-center">You</span>
              </button>
            )}

            {storyProfiles.map(p => {
              const isViewed = viewedStories.has(p.id);
              const name = p.full_name ?? p.username ?? 'User';
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (!isViewed) {
                      const next = new Set(viewedStories);
                      next.add(p.id);
                      setViewedStories(next);
                      localStorage.setItem('viewedStories', JSON.stringify([...next]));
                    }
                    navigate(`/profile/${p.id}`);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div
                    className="h-14 w-14 rounded-full p-[2px]"
                    style={{ background: isViewed ? 'hsl(var(--border))' : 'linear-gradient(135deg, hsl(var(--primary)), #fb923c)' }}
                  >
                    <div className="h-full w-full rounded-full overflow-hidden border-2 border-background">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                          {getInitials(name)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-14 truncate text-center">{name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Sport filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none -mx-4 px-4">
          {SPORT_FILTERS.map(s => (
            <Button
              key={s}
              variant={activeSport === s ? 'default' : 'outline'}
              size="sm"
              className={`shrink-0 min-h-[44px] rounded-full active:scale-[0.95] transition-transform ${activeSport === s ? 'bg-gradient-primary text-primary-foreground' : ''}`}
              onClick={() => setActiveSport(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            {activeSport === 'All' ? (
              <>
                <Users className="h-14 w-14 text-muted-foreground/20" />
                <p className="text-muted-foreground font-medium">Nothing here yet</p>
                <p className="text-sm text-muted-foreground/70">Follow athletes to see their posts here, or be the first to post.</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate('/search')}
                  >
                    Find athletes
                  </Button>
                  <Button
                    className="gap-2 bg-gradient-primary text-primary-foreground"
                    onClick={() => setModalOpen(true)}
                  >
                    <PenSquare className="h-4 w-4" /> Create Post
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No {activeSport} posts yet.</p>
            )}
          </div>
        )}

        {/* Posts */}
        {!loading && (
          <div className="space-y-3">
            {filtered.map((post, i) => {
              const profile = post.profiles;
              const userType = profile?.user_type ?? 'athlete';
              const displayName = profile?.full_name ?? profile?.username ?? 'Unknown';
              const isLiked = likedPosts.has(post.id);
              const isCommentsOpen = expandedComments.has(post.id);
              const isOwnPost = post.user_id === currentUserId;
              const isMenuOpen = menuOpenPostId === post.id;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 5) * 0.05 }}
                  className={`glass-card p-4 rounded-xl border-l-4 ${getTypeBorderColor(userType)} relative`}
                  onTouchEnd={() => handlePostTap(post.id)}
                >
                  {/* Top-right: badge + three-dot menu */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {isOwnPost && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenPostId(isMenuOpen ? null : post.id)}
                          className="flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpenPostId(null)} />
                            <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                              <button
                                onClick={() => deletePost(post.id)}
                                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />Delete Post
                              </button>
                              <button
                                onClick={() => setMenuOpenPostId(null)}
                                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-secondary transition-colors border-t border-border"
                              >
                                <X className="h-4 w-4" />Cancel
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getTypeBadgeStyle(userType)}`}>
                      {userType}
                    </span>
                  </div>

                  {/* Clickable author row */}
                  <button
                    className="flex items-start gap-3 w-full pr-20 text-left active:opacity-70 transition-opacity"
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={displayName} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                        {getInitials(displayName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-base">{displayName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {post.sport && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{post.sport}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </button>

                  {/* Post body */}
                  <div className="mt-3">
                    <p className="text-sm leading-relaxed">{post.content}</p>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post"
                        onClick={(e) => { e.stopPropagation(); setViewingImage(post.image_url!); }}
                        className="mt-3 rounded-lg w-full max-h-80 object-cover cursor-pointer"
                      />
                    )}
                    {post.video_url && (
                      <video
                        src={post.video_url}
                        controls
                        playsInline
                        className="mt-3 rounded-lg w-full max-h-80 bg-black"
                      />
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-6 mt-4 text-muted-foreground">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }}
                        className={`flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] justify-center transition-all active:scale-[0.9] ${isLiked ? 'text-primary' : 'hover:text-foreground'}`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-primary' : ''}`} />
                        {post.likes_count ?? 0}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleComments(post.id); }}
                        className={`flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] justify-center active:scale-[0.9] transition-all hover:text-foreground ${isCommentsOpen ? 'text-primary' : ''}`}
                      >
                        <MessageCircle className={`h-4 w-4 ${isCommentsOpen ? 'fill-primary/20' : ''}`} />
                        {post.comments_count ?? 0}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShare(post.id); }}
                        className="flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] justify-center active:scale-[0.9] active:text-primary transition-all hover:text-foreground"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Comments section */}
                    {isCommentsOpen && (
                      <div className="mt-3 pt-3 border-t border-border space-y-3">
                        {commentLoading.has(post.id) ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <>
                            {(comments[post.id] ?? []).length === 0 && (
                              <p className="text-xs text-muted-foreground text-center">No comments yet.</p>
                            )}
                            {(comments[post.id] ?? []).map(comment => {
                              const name = comment.profiles?.full_name ?? comment.profiles?.username ?? 'Unknown';
                              return (
                                <div key={comment.id} className="flex gap-2 items-start">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                                    {getInitials(name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground">{name}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{comment.content}</p>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="Add a comment..."
                                value={commentInputs[post.id] ?? ''}
                                onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                                className="bg-secondary border-border text-foreground text-xs h-9 flex-1"
                              />
                              <Button
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => submitComment(post.id)}
                                disabled={!commentInputs[post.id]?.trim() || commentSubmitting.has(post.id)}
                              >
                                {commentSubmitting.has(post.id)
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <Send className="h-3 w-3" />}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!hasMore && filtered.length > 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">You're all caught up!</p>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      {!loading && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-[0.93] transition-transform"
        >
          <PenSquare className="h-6 w-6" />
        </button>
      )}

      <CreatePostModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onPostCreated={(newPost) => setPosts(prev => [newPost as unknown as Post, ...prev])}
      />

      {/* Full-screen image viewer */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setViewingImage(null)}
        >
          <img src={viewingImage} className="max-w-full max-h-full object-contain" />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={() => setViewingImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
