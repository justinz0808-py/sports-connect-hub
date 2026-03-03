import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { allProfiles, getInitials, getTypeColor, athletes, coaches, recruiters } from '@/lib/mock-data';
import { AthleteProfile, CoachProfile, RecruiterProfile } from '@/lib/types';
import { CheckCircle, MapPin, Calendar, Users, UserPlus, MessageSquare, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const profile = allProfiles.find(p => p.id === id);

  if (!profile) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  const isAthlete = profile.type === 'athlete';
  const isCoach = profile.type === 'coach';
  const isRecruiter = profile.type === 'recruiter';

  const athlete = isAthlete ? (profile as AthleteProfile) : null;
  const coach = isCoach ? (profile as CoachProfile) : null;
  const recruiter = isRecruiter ? (profile as RecruiterProfile) : null;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="glass-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground font-display">
                {getInitials(profile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
                  {profile.isVerified && <CheckCircle className="h-5 w-5 text-verified" />}
                  <Badge className={getTypeColor(profile.type) + ' capitalize text-xs'}>{profile.type}</Badge>
                </div>
                {athlete && (
                  <p className="text-primary font-semibold mt-1">{athlete.position} · {athlete.sport}</p>
                )}
                {coach && (
                  <p className="text-accent font-semibold mt-1">{coach.title} · {coach.organization}</p>
                )}
                {recruiter && (
                  <p className="text-success font-semibold mt-1">{recruiter.organization}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>
                  {athlete && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Class of {athlete.graduationYear}</span>}
                </div>
                <div className="flex gap-6 mt-3 text-sm">
                  <span><strong className="text-foreground">{profile.followers.toLocaleString()}</strong> <span className="text-muted-foreground">followers</span></span>
                  <span><strong className="text-foreground">{profile.following.toLocaleString()}</strong> <span className="text-muted-foreground">following</span></span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 flex-wrap">
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 gap-2"><UserPlus className="h-4 w-4" />Follow</Button>
              <Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" />Message</Button>
              <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Bio */}
          <div className="glass-card p-6 mt-4">
            <h2 className="font-display text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
          </div>

          {/* Athlete Stats */}
          {athlete && (
            <div className="glass-card p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Key Stats</h2>
                <div className="text-sm text-muted-foreground">{athlete.height} · {athlete.weight}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(athlete.stats).map(([key, val]) => (
                  <div key={key} className="rounded-lg bg-secondary p-4 text-center">
                    <div className="stat-highlight">{val}</div>
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coach details */}
          {coach && (
            <div className="glass-card p-6 mt-4">
              <h2 className="font-display text-lg font-semibold mb-3">Program Details</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Organization:</span> <span className="font-medium">{coach.organization}</span></p>
                <p><span className="text-muted-foreground">Sports:</span> <span className="font-medium">{coach.sportsOffered.join(', ')}</span></p>
              </div>
            </div>
          )}

          {/* Recruiter details */}
          {recruiter && (
            <div className="glass-card p-6 mt-4">
              <h2 className="font-display text-lg font-semibold mb-3">Credentials</h2>
              <p className="text-sm text-muted-foreground">{recruiter.credentials}</p>
            </div>
          )}

          {/* Athlete school info */}
          {athlete && (
            <div className="glass-card p-6 mt-4">
              <h2 className="font-display text-lg font-semibold mb-3">School</h2>
              <p className="font-medium">{athlete.school}</p>
              <p className="text-sm text-muted-foreground">Class of {athlete.graduationYear}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
