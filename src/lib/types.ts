export type UserType = 'athlete' | 'coach' | 'recruiter';

export interface UserProfile {
  id: string;
  name: string;
  type: UserType;
  avatar: string;
  location: string;
  bio: string;
  isVerified: boolean;
  isPublic: boolean;
  followers: number;
  following: number;
  sport: string;
  createdAt: string;
}

export interface AthleteProfile extends UserProfile {
  type: 'athlete';
  position: string;
  school: string;
  graduationYear: number;
  height: string;
  weight: string;
  stats: Record<string, string | number>;
  highlights: string[];
  teammates: string[];
}

export interface CoachProfile extends UserProfile {
  type: 'coach';
  organization: string;
  sportsOffered: string[];
  title: string;
}

export interface RecruiterProfile extends UserProfile {
  type: 'recruiter';
  organization: string;
  credentials: string;
  savedAthletes: string[];
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userType: UserType;
  isVerified: boolean;
  content: string;
  sport: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  type: 'tryout' | 'camp' | 'recruiting';
  sport: string;
  location: string;
  date: string;
  organizerName: string;
}
