'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, Bot } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating?: number;
  runs?: number;
  [key: string]: unknown;
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Marketing', 'Legal', 'Coding', 'Writing', 'Data', 'Other'];

  useEffect(() => {
    const fetchAgents = async () => {
      const path = 'agents';
      try {
        const q = query(collection(db, path), where('isPublished', '==', true));
        const querySnapshot = await getDocs(q);
        const agentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
        setAgents(agentsData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-6 hidden lg:block">
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === cat ? 'sidebar-item-active' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl">
            <h4 className="text-sm font-bold mb-2">My Credits</h4>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-primary">1,250</span>
              <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase font-bold">Top Up</Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Marketplace</h1>
              <p className="text-sm text-muted-foreground">Discover and deploy specialized AI agents.</p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-border bg-card focus-visible:ring-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="glass-card h-full flex flex-col overflow-hidden group">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">
                          {agent.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-bold">{agent.rating || '5.0'}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{agent.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {agent.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-4 border-t flex items-center justify-between bg-accent/30">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase font-bold text-muted-foreground">Price</span>
                           <span className="text-sm font-extrabold text-primary">${agent.price}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase font-bold text-muted-foreground">Sales</span>
                           <span className="text-sm font-extrabold">{agent.salesCount as number || 0}</span>
                        </div>
                      </div>
                      <Button asChild size="sm" className="font-bold rounded-lg px-4">
                        <Link href={`/agents/view?id=${agent.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold">No agents found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
