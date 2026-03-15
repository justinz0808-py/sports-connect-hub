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
    <div className="min-h-screen pt-14 pb-20 overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(224_76%_40%/0.08),transparent_60%)]" />
        <div className="px-4 relative flex min-h-[70vh] flex-col items-center justify-center text-center py-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Badge variant="outline" className="mb-4 border-primary/30 px-3 py-1 text-xs text-primary">
              The network built for athletes
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-3xl font-bold tracking-tight leading-[1.1]"
          >
            Where Athletes{' '}
            <span className="text-gradient-primary">Get Discovered</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm"
          >
            The Locker Room connects athletes, coaches, and recruiters on one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 w-full max-w-xs"
          >
            <Link to="/feed">
              <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold min-h-[44px] active:opacity-90 shadow-glow">
                Join The Locker Room
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" className="w-full min-h-[44px]">
                Explore Athletes
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 grid grid-cols-2 gap-6 w-full max-w-xs"
          >
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl font-bold text-gradient-primary">{s.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-t border-border">
        <div className="px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold">Everything You Need to <span className="text-gradient-primary">Compete</span></h2>
            <p className="mt-3 text-sm text-muted-foreground">Built specifically for the sports community.</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 gap-3"
          >
            {features.map(f => (
              <motion.div key={f.title} variants={item} className="glass-card p-4 rounded-xl active:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 border-t border-border">
        <div className="px-4 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to Step Into <span className="text-gradient-primary">The Locker Room</span>?</h2>
          <p className="mt-3 text-sm text-muted-foreground">Whether you're an athlete, coach, or recruiter — this is your platform.</p>
          <Link to="/feed">
            <Button className="mt-6 w-full max-w-xs bg-gradient-primary text-primary-foreground font-semibold min-h-[44px] active:opacity-90 shadow-glow">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="px-4 flex flex-col items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
              <span className="text-[10px] font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-display font-semibold text-foreground text-sm">The Locker Room</span>
          </div>
          <p>© 2026 The Locker Room. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
