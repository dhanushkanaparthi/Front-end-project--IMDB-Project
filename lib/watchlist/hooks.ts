'use client';

import { useEffect, useState } from 'react';
import { watchlistStore } from './store';
import { supabase } from '../supabase/client';
import { toast } from 'sonner';

interface WatchlistItem {
  id: string;
  movie_id: string;
  notes: string | null;
  priority: number;
  watched: boolean;
  watched_at: string | null;
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    watchlistStore.init();
    loadWatchlist();

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing watchlist...');
      syncWithServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Offline mode. Changes will sync when online.');
    };

    const handleUpdate = () => {
      loadWatchlist();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('watchlist-update', handleUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('watchlist-update', handleUpdate);
    };
  }, []);

  const loadWatchlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await syncWithServer();
      } else {
        const localItems = await watchlistStore.getAll();
        setItems(localItems);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      const localItems = await watchlistStore.getAll();
      setItems(localItems);
    } finally {
      setLoading(false);
    }
  };

  const syncWithServer = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: serverItems } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false);

      if (serverItems) {
        await watchlistStore.syncWithServer(serverItems as any);
        const localItems = await watchlistStore.getAll();
        setItems(localItems);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const addToWatchlist = async (tmdbId: string, notes?: string) => {
    const loadingToast = toast.loading('Adding to watchlist...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.dismiss(loadingToast);
        toast.error('Please sign in to add to watchlist');
        return;
      }

      let movieId: string;

      const { data: existingMovie } = await supabase
        .from('movies')
        .select('id')
        .eq('tmdb_id', parseInt(tmdbId))
        .maybeSingle();

      if (existingMovie) {
        movieId = (existingMovie as any).id as string;
      } else {
        const tmdbResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || ''}`
        );

        if (!tmdbResponse.ok) {
          toast.dismiss(loadingToast);
          toast.error('Failed to fetch movie details');
          return;
        }

        const movieData = await tmdbResponse.json();

        const { data: newMovie, error: insertError } = await (supabase
          .from('movies')
          .insert({
            tmdb_id: parseInt(tmdbId),
            title: movieData.title,
            original_title: movieData.original_title,
            overview: movieData.overview,
            poster_path: movieData.poster_path,
            backdrop_path: movieData.backdrop_path,
            release_date: movieData.release_date,
            runtime: movieData.runtime,
            genres: movieData.genres || [],
            vote_average: movieData.vote_average || 0,
            vote_count: movieData.vote_count || 0,
            popularity: movieData.popularity || 0,
            status: movieData.status || 'Released',
            tagline: movieData.tagline,
            budget: movieData.budget || 0,
            revenue: movieData.revenue || 0,
            imdb_id: movieData.imdb_id,
          } as any)
          .select('id')
          .single());

        if (insertError || !newMovie) {
          toast.dismiss(loadingToast);
          toast.error('Failed to save movie');
          console.error('Insert error:', insertError);
          return;
        }

        movieId = (newMovie as any).id as string;
      }

      const item = await watchlistStore.add(movieId, user.id, notes);

      await supabase.from('watchlists').insert({
        id: item.id,
        user_id: item.user_id,
        movie_id: item.movie_id,
        added_at: item.added_at,
        notes: item.notes,
        priority: item.priority,
        watched: item.watched,
        watched_at: item.watched_at,
        client_id: item.client_id,
        vector_clock: item.vector_clock,
        sync_version: item.sync_version,
        is_deleted: item.is_deleted,
      } as any);

      await syncWithServer();
      toast.dismiss(loadingToast);
      toast.success('Added to watchlist', {
        action: {
          label: 'Undo',
          onClick: () => removeFromWatchlist(movieId),
        },
      });
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Add to watchlist error:', error);
      toast.error(error.message || 'Failed to add to watchlist');
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    try {
      const item = await watchlistStore.getByMovie(movieId);
      if (item) {
        await watchlistStore.remove(item.id);
        toast.success('Removed from watchlist');
      }
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const toggleWatched = async (movieId: string) => {
    try {
      const item = await watchlistStore.getByMovie(movieId);
      if (item) {
        await watchlistStore.update(item.id, {
          watched: !item.watched,
          watched_at: !item.watched ? new Date().toISOString() : null,
        });
        toast.success(item.watched ? 'Marked as unwatched' : 'Marked as watched');
      }
    } catch (error) {
      toast.error('Failed to update watch status');
    }
  };

  const isInWatchlist = async (tmdbId: string): Promise<boolean> => {
    try {
      const { data: existingMovie, error } = await supabase
        .from('movies')
        .select('id')
        .eq('tmdb_id', parseInt(tmdbId))
        .maybeSingle();

      if (error || !existingMovie) return false;

      const movieId = (existingMovie as any).id as string;
      const item = await watchlistStore.getByMovie(movieId);
      return !!item && !item.is_deleted;
    } catch {
      return false;
    }
  };

  return {
    items,
    loading,
    isOnline,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatched,
    isInWatchlist,
    refresh: loadWatchlist,
  };
}
