import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getInitials, getTypeBorderColor, getTypeBadgeStyle, timeAgo } from '@/lib/mock-data';
import { Heart, MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface PostForModal {
  id: string;
  user_id: string;
  content: string;
  sport: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    user_type: string | null;
  } | null;
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

interface PostDetailModalProps {
  post: PostForModal | null;
  open: boolean;
  onClose: () => void;
  currentUserId: string | null;
}

export default function PostDetailModal({ post, open, onClose, currentUserId }: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!post || !open) return;
    setLocalLikes(post.likes_count ?? 0);
    setComments([]);

    const load = async () => {
      setCommentsLoading(true);

      if (currentUserId) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', currentUserId)
          .eq('post_id', post.id)
          .single();
        setIsLiked(!!likeData);
      }

      const { data } = await supabase
        .from('comments')
        .select('*, profiles(id, full_name, username, avatar_url)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      setComments((data as Comment[]) ?? []);
      setCommentsLoading(false);
    };

    load();
  }, [post?.id, open]);

  const toggleLike = async () => {
    if (!currentUserId || !post) return;
    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    setLocalLikes(prev => Math.max(0, prev + (nowLiked ? 1 : -1)));

    if (nowLiked) {
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: post.id });
    } else {
      await supabase.from('likes').delete().eq('user_id', currentUserId).eq('post_id', post.id);
    }
    await supabase.from('posts').update({ likes_count: localLikes + (nowLiked ? 1 : -1) }).eq('id', post.id);
  };

  const submitComment = async () => {
    const content = commentInput.trim();
    if (!content || !currentUserId || !post || isSubmitting) return;
    setIsSubmitting(true);
    setCommentInput('');

    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: currentUserId, post_id: post.id, content })
      .select('*, profiles(id, full_name, username, avatar_url)')
      .single();

    if (!error && data) {
      setComments(prev => [...prev, data as Comment]);
      await supabase.from('posts').update({ comments_count: (post.comments_count ?? 0) + 1 }).eq('id', post.id);
    }
    setIsSubmitting(false);
  };

  if (!post) return null;

  const profile = post.profiles;
  const userType = profile?.user_type ?? 'athlete';
  const displayName = profile?.full_name ?? profile?.username ?? 'Unknown';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-border border-l-4 ${getTypeBorderColor(userType)}`}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} className="h-10 w-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
              {getInitials(displayName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <div className="flex items-center gap-2">
              {post.sport && <Badge variant="outline" className="text-[10px] px-1 py-0">{post.sport}</Badge>}
              <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getTypeBadgeStyle(userType)}`}>
            {userType}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Content */}
          <div className="p-4">
            <p className="text-sm leading-relaxed text-foreground">{post.content}</p>
          </div>

          {/* Image */}
          {post.image_url && (
            <img src={post.image_url} alt="Post" className="w-full max-h-72 object-cover" />
          )}

          {/* Video */}
          {post.video_url && (
            <video
              src={post.video_url}
              controls
              className="w-full max-h-72 bg-black"
              playsInline
            />
          )}

          {/* Like / comment counts */}
          <div className="flex items-center gap-5 px-4 py-3 border-b border-border text-muted-foreground">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${isLiked ? 'text-primary' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-primary' : ''}`} />
              {localLikes}
            </button>
            <span className="flex items-center gap-1.5 text-xs">
              <MessageCircle className="h-4 w-4" />
              {comments.length}
            </span>
          </div>

          {/* Comments */}
          <div className="px-4 py-3 space-y-3">
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {comments.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No comments yet.</p>
                )}
                {comments.map(c => {
                  const name = c.profiles?.full_name ?? c.profiles?.username ?? 'Unknown';
                  return (
                    <div key={c.id} className="flex gap-2 items-start">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                        {getInitials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Comment input */}
        {currentUserId && (
          <div className="flex gap-2 p-3 border-t border-border">
            <Input
              placeholder="Add a comment..."
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              className="bg-secondary border-border text-foreground text-xs h-9 flex-1"
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={submitComment}
              disabled={!commentInput.trim() || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
