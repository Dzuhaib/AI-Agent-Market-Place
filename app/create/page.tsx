'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/FirebaseProvider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

export default function CreateAgentPage() {
  const { user, isSeller, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Marketing',
    price: '0.50',
    externalUrl: '',
    accessInstructions: '',
    isPublished: true,
  });

  if (!authLoading && !isSeller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] space-y-4">
        <p className="text-muted-foreground font-medium">You need to be a seller to list agents.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard?tab=settings">Switch to Seller Mode</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const path = 'agents';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        price: parseFloat(formData.price),
        creatorId: user.uid,
        creatorName: user.displayName,
        rating: 5.0,
        salesCount: 0,
        createdAt: serverTimestamp(),
      });
      toast.success('Agent listed successfully!');
      router.push('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">List Your AI Agent</h1>
          <p className="text-sm text-muted-foreground">Share your specialized agent with the world and start earning.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Listing Details</CardTitle>
              <CardDescription className="text-xs">The public information that buyers will see.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Agent Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Marketing Strategist Pro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11 border-border bg-card focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Marketplace Description</Label>
                <Textarea
                  id="description"
                  placeholder="Explain exactly what your agent does and how it helps users."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="min-h-[100px] border-border bg-card focus-visible:ring-primary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-11 border-border bg-card focus-visible:ring-primary">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Coding">Coding</SelectItem>
                      <SelectItem value="Writing">Writing</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sale Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="h-11 border-border bg-card focus-visible:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Access & Delivery
              </CardTitle>
              <CardDescription className="text-xs">How users will access your agent after purchase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="externalUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Agent URL (External)</Label>
                <Input
                  id="externalUrl"
                  placeholder="https://your-agent-platform.com/agent-id"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  required
                  className="h-11 border-border bg-card focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessInstructions" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Buyer Instructions (Hidden Until Purchased)</Label>
                <Textarea
                  id="accessInstructions"
                  placeholder="e.g. Use the license key AGENT-123. Join our Discord for support."
                  value={formData.accessInstructions}
                  onChange={(e) => setFormData({ ...formData, accessInstructions: e.target.value })}
                  required
                  className="min-h-[150px] border-border bg-card font-mono text-sm focus-visible:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Publishing</CardTitle>
              <CardDescription className="text-xs">Control visibility and access.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border bg-accent/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {formData.isPublished ? <Globe className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Publish to Marketplace</p>
                    <p className="text-[10px] text-muted-foreground">Make this agent available for others to use.</p>
                  </div>
                </div>
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-6 border-t bg-accent/30 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 font-bold rounded-lg px-8">Cancel</Button>
              <Button type="submit" disabled={loading} className="h-11 font-bold rounded-lg px-8">
                {loading ? 'Listing...' : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    List Agent
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
