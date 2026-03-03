import { AthleteProfile, CoachProfile, RecruiterProfile, FeedPost, Event } from './types';

export const athletes: AthleteProfile[] = [
  {
    id: 'a1', name: 'Marcus Thompson', type: 'athlete', avatar: '', location: 'Houston, TX',
    bio: 'Point guard with a vision. State champion 2025. Committed to excellence on and off the court.',
    isVerified: true, isPublic: true, followers: 1240, following: 380, sport: 'Basketball',
    position: 'Point Guard', school: 'Westfield High', graduationYear: 2026,
    height: "6'1\"", weight: '175 lbs',
    stats: { PPG: 22.4, APG: 8.1, SPG: 2.3, 'FG%': '48.2%', '3P%': '38.7%' },
    highlights: ['https://youtube.com/watch?v=example1'], teammates: ['a2'], createdAt: '2025-09-01'
  },
  {
    id: 'a2', name: 'Jaylen Carter', type: 'athlete', avatar: '', location: 'Atlanta, GA',
    bio: 'Wide receiver. Speed kills. 4.38 40-yard dash. D1 bound.',
    isVerified: true, isPublic: true, followers: 890, following: 210, sport: 'Football',
    position: 'Wide Receiver', school: 'North Atlanta HS', graduationYear: 2026,
    height: "6'2\"", weight: '190 lbs',
    stats: { Receptions: 68, Yards: 1245, TDs: 14, 'YPC': 18.3 },
    highlights: [], teammates: [], createdAt: '2025-08-15'
  },
  {
    id: 'a3', name: 'Sofia Rodriguez', type: 'athlete', avatar: '', location: 'Miami, FL',
    bio: 'Midfielder. Captain. 3x All-State. Building a legacy one goal at a time.',
    isVerified: true, isPublic: true, followers: 2100, following: 450, sport: 'Soccer',
    position: 'Midfielder', school: 'Coral Gables Senior High', graduationYear: 2025,
    height: "5'7\"", weight: '135 lbs',
    stats: { Goals: 34, Assists: 22, 'Minutes Played': 2800, 'Pass Accuracy': '87%' },
    highlights: [], teammates: ['a5'], createdAt: '2025-07-20'
  },
  {
    id: 'a4', name: 'Tyler Brooks', type: 'athlete', avatar: '', location: 'Portland, OR',
    bio: 'Pitcher. Throwing heat since day one. Low 90s fastball, filthy slider.',
    isVerified: false, isPublic: true, followers: 560, following: 180, sport: 'Baseball',
    position: 'Pitcher', school: 'Lincoln High School', graduationYear: 2027,
    height: "6'3\"", weight: '200 lbs',
    stats: { ERA: 1.85, 'K/9': 11.2, WHIP: 0.95, Wins: 9 },
    highlights: [], teammates: [], createdAt: '2025-10-01'
  },
  {
    id: 'a5', name: 'Aisha Johnson', type: 'athlete', avatar: '', location: 'Chicago, IL',
    bio: 'Sprinter & long jumper. State record holder. Chasing national titles.',
    isVerified: true, isPublic: true, followers: 3200, following: 600, sport: 'Track & Field',
    position: 'Sprinter / Long Jump', school: 'Whitney Young HS', graduationYear: 2025,
    height: "5'9\"", weight: '140 lbs',
    stats: { '100m': '11.21s', '200m': '22.89s', 'Long Jump': "19'8\"", 'State Titles': 4 },
    highlights: [], teammates: [], createdAt: '2025-06-10'
  },
  {
    id: 'a6', name: 'Kai Nakamura', type: 'athlete', avatar: '', location: 'San Diego, CA',
    bio: 'Libero with instincts. 450+ digs this season. Defense wins championships.',
    isVerified: false, isPublic: true, followers: 410, following: 150, sport: 'Volleyball',
    position: 'Libero', school: 'Torrey Pines HS', graduationYear: 2026,
    height: "5'10\"", weight: '165 lbs',
    stats: { Digs: 456, 'Digs/Set': 5.2, Aces: 34, 'Passing Avg': 2.4 },
    highlights: [], teammates: [], createdAt: '2025-09-15'
  },
  {
    id: 'a7', name: 'Destiny Williams', type: 'athlete', avatar: '', location: 'Dallas, TX',
    bio: 'Center. Dominant in the paint. Double-double machine.',
    isVerified: true, isPublic: true, followers: 1800, following: 320, sport: 'Basketball',
    position: 'Center', school: 'Duncanville HS', graduationYear: 2025,
    height: "6'4\"", weight: '195 lbs',
    stats: { PPG: 18.6, RPG: 12.3, BPG: 3.1, 'FG%': '56.8%' },
    highlights: [], teammates: [], createdAt: '2025-07-01'
  },
];

