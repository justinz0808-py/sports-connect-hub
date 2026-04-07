import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInitials, getTypeBorderColor, getTypeBadgeStyle, timeAgo } from '@/lib/mock-data';
import { Heart, MessageCircle, Share2, PenSquare, Loader2, Send, MoreHorizontal, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import CreatePostModal from '@/components/CreatePostModal';

const SPORT_FILTERS = ['All', 'Basketball', 'Football', 'Soccer', 'Baseball', 'Track & Field', 'Volleyball', 'Swimming', 'Tennis', 'Golf', 'Lacrosse', 'Wrestling', 'Other'];

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
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: PostProfile | null;
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
  const [activeSport, setActiveSport] = useState('All');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentLoading, setCommentLoading] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Set<string>>(new Set());
  const [menuOpenPostId, setMenuOpenPostId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          full_name,
          username,
          avatar_url,
          user_type,
          sport
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    setPosts((data as Post[]) ?? []);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (likes) {
          setLikedPosts(new Set(likes.map((l: { post_id: string }) => l.post_id)));
        }
      }

      await fetchPosts();
      setLoading(false);
    };

    init();
  }, [fetchPosts]);

  const toggleLike = async (postId: string) => {
    if (!currentUserId) return;

    const isLiked = likedPosts.has(postId);
    const currentPost = posts.find(p => p.id === postId);
    const newCount = Math.max(0, (currentPost?.likes_count ?? 0) + (isLiked ? -1 : 1));

    // Await both DB ops before updating local state so the count is persisted
    // NOTE: if likes_count doesn't persist, run this SQL in Supabase:
    // CREATE POLICY "Users can update post counts"
    // ON posts FOR UPDATE
    // USING (true)
    // WITH CHECK (true);
    if (isLiked) {
      await supabase.from('likes').delete().eq('user_id', currentUserId).eq('post_id', postId);
    } else {
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: postId });
    }
    const { error: likeUpdateError } = await supabase
      .from('posts')
      .update({ likes_count: newCount })
      .eq('id', postId);
    console.log('like update error:', likeUpdateError);

    // Refetch the post to sync true count from DB
    const { data: refreshed } = await supabase
      .from('posts')
      .select('likes_count, comments_count')
      .eq('id', postId)
      .single();

    // Update local state with confirmed DB values
    setLikedPosts(prev => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts(prev =>
      prev.map(p => p.id === postId
        ? { ...p, likes_count: refreshed?.likes_count ?? newCount, comments_count: refreshed?.comments_count ?? p.comments_count }
        : p
      )
    );
  };

  const toggleComments = async (postId: string) => {
    const isExpanded = expandedComments.has(postId);

    setExpandedComments(prev => {
      const next = new Set(prev);
      isExpanded ? next.delete(postId) : next.add(postId);
      return next;
    });

    // Only fetch if expanding and not yet loaded
    if (!isExpanded && !comments[postId]) {
      setCommentLoading(prev => new Set(prev).add(postId));

      const { data } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (id, full_name, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      setComments(prev => ({ ...prev, [postId]: (data as Comment[]) ?? [] }));
      setCommentLoading(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const submitComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content || !currentUserId || commentSubmitting.has(postId)) return;

    setCommentSubmitting(prev => new Set(prev).add(postId));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    // Capture count before optimistic update
    const currentPost = posts.find(p => p.id === postId);
    const newCount = (currentPost?.comments_count ?? 0) + 1;

    // Optimistic comment count increment
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, comments_count: newCount } : p)
    );

    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: currentUserId, post_id: postId, content })
      .select(`*, profiles (id, full_name, username, avatar_url)`)
      .single();

    if (!error && data) {
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), data as Comment],
      }));
      // Persist count to DB so it survives refresh
      // NOTE: if comments_count doesn't persist, run this SQL in Supabase:
      // CREATE POLICY "Users can update post counts"
      // ON posts FOR UPDATE
      // USING (true)
      // WITH CHECK (true);
      const { error: commentUpdateError } = await supabase
        .from('posts')
        .update({ comments_count: newCount })
        .eq('id', postId);
      console.log('comment count update error:', commentUpdateError);

      // Refetch the post to sync true count from DB
      const { data: refreshed } = await supabase
        .from('posts')
        .select('likes_count, comments_count')
        .eq('id', postId)
        .single();
      if (refreshed) {
        setPosts(prev =>
          prev.map(p => p.id === postId
            ? { ...p, likes_count: refreshed.likes_count, comments_count: refreshed.comments_count }
            : p
          )
        );
      }
    } else if (error) {
      // Revert optimistic update on failure
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, comments_count: newCount - 1 } : p)
      );
    }

    setCommentSubmitting(prev => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
  };

  const deletePost = async (postId: string) => {
    // Optimistic removal from local state
    setPosts(prev => prev.filter(p => p.id !== postId));
    setMenuOpenPostId(null);

    // Delete dependents first, then the post
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
    <div className="min-h-screen pt-14 pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-2xl mb-4">FEED</h1>

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
            <p className="text-muted-foreground">
              {activeSport === 'All'
                ? 'No posts yet. Be the first to post!'
                : `No ${activeSport} posts yet.`}
            </p>
            {activeSport === 'All' && (
              <Button
                className="gap-2 bg-gradient-primary text-primary-foreground"
                onClick={() => setModalOpen(true)}
              >
                <PenSquare className="h-4 w-4" /> Create Post
              </Button>
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
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-4 rounded-xl border-l-4 ${getTypeBorderColor(userType)} relative`}
                >
                  {/* Top-right: badge + optional three-dot menu */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {isOwnPost && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenPostId(isMenuOpen ? null : post.id)}
                          className="flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Dropdown menu */}
                        {isMenuOpen && (
                          <>
                            {/* Backdrop to close on outside click */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMenuOpenPostId(null)}
                            />
                            <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                              <button
                                onClick={() => deletePost(post.id)}
                                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Post
                              </button>
                              <button
                                onClick={() => setMenuOpenPostId(null)}
                                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-secondary transition-colors border-t border-border"
                              >
                                <X className="h-4 w-4" />
                                Cancel
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

                  <div className="flex items-start gap-3">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                        {getInitials(displayName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap pr-20">
                        <span className="text-base">{displayName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {post.sport && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{post.sport}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed">{post.content}</p>

                      {/* Post image */}
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Post image"
                          onClick={() => setViewingImage(post.image_url)}
                          className="mt-3 rounded-lg w-full max-h-80 object-cover cursor-pointer"
                        />
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-6 mt-4 text-muted-foreground">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] justify-center transition-all active:scale-[0.9] ${isLiked ? 'text-primary' : 'hover:text-foreground'}`}
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? 'fill-primary' : ''}`} />
                          {post.likes_count ?? 0}
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] justify-center active:scale-[0.9] transition-all hover:text-foreground ${isCommentsOpen ? 'text-primary' : ''}`}
                        >
                          <MessageCircle className={`h-4 w-4 ${isCommentsOpen ? 'fill-primary/20' : ''}`} />
                          {post.comments_count ?? 0}
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
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
                                    : <Send className="h-3 w-3" />
                                  }
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
        onPostCreated={fetchPosts}
      />

      {/* Full-screen image viewer */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setViewingImage(null)}
        >
          <img
            src={viewingImage}
            className="max-w-full max-h-full object-contain"
          />
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
