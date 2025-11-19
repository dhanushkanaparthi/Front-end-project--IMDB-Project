'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, Flag, Edit2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  is_published: boolean;
  helpful_count: number;
  unhelpful_count: number;
  wilson_score: number;
  created_at: string;
  updated_at: string;
}

interface ReviewSystemProps {
  movieId: string;
}

export function ReviewSystem({ movieId }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sortBy, setSortBy] = useState<'helpful' | 'recent'>('helpful');

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    loadReviews();
  }, [movieId, sortBy]);

  useEffect(() => {
    if (debouncedTitle || debouncedContent) {
      autosaveDraft();
    }
  }, [debouncedTitle, debouncedContent, rating]);

  const loadReviews = async () => {
    try {
      const orderColumn = sortBy === 'helpful' ? 'wilson_score' : 'created_at';
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('movie_id', movieId)
        .eq('is_published', true)
        .eq('is_deleted', false)
        .order(orderColumn, { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const autosaveDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('review_drafts').upsert({
        user_id: user.id,
        movie_id: movieId,
        rating,
        title: debouncedTitle,
        content: debouncedContent,
        client_timestamp: new Date().toISOString(),
        sync_status: 'pending',
      } as any);
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  };

  const submitReview = async () => {
    if (!title.trim() || !content.trim() || rating === 0) {
      toast.error('Please fill in all fields and provide a rating');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to write a review');
        return;
      }

      const reviewData = {
        movie_id: movieId,
        user_id: user.id,
        rating,
        title: title.trim(),
        content: content.trim(),
        is_published: true,
        published_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error }: any = await (supabase as any)
          .from('reviews')
          .update(reviewData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Review updated successfully');
      } else {
        const { error }: any = await (supabase as any)
          .from('reviews')
          .insert(reviewData);

        if (error) throw error;
        toast.success('Review published successfully');
      }

      setTitle('');
      setContent('');
      setRating(0);
      setIsWriting(false);
      setEditingId(null);
      loadReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const voteOnReview = async (reviewId: string, voteType: 'helpful' | 'unhelpful') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to vote');
        return;
      }

      const { error }: any = await (supabase as any)
        .from('review_votes')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          vote_type: voteType,
        });

      if (error) throw error;

      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        const newCount = voteType === 'helpful'
          ? review.helpful_count + 1
          : review.unhelpful_count + 1;

        await (supabase as any)
          .from('reviews')
          .update({
            [voteType === 'helpful' ? 'helpful_count' : 'unhelpful_count']: newCount,
          })
          .eq('id', reviewId);
      }

      toast.success('Vote recorded');
      loadReviews();
    } catch (error: any) {
      toast.error('Failed to record vote');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('helpful')}
          >
            Most Helpful
          </Button>
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            Most Recent
          </Button>
        </div>
      </div>

      {!isWriting ? (
        <Button onClick={() => setIsWriting(true)} className="w-full">
          Write a Review
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Write Your Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <motion.button
                      key={value}
                      type="button"
                      className="p-1"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(value)}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          value <= (hoverRating || rating)
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </motion.button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-lg font-semibold">{rating}/10</span>
                  )}
                </div>
              </div>

              <div>
                <Input
                  placeholder="Review title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {title.length}/100 characters
                </p>
              </div>

              <div>
                <Textarea
                  placeholder="Write your review here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {content.length}/5000 characters • Auto-saving...
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={submitReview} disabled={!rating || !title.trim() || !content.trim()}>
                  Publish Review
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsWriting(false);
                    setTitle('');
                    setContent('');
                    setRating(0);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{review.rating}/10</span>
                      </div>
                      <CardTitle className="text-xl">{review.title}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {review.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => voteOnReview(review.id, 'helpful')}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpful_count})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => voteOnReview(review.id, 'unhelpful')}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Not Helpful ({review.unhelpful_count})
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 ml-auto">
                      <Flag className="h-4 w-4" />
                      Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