export const coaches: CoachProfile[] = [
  {
    id: 'c1', name: 'Coach David Park', type: 'coach', avatar: '', location: 'Austin, TX',
    bio: '15 years coaching varsity basketball. 3 state titles. Developing champions on and off the court.',
    isVerified: true, isPublic: true, followers: 4500, following: 800, sport: 'Basketball',
    organization: 'Westlake High School', sportsOffered: ['Basketball'], title: 'Head Varsity Coach',
    createdAt: '2025-01-15'
  },
  {
    id: 'c2', name: 'Maria Santos', type: 'coach', avatar: '', location: 'Orlando, FL',
    bio: 'Former D1 player turned coach. Building the next generation of elite soccer talent.',
    isVerified: true, isPublic: true, followers: 3200, following: 550, sport: 'Soccer',
    organization: 'Orlando City Youth Academy', sportsOffered: ['Soccer'], title: 'Director of Player Development',
    createdAt: '2025-02-20'
  },
  {
    id: 'c3', name: 'James Mitchell', type: 'coach', avatar: '', location: 'Nashville, TN',
    bio: 'Track & Field coach passionate about unlocking athletic potential. 20+ D1 athletes produced.',
    isVerified: true, isPublic: true, followers: 2100, following: 400, sport: 'Track & Field',
    organization: 'Brentwood Academy', sportsOffered: ['Track & Field', 'Cross Country'], title: 'Head Track Coach',
    createdAt: '2025-03-10'
  },
  {
    id: 'c4', name: 'Karen Liu', type: 'coach', avatar: '', location: 'Seattle, WA',
    bio: 'Volleyball coach with a focus on mental toughness and team chemistry.',
    isVerified: false, isPublic: true, followers: 980, following: 200, sport: 'Volleyball',
    organization: 'Pacific Northwest Volleyball Club', sportsOffered: ['Volleyball'], title: 'Head Coach',
    createdAt: '2025-04-05'
  },
];

export const recruiters: RecruiterProfile[] = [
  {
    id: 'r1', name: 'Sarah Chen', type: 'recruiter', avatar: '', location: 'Los Angeles, CA',
    bio: 'Division I recruiting coordinator. Helping student-athletes find their perfect fit.',
    isVerified: true, isPublic: true, followers: 5600, following: 1200, sport: 'Basketball',
    organization: 'Elite Prospects Recruiting', credentials: 'NCAA Certified, 10+ years D1 experience',
    savedAthletes: ['a1', 'a7'], createdAt: '2025-01-01'
  },
  {
    id: 'r2', name: 'Michael Torres', type: 'recruiter', avatar: '', location: 'Phoenix, AZ',
    bio: 'Football scout with an eye for raw talent. Connecting athletes with opportunities.',
    isVerified: true, isPublic: true, followers: 3800, following: 900, sport: 'Football',
    organization: 'NextLevel Scouting', credentials: 'Former NFL Scout, NAIA & D2 Specialist',
    savedAthletes: ['a2'], createdAt: '2025-02-10'
  },
  {
    id: 'r3', name: 'Lisa Patel', type: 'recruiter', avatar: '', location: 'Boston, MA',
    bio: 'Multi-sport recruiting specialist. Track, soccer, and volleyball.',
    isVerified: false, isPublic: true, followers: 1500, following: 600, sport: 'Multi-Sport',
    organization: 'Collegiate Connect', credentials: 'NAIA Recruiting Network',
    savedAthletes: ['a3', 'a5', 'a6'], createdAt: '2025-05-01'
  },
];

