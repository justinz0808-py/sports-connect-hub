import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInitials, getTypeBadgeStyle, getTypeBorderColor } from '@/lib/mock-data';
import { CheckCircle, MapPin, Calendar, UserPlus, UserMinus, MessageSquare, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number | null;
  comments_count: number | null;
}

export default function ProfileView() {
  const { id: profileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

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
      setIsOwnProfile(user.id === targetId);

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });

      setPosts(postsData ?? []);
      setLoading(false);
    };

    loadProfile();
  }, [profileId, navigate]);

  const toggleFollow = () => {
    setIsFollowing(prev => !prev);
    toast({
      title: isFollowing ? 'Unfollowed' : 'Following!',
      description: isFollowing
        ? `You unfollowed ${profile?.full_name ?? 'this user'}`
        : `You are now following ${profile?.full_name ?? 'this user'}`,
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast({ title: 'Link copied!', description: 'Profile link copied to clipboard.' });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
  const followers = (profile.followers_count ?? 0) + (isFollowing ? 1 : 0);
  const following = profile.following_count ?? 0;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen pt-14 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="fixed top-16 left-3 z-40 flex items-center justify-center h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-border active:scale-[0.9] transition-transform"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>

        {/* Cover */}
        <div className="w-full h-[160px] bg-gradient-primary relative">
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: borderColor }} />
          <div
            className="absolute -bottom-10 left-4 flex h-20 w-20 items-center justify-center rounded-full bg-card text-2xl font-bold text-foreground border-4 border-background"
            style={{ boxShadow: `0 0 0 2px ${borderColor}` }}
          >
            {getInitials(displayName)}
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
          {isCoach && (
            <p className="text-type-coach font-semibold mt-1 text-sm">Coach</p>
          )}
          {userType === 'recruiter' && (
            <p className="text-type-recruiter font-semibold mt-1 text-sm">Recruiter</p>
          )}

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

          {/* Follower counts */}
          <div className="flex gap-6 mt-3 text-sm">
            <span>
              <strong className="text-foreground text-lg">{followers.toLocaleString()}</strong>{' '}
              <span className="text-muted-foreground">followers</span>
            </span>
            <span>
              <strong className="text-foreground text-lg">{following.toLocaleString()}</strong>{' '}
              <span className="text-muted-foreground">following</span>
            </span>
          </div>

          {/* Action buttons */}
          {!isOwnProfile && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={toggleFollow}
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
                onClick={() => navigate('/messages')}
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

          {/* Posts */}
          {posts.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg mb-3">POSTS</h2>
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`glass-card p-4 rounded-xl border-l-4 ${getTypeBorderColor(userType)}`}
                  >
                    <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{timeAgo(post.created_at)}</span>
                      {post.likes_count != null && <span>{post.likes_count} likes</span>}
                      {post.comments_count != null && <span>{post.comments_count} comments</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
