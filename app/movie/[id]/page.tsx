'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWatchlist } from '@/lib/watchlist/hooks';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Plus, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateMovieSchema } from '@/lib/utils/structured-data';
import { StructuredData } from '@/components/structured-data';

const MOCK_MOVIES: Record<string, any> = {
  '550': {
    id: '550',
    title: 'Fight Club',
    tagline: 'Mischief. Mayhem. Soap.',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdropPath: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    rating: 8.4,
    releaseDate: '1999-10-15',
    runtime: 139,
    genres: ['Drama', 'Thriller', 'Mystery'],
    cast: [
      { id: '287', name: 'Brad Pitt', character: 'Tyler Durden', profilePath: '/cckcYc2v0yh1tc9QjRelptcOBko.jpg' },
      { id: '819', name: 'Edward Norton', character: 'The Narrator', profilePath: '/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg' },
    ],
  },
  '238': {
    id: '238',
    title: 'The Godfather',
    tagline: 'An offer you can\'t refuse.',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
    posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdropPath: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    rating: 8.7,
    releaseDate: '1972-03-14',
    runtime: 175,
    genres: ['Drama', 'Crime'],
    cast: [
      { id: '3084', name: 'Marlon Brando', character: 'Don Vito Corleone', profilePath: '/fuTEPCSkD3TfqhjH1YRuApZ9EkE.jpg' },
      { id: '1158', name: 'Al Pacino', character: 'Michael Corleone', profilePath: '/2dGBb1fOcNdZjtQfJftkGgjr0ug.jpg' },
    ],
  },
  '424': {
    id: '424',
    title: "Schindler's List",
    tagline: 'Whoever saves one life, saves the world entire.',
    overview: 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives during the Holocaust.',
    posterPath: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    backdropPath: '/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg',
    rating: 8.6,
    releaseDate: '1993-12-15',
    runtime: 195,
    genres: ['Drama', 'History', 'War'],
    cast: [
      { id: '3896', name: 'Liam Neeson', character: 'Oskar Schindler', profilePath: '/bboldwqSC6tdw2iL6631c98l2Mn.jpg' },
      { id: '3895', name: 'Ben Kingsley', character: 'Itzhak Stern', profilePath: '/vQtBqpF2HDdzbfXHDzR4u37i1Ac.jpg' },
    ],
  },
  '278': {
    id: '278',
    title: 'The Shawshank Redemption',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    overview: 'Framed for murder, upstanding banker Andy Dufresne begins a new life at Shawshank prison.',
    posterPath: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdropPath: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    rating: 8.7,
    releaseDate: '1994-09-23',
    runtime: 142,
    genres: ['Drama', 'Crime'],
    cast: [
      { id: '504', name: 'Tim Robbins', character: 'Andy Dufresne', profilePath: '/hsCsu1d03f3hNfY4dXDCWKkCw3s.jpg' },
      { id: '192', name: 'Morgan Freeman', character: 'Ellis Boyd Redding', profilePath: '/jPsLqiYGSofU4s6BjrxnefMfabb.jpg' },
    ],
  },
  '240': {
    id: '240',
    title: 'The Godfather Part II',
    tagline: 'The rise and fall of the Corleone empire.',
    overview: 'The early life of Vito Corleone in 1920s New York City is portrayed, while his son continues to expand the family crime syndicate.',
    posterPath: '/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg',
    backdropPath: '/gLbBRyS7UBEql7914K5D3VHRLmL.jpg',
    rating: 8.6,
    releaseDate: '1974-12-20',
    runtime: 202,
    genres: ['Drama', 'Crime'],
    cast: [
      { id: '1158', name: 'Al Pacino', character: 'Michael Corleone', profilePath: '/2dGBb1fOcNdZjtQfJftkGgjr0ug.jpg' },
      { id: '380', name: 'Robert De Niro', character: 'Vito Corleone', profilePath: '/cT8htcckIuyI1Lqwt1CvD02ynTh.jpg' },
    ],
  },
  '129': {
    id: '129',
    title: 'Spirited Away',
    tagline: 'The tunnel led Chihiro to a mysterious town...',
    overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits.',
    posterPath: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdropPath: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    rating: 8.5,
    releaseDate: '2001-07-20',
    runtime: 125,
    genres: ['Animation', 'Family', 'Fantasy'],
    cast: [
      { id: '52651', name: 'Rumi Hiiragi', character: 'Chihiro (voice)', profilePath: '/q4RlaZjvN1IoP0W5GbjwGQuuvYT.jpg' },
      { id: '52652', name: 'Miyu Irino', character: 'Haku (voice)', profilePath: '/mWRP78HNMwsobNYTlMKcJlejvNa.jpg' },
    ],
  },
};

export default function MoviePage({ params }: { params: { id: string } }) {
  const { addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      console.log('Loading movie with ID:', params.id);
      await new Promise(resolve => setTimeout(resolve, 300));
      const movieData = MOCK_MOVIES[params.id];
      console.log('Found movie data:', movieData);
      if (movieData) {
        setMovie(movieData);
      } else {
        console.error('Movie not found for ID:', params.id);
      }
      setLoading(false);
    };
    loadMovie();
  }, [params.id]);

  const handleWatchlistToggle = async () => {
    if (inWatchlist) {
      await removeFromWatchlist(params.id);
      setInWatchlist(false);
    } else {
      await addToWatchlist(params.id);
      setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
          <p className="text-muted-foreground">Movie ID: {params.id}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Available IDs: {Object.keys(MOCK_MOVIES).join(', ')}
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = `https://image.tmdb.org/t/p/original${movie.backdropPath}`;

  const movieSchema = generateMovieSchema(
    {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.posterPath,
      release_date: movie.releaseDate,
      rating: movie.rating,
      vote_count: 5000,
      genres: movie.genres,
      runtime: movie.runtime,
    },
    `https://moviedb.com/movie/${params.id}`
  );

  return (
    <>
      <StructuredData data={movieSchema} />
      <div className="min-h-screen bg-background">
        <Header />

      <div className="relative h-[600px] w-full overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <motion.div
          className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex gap-8 items-end">
            <motion.div
              className="flex-shrink-0 w-64 rounded-xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                alt={movie.title}
                className="w-full"
              />
            </motion.div>

            <div className="flex-1 pb-4">
              <motion.h1
                className="text-5xl font-bold mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {movie.title}
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground italic mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {movie.tagline}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-lg font-semibold">{movie.rating}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{movie.runtime} min</span>
                </div>
                {movie.genres.map((genre: string) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  size="lg"
                  onClick={handleWatchlistToggle}
                  className="gap-2"
                >
                  {inWatchlist ? (
                    <>
                      <Check className="h-5 w-5" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.section
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {movie.overview}
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h2 className="text-2xl font-bold mb-6">Cast</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {movie.cast.map((actor: any, index: number) => (
                  <motion.div
                    key={actor.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="aspect-[2/3] overflow-hidden bg-muted">
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profilePath}`}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <p className="font-semibold text-sm">{actor.name}</p>
                        <p className="text-xs text-muted-foreground">{actor.character}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Original Title</p>
                  <p className="font-medium">{movie.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">Released</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Runtime</p>
                  <p className="font-medium">{movie.runtime} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Release Date</p>
                  <p className="font-medium">
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </main>
      </div>
    </>
  );
}
