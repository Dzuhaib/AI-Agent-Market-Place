'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, collection, serverTimestamp, query, where, getDocs, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/FirebaseProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Zap, ShoppingBag, ArrowLeft, Info, ShieldCheck, Lock, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

import ReviewSection from '@/components/ReviewSection';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  creatorId: string;
  creatorName?: string;
  accessInstructions?: string;
  externalUrl?: string;
  createdAt?: Timestamp;
  [key: string]: unknown;
}

function AgentDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchAgentAndPurchase = async () => {
      if (!id) return;
      const path = `agents/${id}`;
      try {
        const docRef = doc(db, 'agents', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const agentData = { id: docSnap.id, ...docSnap.data() } as Agent;
          setAgent(agentData);

          // Check if user has purchased this agent
          if (user) {
            const purchaseQ = query(
              collection(db, 'purchases'),
              where('userId', '==', user.uid),
              where('agentId', '==', id)
            );
            const purchaseSnap = await getDocs(purchaseQ);
            setPurchased(!purchaseSnap.empty);
          }
        } else {
          toast.error('Agent not found');
          router.push('/marketplace');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentAndPurchase();
  }, [id, router, user]);

  const handlePurchase = async () => {
    if (!user || !agent) {
      toast.error('Please sign in to buy agents.');
      return;
    }

    setPurchasing(true);
    const path = 'purchases';
    const purchaseId = `${user.uid}_${agent.id}`;
    try {
      await setDoc(doc(db, path, purchaseId), {
        userId: user.uid,
        agentId: agent.id,
        agentName: agent.name,
        price: agent.price,
        createdAt: serverTimestamp(),
      });

      // Update sales count on agent
      const agentRef = doc(db, 'agents', agent.id);
      await updateDoc(agentRef, {
        salesCount: increment(1)
      });

      setPurchased(true);
      toast.success('Agent purchased successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 hover:bg-accent/50 font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Agent Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card overflow-hidden text-card-foreground bg-card border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-primary/10 text-primary uppercase font-bold text-[10px] tracking-widest">
                    {agent.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-bold">{agent.rating || '5.0'}</span>
                  </div>
                </div>
                <CardTitle className="text-3xl font-extrabold leading-tight">{agent.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed mt-2 text-muted-foreground">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Price</span>
                    <span className="text-xl font-extrabold text-primary">${agent.price}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Sales</span>
                    <span className="text-xl font-extrabold">{agent.salesCount || 0}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Verified Seller</p>
                      <p className="text-[10px] text-muted-foreground">{agent.creatorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Access Link</p>
                      <p className="text-[10px] text-muted-foreground">URL provided after purchase</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-6 border-t bg-accent/30">
                {!purchased ? (
                  <Button 
                    onClick={handlePurchase} 
                    disabled={purchasing}
                    className="w-full h-12 font-bold rounded-xl" 
                    size="lg"
                  >
                    {purchasing ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <ShoppingBag className="mr-2 h-5 w-5" />
                    )}
                    {purchasing ? 'Processing...' : 'Purchase Agent Access'}
                  </Button>
                ) : (
                  <div className="w-full flex flex-col items-center gap-2">
                    <Badge className="bg-emerald-500 text-white font-bold h-10 w-full flex justify-center rounded-xl pointer-events-none">
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      Owned & Active
                    </Badge>
                  </div>
                )}
              </CardFooter>
            </Card>

            <Card className="glass-card text-card-foreground bg-card border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Custom Logic', 'API Integration', 'Data Processing', 'Long-term Memory'].map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    {cap}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="access" className="w-full">
              <TabsList className="bg-card border p-1 rounded-xl h-11 mb-6">
                <TabsTrigger value="access" className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase text-[10px] tracking-widest">Agent Access</TabsTrigger>
                <TabsTrigger value="info" className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase text-[10px] tracking-widest">Marketplace Info</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase text-[10px] tracking-widest">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="access" className="space-y-6">
                {!purchased ? (
                  <Card className="glass-card">
                    <CardHeader className="text-center py-10">
                      <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <CardTitle className="text-xl font-extrabold text-foreground">Agent Access Restricted</CardTitle>
                      <CardDescription className="max-w-xs mx-auto text-muted-foreground">Purchase access to this agent to view its URL and instructions.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-10 flex justify-center">
                      <Button onClick={handlePurchase} disabled={purchasing} size="lg" className="font-bold rounded-xl">
                        Purchase Now for ${agent.price}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <Card className="glass-card border-primary/20 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                          <Globe className="h-5 w-5 text-primary" />
                          External Agent URL
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Direct link to use this agent on the seller&apos;s platform.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-primary/20">
                          <code className="text-sm font-mono truncate flex-1 text-foreground">{agent.externalUrl as string}</code>
                          <Button asChild size="sm" className="font-bold h-9">
                            <a href={agent.externalUrl as string} target="_blank" rel="noopener noreferrer">Open Agent</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card text-card-foreground bg-card border shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          Access Instructions
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Private details provided by the seller for buyers.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-6 rounded-xl bg-accent/30 border border-dashed font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                          {agent.accessInstructions as string}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="info">
                <Card className="glass-card text-card-foreground bg-card border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">About this Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground italic">
                      &quot;{agent.description}&quot;
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Seller</p>
                        <p className="text-sm font-bold text-foreground">{agent.creatorName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Listed On</p>
                        <p className="text-sm font-bold text-foreground">{agent.createdAt ? new Date((agent.createdAt as Timestamp).toDate()).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewSection agentId={id as string} purchased={purchased} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <AgentDetailContent />
    </Suspense>
  );
}
