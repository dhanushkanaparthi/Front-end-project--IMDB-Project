'use client';

import { Header } from '@/components/header';
import { MovieCard } from '@/components/movie-card';
import { useWatchlist } from '@/lib/watchlist/hooks';
import { motion } from 'framer-motion';
import { Bookmark, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Movie {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string | null;
}

export default function WatchlistPage() {
  const { items, loading, isOnline, removeFromWatchlist } = useWatchlist();
  const [movies, setMovies] = useState<Record<string, Movie>>({});
  const [loadingMovies, setLoadingMovies] = useState(false);

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (items.length === 0) return;

      setLoadingMovies(true);
      try {
        const movieIds = items.map(item => item.movie_id);
        const { data, error } = await supabase
          .from('movies')
          .select('id, tmdb_id, title, poster_path, vote_average, release_date')
          .in('id', movieIds);

        if (data) {
          const moviesMap: Record<string, Movie> = {};
          (data as Movie[]).forEach((movie: Movie) => {
            moviesMap[movie.id] = movie;
          });
          setMovies(moviesMap);
        }
      } catch (error) {
        console.error('Error loading movie details:', error);
      } finally {
        setLoadingMovies(false);
      }
    };

    loadMovieDetails();
  }, [items]);

  if (loading || loadingMovies) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="h-8 w-8" />
            <h1 className="text-4xl font-bold">My Watchlist</h1>
          </div>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'movie' : 'movies'} in your watchlist
          </p>
        </motion.div>

        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert>
              <AlertTitle>Offline Mode</AlertTitle>
              <AlertDescription>
                Changes will be synced when you're back online
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {items.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground">
              Start adding movies to keep track of what you want to watch
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {items.map((item, index) => {
              const movie = movies[item.movie_id];
              if (!movie) return null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MovieCard
                    id={movie.tmdb_id.toString()}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    rating={movie.vote_average}
                    releaseDate={movie.release_date}
                    onAddToWatchlist={() => removeFromWatchlist(item.movie_id)}
                    inWatchlist={true}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
