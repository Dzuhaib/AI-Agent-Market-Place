'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment, orderBy } from 'firebase/firestore';
import { useAuth } from './FirebaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { Star, User, Send, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: { toDate: () => Date };
}

interface ReviewSectionProps {
  agentId: string;
  purchased: boolean;
  onReviewSubmitted?: () => void;
}

export default function ReviewSection({ agentId, purchased, onReviewSubmitted }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('agentId', '==', agentId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetchedReviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));
        
        setReviews(fetchedReviews);
        
        if (user) {
          setHasReviewed(fetchedReviews.some(r => r.userId === user.uid));
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [agentId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !purchased) return;

    setSubmitting(true);
    try {
      const reviewData = {
        agentId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        rating,
        comment,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      
      // Attempt to update agent stats - might fail due to rules if notcreator
      // In a real app we'd use cloud functions
      try {
        const agentRef = doc(db, 'agents', agentId);
        await updateDoc(agentRef, {
          reviewCount: increment(1),
          // We can't easily calculate average here without triggers
          // but we'll increment salesCount elsewhere
        });
      } catch (e) {
        console.warn('Could not update agent stats directly (no permission)', e);
      }

      const newReview: Review = {
        id: docRef.id,
        ...reviewData,
        createdAt: { toDate: () => new Date() } // Local optimism
      };

      setReviews([newReview, ...reviews]);
      setHasReviewed(true);
      setComment('');
      toast.success('Thank you for your review!');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {purchased && !hasReviewed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Write a Review</CardTitle>
              <CardDescription className="text-xs">Share your experience with this agent.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold mr-2">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-95"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Textarea
                    placeholder="Tell others what you think..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="min-h-[100px] rounded-xl border-border bg-background focus-visible:ring-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full sm:w-auto h-10 font-bold rounded-lg px-8"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Review
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          User Reviews ({reviews.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border bg-card/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                      {review.userPhoto ? (
                        <div className="h-full w-full relative">
                          <Image
                            src={review.userPhoto}
                            alt={review.userName}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{review.userName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {review.createdAt?.toDate ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  &quot;{review.comment}&quot;
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-accent/10 rounded-3xl border border-dashed">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">No reviews yet. Be the first to buy and share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