export const feedPosts: FeedPost[] = [
  {
    id: 'p1', userId: 'a1', userName: 'Marcus Thompson', userAvatar: '', userType: 'athlete',
    isVerified: true, content: 'Just dropped 32 points and 12 assists in the regional finals! 🏀 Grateful for my teammates and coaches. #LockerRoom #Hoops',
    sport: 'Basketball', likes: 234, comments: 45, shares: 12, createdAt: '2026-03-02T18:30:00Z'
  },
  {
    id: 'p2', userId: 'c1', userName: 'Coach David Park', userAvatar: '', userType: 'coach',
    isVerified: true, content: '🏀 OPEN TRYOUTS: Westlake High School varsity basketball. March 15-17. Bring your A-game. DM for details.',
    sport: 'Basketball', likes: 89, comments: 23, shares: 34, createdAt: '2026-03-01T14:00:00Z'
  },
  {
    id: 'p3', userId: 'a5', userName: 'Aisha Johnson', userAvatar: '', userType: 'athlete',
    isVerified: true, content: 'New PR in the 100m — 11.08s! 🔥 Indoor nationals here I come. The grind never stops.',
    sport: 'Track & Field', likes: 567, comments: 89, shares: 45, createdAt: '2026-02-28T20:15:00Z'
  },
  {
    id: 'p4', userId: 'r1', userName: 'Sarah Chen', userAvatar: '', userType: 'recruiter',
    isVerified: true, content: 'Looking for standout point guards and centers in the 2026 class. If you\'re averaging 15+ PPG, let\'s connect. 📋',
    sport: 'Basketball', likes: 156, comments: 67, shares: 23, createdAt: '2026-02-27T10:00:00Z'
  },
  {
    id: 'p5', userId: 'a3', userName: 'Sofia Rodriguez', userAvatar: '', userType: 'athlete',
    isVerified: true, content: 'Committed to the University of Florida! 🐊⚽ Dreams do come true. Thank you to everyone who believed in me.',
    sport: 'Soccer', likes: 890, comments: 134, shares: 67, createdAt: '2026-02-25T16:45:00Z'
  },
  {
    id: 'p6', userId: 'c2', userName: 'Maria Santos', userAvatar: '', userType: 'coach',
    isVerified: true, content: '⚽ Summer Elite Camp registration is NOW OPEN! Ages 14-18. Train with former D1 players. Limited spots.',
    sport: 'Soccer', likes: 145, comments: 38, shares: 56, createdAt: '2026-02-24T09:30:00Z'
  },
];

export const events: Event[] = [
  { id: 'e1', title: 'Westlake Varsity Basketball Tryouts', type: 'tryout', sport: 'Basketball', location: 'Austin, TX', date: '2026-03-15', organizerName: 'Coach David Park' },
  { id: 'e2', title: 'Orlando Elite Soccer Camp', type: 'camp', sport: 'Soccer', location: 'Orlando, FL', date: '2026-06-10', organizerName: 'Maria Santos' },
  { id: 'e3', title: 'D1 Basketball Recruiting Showcase', type: 'recruiting', sport: 'Basketball', location: 'Las Vegas, NV', date: '2026-04-20', organizerName: 'Sarah Chen' },
];

export const allProfiles = [...athletes, ...coaches, ...recruiters];

export const sports = ['Basketball', 'Football', 'Soccer', 'Baseball', 'Track & Field', 'Volleyball'];

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'athlete': return 'bg-primary text-primary-foreground';
    case 'coach': return 'bg-accent text-accent-foreground';
    case 'recruiter': return 'bg-success text-success-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
