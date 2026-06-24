'use client';

import React, { useState } from 'react';
import { useAuth } from './FirebaseProvider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ShoppingBag, Store, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Onboarding() {
  const { user, profile, needsOnboarding } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | 'both' | null>(null);

  if (!needsOnboarding) return null;

  const handleComplete = async () => {
    if (!user || !selectedRole) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: selectedRole,
        onboarded: true,
        updatedAt: serverTimestamp(),
        createdAt: profile?.createdAt || serverTimestamp(),
      }, { merge: true });
      
      toast.success('Onboarding complete! Welcome to AgentMarket.');
    } catch (error) {
      console.error('Onboarding failed:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'I want to browse and purchase AI agents for my workflows.',
      icon: <ShoppingBag className="h-6 w-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'seller',
      title: 'Seller',
      description: 'I want to list and sell my specialized AI agents to others.',
      icon: <Store className="h-6 w-6" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'both',
      title: 'Both',
      description: 'I want to both purchase agents and list my own agents.',
      icon: <Users className="h-6 w-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden">
          <CardHeader className="text-center pb-2 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Welcome to AgentMarket</CardTitle>
            <CardDescription className="text-sm">Let&apos;s personalize your experience. How do you plan to use the marketplace?</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-8">
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id as 'buyer' | 'seller' | 'both')}
                  className={`relative group flex flex-col p-6 rounded-2xl border-2 transition-all text-left h-full ${
                    selectedRole === role.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${role.bgColor} ${role.color} transition-transform group-hover:scale-110`}>
                    {role.icon}
                  </div>
                  <h3 className={`font-bold mb-1 ${selectedRole === role.id ? 'text-primary' : ''}`}>{role.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{role.description}</p>
                  
                  {selectedRole === role.id && (
                    <motion.div 
                      layoutId="selected-ring"
                      className="absolute inset-0 rounded-2xl ring-2 ring-primary pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleComplete} 
                disabled={!selectedRole || loading}
                size="lg"
                className="w-full sm:w-64 h-12 font-bold rounded-xl shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </div>
            
            <p className="text-[10px] text-center text-muted-foreground mt-6">
              You can change your role anytime in your dashboard settings.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
