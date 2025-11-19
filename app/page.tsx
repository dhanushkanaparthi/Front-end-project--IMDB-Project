'use client';

import { Header } from '@/components/header';
import { MovieCard } from '@/components/movie-card';
import { useWatchlist } from '@/lib/watchlist/hooks';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MOCK_MOVIES = [
  {
    id: '550',
    title: 'Fight Club',
    posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    rating: 8.4,
    releaseDate: '1999-10-15',
  },
  {
    id: '238',
    title: 'The Godfather',
    posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    rating: 8.7,
    releaseDate: '1972-03-14',
  },
  {
    id: '424',
    title: "Schindler's List",
    posterPath: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    rating: 8.6,
    releaseDate: '1993-12-15',
  },
  {
    id: '278',
    title: 'The Shawshank Redemption',
    posterPath: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    rating: 8.7,
    releaseDate: '1994-09-23',
  },
  {
    id: '240',
    title: 'The Godfather Part II',
    posterPath: '/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg',
    rating: 8.6,
    releaseDate: '1974-12-20',
  },
  {
    id: '129',
    title: 'Spirited Away',
    posterPath: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    rating: 8.5,
    releaseDate: '2001-07-20',
  },
];

export default function Home() {
  const { addToWatchlist } = useWatchlist();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <motion.h1
                  className="text-6xl font-bold mb-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Discover Movies
                </motion.h1>
                <motion.p
                  className="text-xl text-white/90"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Explore thousands of movies and TV shows
                </motion.p>
              </div>
            </div>
          </div>
        </motion.section>

        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="top-rated" className="gap-2">
              <Star className="h-4 w-4" />
              Top Rated
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {MOCK_MOVIES.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MovieCard
                    {...movie}
                    onAddToWatchlist={() => addToWatchlist(movie.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="top-rated">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {MOCK_MOVIES.sort((a, b) => b.rating - a.rating).map((movie) => (
                <MovieCard
                  key={movie.id}
                  {...movie}
                  onAddToWatchlist={() => addToWatchlist(movie.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {MOCK_MOVIES.slice(0, 3).map((movie) => (
                <MovieCard
                  key={movie.id}
                  {...movie}
                  onAddToWatchlist={() => addToWatchlist(movie.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
