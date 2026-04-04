import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, User, Search, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: User,
    title: 'Athletic Profiles',
    desc: 'Showcase your stats, position, school and highlights',
  },
  {
    icon: Search,
    title: 'Get Discovered',
    desc: 'Coaches search by sport, position and graduation year',
  },
  {
    icon: MessageCircle,
    title: 'Direct Connect',
    desc: 'Message coaches and athletes directly on the platform',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-border bg-background/90">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            THE LOCKER ROOM
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#coaches" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">For Coaches</a>
            <a href="#about" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="text-sm font-semibold text-muted-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="text-sm font-semibold min-h-[44px] px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-12 md:pt-28 md:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6 bg-card text-foreground border border-border">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Basketball-first platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl leading-[1.1] mb-6"
          >
            <span className="font-light text-foreground">
              Build Your Athletic Profile,
            </span>
            <br />
            <span className="font-extrabold text-primary">
              Get Recruited.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl font-normal max-w-lg mx-auto mb-8 text-muted-foreground"
          >
            The platform where athletes and coaches connect. Free. Built for basketball.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <Link to="/auth">
              <Button className="text-base font-semibold min-h-[48px] px-7 gap-2">
                Create Your Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="outline"
                className="text-base font-semibold min-h-[48px] px-7"
              >
                See How It Works
              </Button>
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-medium text-muted-foreground"
          >
            Join 100+ athletes already on the platform
          </motion.p>
        </div>

        {/* Product Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-4xl mx-auto px-4 pb-16"
        >
          <div className="rounded-2xl p-6 md:p-8 bg-card border border-border" style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="ml-3 text-xs font-medium text-muted-foreground">thelockerroom.app/feed</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Marcus Johnson', role: 'ATHLETE', sport: 'Basketball • PG', stat: '18.5 PPG', color: '#C2410C' },
                { name: 'Coach Williams', role: 'COACH', sport: 'Lincoln High School', stat: '12 Recruits', color: '#1D4ED8' },
                { name: 'Sarah Martinez', role: 'ATHLETE', sport: 'Soccer • Forward', stat: '22 Goals', color: '#C2410C' },
              ].map((card) => (
                <div
                  key={card.name}
                  className="rounded-xl p-4 bg-secondary"
                  style={{ borderLeft: `3px solid ${card.color}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: card.color }}
                    >
                      {card.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ background: card.color }}
                    >
                      {card.role}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{card.name}</p>
                  <p className="text-xs text-muted-foreground">{card.sport}</p>
                  <p className="text-lg font-extrabold mt-2" style={{ color: card.color }}>{card.stat}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-card">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Everything you need
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Built specifically for the sports community
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="rounded-2xl p-6 text-center border border-border bg-secondary"
              >
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section id="coaches" className="py-16 md:py-24 bg-secondary">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-8 text-center"
          >
            {[
              { value: '100+', label: 'Athletes' },
              { value: '50+', label: 'Coaches' },
              { value: 'Free', label: 'Forever' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-5xl font-extrabold mb-1 text-primary">
                  {s.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="about" className="py-16 md:py-24 text-center bg-background">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-foreground">
              Ready to get recruited?
            </h2>
            <Link to="/auth">
              <Button className="text-base font-semibold min-h-[48px] px-8 gap-2">
                Create Your Free Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Takes 2 minutes. Free forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="text-lg font-extrabold text-foreground">
              THE LOCKER ROOM
            </span>
            <p className="text-sm mt-1 text-muted-foreground">
              Where athletes connect
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="mailto:hello@thelockerroom.app" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 The Locker Room
          </p>
        </div>
      </footer>
    </div>
  );
}
