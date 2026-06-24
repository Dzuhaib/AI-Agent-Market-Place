'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/FirebaseProvider';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, TrendingUp, History, ShoppingBag, PlusCircle, Settings, Store, Users } from 'lucide-react';
import Link from 'next/link';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  description: string;
  price: number;
  runs?: number;
  isPublished?: boolean;
  [key: string]: unknown;
}

interface Run {
  id: string;
  agentName: string;
  createdAt: Timestamp;
  [key: string]: unknown;
}

interface Purchase {
  id: string;
  agentId: string;
  agentName: string;
  price: number;
  createdAt: Timestamp;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const { user, isSeller, profile } = useAuth();
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [purchasedAgents, setPurchasedAgents] = useState<Purchase[]>([]);
  const [recentActivity, setRecentActivity] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch user's listings if they are a seller
        if (isSeller) {
          const path = 'agents';
          try {
            const agentsQ = query(collection(db, path), where('creatorId', '==', user.uid));
            const agentsSnapshot = await getDocs(agentsQ);
            setMyAgents(agentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent)));
          } catch (error) {
            handleFirestoreError(error, OperationType.LIST, path);
          }
        }

        // Fetch purchased agents
        const purchasePath = 'purchases';
        try {
          const purchaseQ = query(collection(db, purchasePath), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const purchaseSnapshot = await getDocs(purchaseQ);
          setPurchasedAgents(purchaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase)));
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, purchasePath);
        }

        // Fetch recent activity
        const runsPath = 'runs';
        try {
          const activityQ = query(
            collection(db, runsPath),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const activitySnapshot = await getDocs(activityQ);
          setRecentActivity(activitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Run)));
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, runsPath);
        }
      } catch (error) {
        console.error('Error in dashboard data fetching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isSeller]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.displayName}.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="h-10 font-bold rounded-lg">
              <Link href="/marketplace">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Marketplace
              </Link>
            </Button>
            {isSeller && (
              <Button asChild className="h-10 font-bold rounded-lg leading-tight">
                <Link href="/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  List Agent
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Owned Agents', value: purchasedAgents.length.toString(), icon: <ShoppingBag className="h-5 w-5 text-primary" />, trend: '0%' },
            { label: 'My Listings', value: myAgents.length.toString(), icon: <Bot className="h-5 w-5 text-primary" />, trend: '0%' },
            { label: 'Total Earnings', value: '$' + (myAgents.reduce((acc, agent) => acc + (Number(agent.salesCount || 0) * Number(agent.price)), 0)).toFixed(2), icon: <TrendingUp className="h-5 w-5 text-primary" />, trend: '+8%' },
          ].map((stat, i) => (
            <Card key={i} className="glass-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{stat.value}</div>
                <p className="text-[10px] font-bold text-emerald-500 mt-1">{stat.trend} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="purchased" className="space-y-6">
          <TabsList className="bg-card border p-1 rounded-xl h-11 flex overflow-x-auto whitespace-nowrap scrollbar-hide">
            <TabsTrigger value="purchased" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white flex-shrink-0">My Agents</TabsTrigger>
            {isSeller && <TabsTrigger value="listings" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white flex-shrink-0">My Listings</TabsTrigger>}
            <TabsTrigger value="activity" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white flex-shrink-0">Recent Activity</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white flex-shrink-0">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="purchased">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Purchased Agents
                </CardTitle>
                <CardDescription className="text-xs">The agents you currently own and have access to.</CardDescription>
              </CardHeader>
              <CardContent>
                {purchasedAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchasedAgents.map((purchase) => (
                      <div key={purchase.id} className="p-4 rounded-xl bg-accent/30 border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{purchase.agentName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Owned since {new Date(purchase.createdAt.toDate()).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button asChild size="sm" className="font-bold rounded-lg h-8">
                          <Link href={`/agents/view?id=${purchase.agentId}`}>Access</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 opacity-40">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-sm font-bold">You haven&apos;t purchased any agents yet.</p>
                    <Button asChild variant="link" className="font-bold">
                      <Link href="/marketplace">Explore Marketplace</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isSeller && (
            <TabsContent value="listings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myAgents.map((agent) => (
                  <Card key={agent.id} className="glass-card overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold leading-tight">{agent.name}</CardTitle>
                        <Badge variant={agent.isPublished ? "default" : "outline"} className="text-[10px] uppercase font-bold">
                          {agent.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs line-clamp-1">{agent.description as string}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Price</span>
                          <span className="text-sm font-extrabold text-primary">${agent.price as number}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Sales</span>
                          <span className="text-sm font-extrabold">{agent.salesCount as number || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t bg-accent/30 flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1 font-bold rounded-lg h-9">
                        <Link href={`/create?id=${agent.id}`}>Edit Listing</Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1 font-bold rounded-lg h-9">
                        <Link href={`/agents/view?id=${agent.id}`}>Preview</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="activity">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs tracking-tight">Your latest agent executions and interactions.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{activity.agentName}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(activity.createdAt?.toDate()).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase flex-shrink-0">Success</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 opacity-40">
                    <History className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-sm font-bold">No recent activity found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-xs">Manage your profile and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-bold">Marketplace Role</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'buyer', label: 'Buyer', icon: <ShoppingBag className="h-4 w-4" /> },
                      { id: 'seller', label: 'Seller', icon: <Store className="h-4 w-4" /> },
                      { id: 'both', label: 'Both', icon: <Users className="h-4 w-4" /> },
                    ].map((role) => (
                      <Button
                        key={role.id}
                        variant={profile?.role === role.id ? 'default' : 'outline'}
                        className="h-12 justify-start gap-2 rounded-xl font-bold"
                        onClick={async () => {
                          if (!user) return;
                          try {
                            const { doc, updateDoc } = await import('firebase/firestore');
                            await updateDoc(doc(db, 'users', user.uid), { role: role.id });
                            toast.success(`Role updated to ${role.label}`);
                          } catch (e) {
                            console.error(e);
                            toast.error('Failed to update role.');
                          }
                        }}
                      >
                        {role.icon}
                        {role.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Switching to Seller mode allows you to list and manage agents.</p>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-accent/30">
                    <div>
                      <p className="text-sm font-bold">Email Notifications</p>
                      <p className="text-[10px] text-muted-foreground">Receive updates about your agent sales and activity.</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase font-bold">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
