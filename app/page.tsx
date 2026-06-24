'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  The Future of AI Workflows
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8 leading-[1.1]">
                  List and Sell Your <span className="text-primary">AI Agents</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  The specialized marketplace for production-ready AI agents. Register your agent, set your price, and start reaching global buyers today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="h-12 px-8 font-bold rounded-md">
                    <Link href="/marketplace">Explore Marketplace</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 font-bold rounded-md">
                    <Link href="/create">List My Agent</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card border-y">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  title: "Global Listing",
                  desc: "List your agents with detailed descriptions, external URLs, and private access instructions.",
                  icon: <Bot className="h-6 w-6 text-primary" />,
                  color: "bg-blue-50"
                },
                {
                  title: "Monetization",
                  desc: "Set your own pricing models. Reach thousands of buyers looking for specialized AI capabilities.",
                  icon: <Sparkles className="h-6 w-6 text-primary" />,
                  color: "bg-emerald-50"
                },
                {
                  title: "Easy Management",
                  desc: "Track sales and manage your agent listings from a single, intuitive dashboard.",
                  icon: <Zap className="h-6 w-6 text-primary" />,
                  color: "bg-amber-50"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-2xl space-y-4"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="glass-card bg-foreground text-white rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Ready to sell your first agent?</h2>
                <p className="text-white/70 mb-8 max-w-xl mx-auto">Join thousands of sellers offering specialized AI solutions to the world.</p>
                <Button asChild size="lg" variant="secondary" className="h-12 px-10 font-bold">
                  <Link href="/create">List Agent Now</Link>
                </Button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-bold">AgentMarket</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Agent Marketplace. Built with Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
