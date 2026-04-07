import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getInitials, getTypeBadgeStyle, getTypeBorderColor } from '@/lib/mock-data';
import {
  CheckCircle, MapPin, Calendar, UserPlus, UserMinus,
  MessageSquare, Share2, ArrowLeft, Loader2, Camera, Film, FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import PostDetailModal, { PostForModal } from '@/components/PostDetailModal';

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  sport: string | null;
  position: string | null;
  school: string | null;
  grad_year: number | null;
  height: string | null;
  weight: string | null;
  user_type: string | null;
  is_verified: boolean | null;
  followers_count: number | null;
  following_count: number | null;
  avatar_url: string | null;
  cover_url: string | null;
}

interface GridPost {
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

function ProfileSkeleton() {
  return (
    <div className="min-h-screen pt-14 pb-20 animate-pulse">
      <div className="w-full h-[160px] bg-secondary" />
      <div className="px-4 pt-14 space-y-3">
        <div className="h-7 bg-secondary rounded w-1/2" />
        <div className="h-4 bg-secondary rounded w-1/3" />
        <div className="flex gap-6 mt-3">
          <div className="h-5 bg-secondary rounded w-16" />
          <div className="h-5 bg-secondary rounded w-16" />
          <div className="h-5 bg-secondary rounded w-12" />
        </div>
        <div className="h-10 bg-secondary rounded mt-4" />
        <div className="h-24 bg-secondary rounded mt-4" />
        <div className="grid grid-cols-3 gap-0.5 mt-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square bg-secondary" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfileView() {
  const { id: profileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<GridPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  // Post modal
  const [selectedPost, setSelectedPost] = useState<PostForModal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const targetId = profileId ?? user.id;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (profileError || !profileData) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setCoverUrl(profileData.cover_url ?? null);
      setCurrentUserId(user.id);
      const ownProfile = user.id === targetId;
      setIsOwnProfile(ownProfile);

      const [
        { count: fersCount },
        { count: fingCount },
        { data: postsData },
      ] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetId),
        supabase
          .from('posts')
          .select('id, user_id, content, sport, image_url, video_url, created_at, likes_count, comments_count, profiles(id, full_name, username, avatar_url, user_type)')
          .eq('user_id', targetId)
          .order('created_at', { ascending: false }),
      ]);

      setFollowersCount(fersCount ?? 0);
      setFollowingCount(fingCount ?? 0);
      setPosts((postsData as unknown as GridPost[]) ?? []);

      if (!ownProfile) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetId)
          .single();
        setIsFollowing(!!followData);
      }

      setLoading(false);
    };

    loadProfile();
  }, [profileId, navigate]);

  const toggleFollow = async () => {
    if (!currentUserId || !profile || isFollowLoading) return;
    setIsFollowLoading(true);

    const targetId = profile.id;
    const nowFollowing = !isFollowing;

    setIsFollowing(nowFollowing);
    setFollowersCount(prev => prev + (nowFollowing ? 1 : -1));

    if (nowFollowing) {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetId });
      supabase.from('notifications').insert({
        user_id: targetId,
        actor_id: currentUserId,
        type: 'follow',
        post_id: null,
      });
    } else {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetId);
    }

    toast({
      title: nowFollowing ? 'Following!' : 'Unfollowed',
      description: nowFollowing
        ? `You are now following ${profile.full_name ?? 'this user'}`
        : `You unfollowed ${profile.full_name ?? 'this user'}`,
    });

    setIsFollowLoading(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast({ title: 'Link copied!', description: 'Profile link copied to clipboard.' });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Please choose an image under 5MB.', variant: 'destructive' });
      return;
    }

    setIsCoverUploading(true);
    const ext = file.name.split('.').pop();
    const path = `cover_${currentUserId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('Avatar')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setIsCoverUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('Avatar').getPublicUrl(path);

    await supabase.from('profiles').update({ cover_url: publicUrl }).eq('id', currentUserId);
    setCoverUrl(publicUrl);
    toast({ title: 'Cover photo updated!' });
    setIsCoverUploading(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const openPost = (post: GridPost) => {
    setSelectedPost(post as PostForModal);
    setModalOpen(true);
  };

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-14 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error ?? 'Profile not found.'}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const userType = profile.user_type ?? 'athlete';
  const isAthlete = userType === 'athlete';
  const isCoach = userType === 'coach';

  const borderColor =
    userType === 'athlete'
      ? 'hsl(var(--type-athlete))'
      : userType === 'coach'
      ? 'hsl(var(--type-coach))'
      : 'hsl(var(--type-recruiter))';

  const displayName = profile.full_name ?? profile.username ?? 'Unknown';

  return (
    <div className="min-h-screen pt-14 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="fixed top-16 left-3 z-40 flex items-center justify-center h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-border active:scale-[0.9] transition-transform"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>

        {/* Cover photo */}
        <div className="w-full h-[160px] relative overflow-visible">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-primary" />
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: borderColor }} />

          {/* Cover upload button — own profile only */}
          {isOwnProfile && (
            <>
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={isCoverUploading}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur border border-border text-xs text-foreground active:scale-[0.95] transition-transform"
              >
                {isCoverUploading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Camera className="h-3.5 w-3.5" />
                }
                {isCoverUploading ? 'Uploading…' : 'Edit cover'}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </>
          )}

          {/* Avatar */}
          <div
            className="absolute -bottom-10 left-4 flex h-20 w-20 items-center justify-center rounded-full bg-card text-2xl font-bold text-foreground border-4 border-background overflow-hidden"
            style={{ boxShadow: `0 0 0 2px ${borderColor}` }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              getInitials(displayName)
            )}
          </div>
        </div>

        <div className="px-4 pt-14">
          {/* Name + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl">{displayName}</h1>
            {profile.is_verified && <CheckCircle className="h-5 w-5 text-verified" />}
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getTypeBadgeStyle(userType)}`}>
              {userType}
            </span>
          </div>

          {/* Sub-line */}
          {isAthlete && (profile.position || profile.sport) && (
            <p className="text-primary font-semibold mt-1 text-sm">
              {[profile.position, profile.sport].filter(Boolean).join(' · ')}
            </p>
          )}
          {isCoach && <p className="text-type-coach font-semibold mt-1 text-sm">Coach</p>}
          {userType === 'recruiter' && <p className="text-type-recruiter font-semibold mt-1 text-sm">Recruiter</p>}

          {/* Meta */}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />{profile.location}
              </span>
            )}
            {isAthlete && profile.grad_year && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />Class of {profile.grad_year}
              </span>
            )}
          </div>

          {/* Stats row: Posts · Followers · Following */}
          <div className="flex gap-6 mt-3 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{posts.length}</div>
              <div className="text-[11px] text-muted-foreground">posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{followersCount.toLocaleString()}</div>
              <div className="text-[11px] text-muted-foreground">followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{followingCount.toLocaleString()}</div>
              <div className="text-[11px] text-muted-foreground">following</div>
            </div>
          </div>

          {/* Action buttons */}
          {!isOwnProfile && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={toggleFollow}
                disabled={isFollowLoading}
                className={`flex-1 min-h-[44px] gap-2 active:scale-[0.97] transition-transform ${
                  isFollowing
                    ? 'bg-secondary text-foreground hover:bg-secondary/80'
                    : 'bg-gradient-primary text-primary-foreground'
                }`}
              >
                {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-h-[44px] gap-2 active:scale-[0.97] transition-transform"
                onClick={() => navigate('/messages', { state: { openConversationWith: profileId } })}
              >
                <MessageSquare className="h-4 w-4" />Message
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] active:scale-[0.9] transition-transform"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isOwnProfile && (
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => navigate('/profile/setup')}
              >
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] active:scale-[0.9] transition-transform"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className={`glass-card p-4 rounded-xl mt-4 border-l-4 ${getTypeBorderColor(userType)}`}>
              <h2 className="text-lg mb-2">ABOUT</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">{profile.bio}</p>
            </div>
          )}

          {/* Measurements */}
          {isAthlete && (profile.height || profile.weight) && (
            <div className={`glass-card p-4 rounded-xl mt-3 border-l-4 ${getTypeBorderColor(userType)}`}>
              <h2 className="text-lg mb-2">MEASUREMENTS</h2>
              <div className="grid grid-cols-2 gap-3">
                {profile.height && (
                  <div className="rounded-lg bg-secondary p-3 text-center">
                    <div className="text-xl text-primary font-semibold">{profile.height}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 uppercase">Height</div>
                  </div>
                )}
                {profile.weight && (
                  <div className="rounded-lg bg-secondary p-3 text-center">
                    <div className="text-xl text-primary font-semibold">{profile.weight}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 uppercase">Weight</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* School */}
          {isAthlete && profile.school && (
            <div className={`glass-card p-4 rounded-xl mt-3 border-l-4 ${getTypeBorderColor(userType)}`}>
              <h2 className="text-lg mb-2">SCHOOL</h2>
              <p className="font-medium text-sm">{profile.school}</p>
              {profile.grad_year && (
                <p className="text-sm text-muted-foreground">Class of {profile.grad_year}</p>
              )}
            </div>
          )}
        </div>

        {/* Posts grid — full-width, no side padding */}
        {posts.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg px-4 mb-2">POSTS</h2>
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map(post => (
                <button
                  key={post.id}
                  onClick={() => openPost(post)}
                  className="aspect-square relative overflow-hidden bg-secondary active:opacity-80 transition-opacity"
                >
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : post.video_url ? (
                    <>
                      <video
                        src={post.video_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      {/* Video badge */}
                      <div className="absolute top-1.5 right-1.5 bg-black/60 rounded p-0.5">
                        <Film className="h-3 w-3 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 bg-card">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-4">
                        {post.content}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-muted-foreground text-sm">No posts yet.</p>
          </div>
        )}
      </motion.div>

      <PostDetailModal
        post={selectedPost}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedPost(null); }}
        currentUserId={currentUserId}
      />
    </div>
  );
}
