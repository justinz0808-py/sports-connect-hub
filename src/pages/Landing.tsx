import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Search, Shield, Trophy, Target, Zap } from 'lucide-react';

const features = [
  { icon: Trophy, title: 'Athletic Profiles', desc: 'Showcase your stats, highlights, and achievements in a profile built for athletes.' },
  { icon: Search, title: 'Smart Search', desc: 'Find athletes by sport, position, graduation year, location, and key stats.' },
  { icon: Users, title: 'Connections', desc: 'Follow athletes, link teammates, and build your sports network.' },
  { icon: Shield, title: 'Verified Badges', desc: 'Earn verification to stand out as a legitimate athlete, coach, or recruiter.' },
  { icon: Target, title: 'Recruiting Tools', desc: 'Coaches and recruiters can discover talent, save profiles, and reach out.' },
  { icon: Zap, title: 'Real-Time Feed', desc: 'Stay updated with achievements, events, tryouts, and recruiting opportunities.' },
];

const stats = [
  { value: '10K+', label: 'Athletes' },
  { value: '500+', label: 'Programs' },
  { value: '50+', label: 'Sports' },
  { value: '2K+', label: 'Connections Daily' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_100%_50%/0.08),transparent_60%)]" />
        <div className="container relative flex min-h-[85vh] flex-col items-center justify-center text-center py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Badge variant="outline" className="mb-6 border-primary/30 px-4 py-1.5 text-sm text-primary">
              The network built for athletes
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl"
          >
            Where Athletes{' '}
            <span className="text-gradient-primary">Get Discovered</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            The Locker Room connects athletes, coaches, and recruiters on one platform.
            Build your athletic profile, showcase your highlights, and get noticed by the programs that matter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link to="/feed">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground font-semibold text-base px-8 hover:opacity-90 shadow-glow">
                Join The Locker Room
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="text-base px-8">
                Explore Athletes
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-16"
          >
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-gradient-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Everything You Need to <span className="text-gradient-primary">Compete</span></h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Built specifically for the sports community — not a generic social network with a sports skin.</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(f => (
              <motion.div key={f.title} variants={item} className="glass-card p-6 hover:border-primary/30 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Ready to Step Into <span className="text-gradient-primary">The Locker Room</span>?</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Whether you're an athlete looking to get noticed, a coach building a roster, or a recruiter finding the next star — this is your platform.</p>
          <Link to="/feed">
            <Button size="lg" className="mt-8 bg-gradient-primary text-primary-foreground font-semibold px-10 hover:opacity-90 shadow-glow">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <span className="text-xs font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-display font-semibold text-foreground">The Locker Room</span>
          </div>
          <p>© 2026 The Locker Room. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
