'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Film } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface ActorProfileProps {
  actor: {
    id: string;
    name: string;
    biography: string;
    birthday: string;
    place_of_birth: string;
    profile_path: string;
    known_for_department: string;
    also_known_as: string[];
    credits: Array<{
      id: string;
      title: string;
      character: string;
      year: string;
      poster: string;
    }>;
  };
}

export function ActorProfile({ actor }: ActorProfileProps) {
  const [yearFilter, setYearFilter] = useState<string>('all');
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredCredits = useMemo(() => {
    if (yearFilter === 'all') return actor.credits;
    return actor.credits.filter(credit => credit.year.startsWith(yearFilter));
  }, [actor.credits, yearFilter]);

  const rowVirtualizer = useVirtualizer({
    count: filteredCredits.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  const years = useMemo(() => {
    const uniqueYears = new Set(actor.credits.map(c => c.year.slice(0, 4)));
    return Array.from(uniqueYears).sort((a, b) => b.localeCompare(a));
  }, [actor.credits]);

  const imageUrl = `https://image.tmdb.org/t/p/w500${actor.profile_path}`;
  const age = actor.birthday ? new Date().getFullYear() - new Date(actor.birthday).getFullYear() : null;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.aside
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden sticky top-24">
            <div className="aspect-[2/3] overflow-hidden">
              <img
                src={imageUrl}
                alt={actor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{actor.name}</h2>
                <Badge variant="secondary">{actor.known_for_department}</Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Born</p>
                    <p className="font-medium">
                      {new Date(actor.birthday).toLocaleDateString()}
                      {age && ` (${age} years old)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Place of Birth</p>
                    <p className="font-medium">{actor.place_of_birth}</p>
                  </div>
                </div>

                {actor.also_known_as.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">Also Known As</p>
                    {actor.also_known_as.map((name, i) => (
                      <p key={i} className="font-medium text-sm">
                        {name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.aside>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Biography</h2>
            <p className="text-muted-foreground leading-relaxed">
              {actor.biography}
            </p>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Film className="h-8 w-8" />
                Filmography
              </h2>
              <div className="flex gap-2">
                <Badge
                  variant={yearFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setYearFilter('all')}
                >
                  All
                </Badge>
                {years.slice(0, 5).map(year => (
                  <Badge
                    key={year}
                    variant={yearFilter === year ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setYearFilter(year)}
                  >
                    {year}
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All ({filteredCredits.length})</TabsTrigger>
                <TabsTrigger value="movies">Movies</TabsTrigger>
                <TabsTrigger value="tv">TV Shows</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div
                  ref={parentRef}
                  className="h-[600px] overflow-auto"
                  style={{
                    contain: 'strict',
                  }}
                >
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const credit = filteredCredits[virtualRow.index];
                      return (
                        <motion.div
                          key={virtualRow.index}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: virtualRow.index * 0.05 }}
                        >
                          <Card className="mb-4 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex gap-4">
                              <div className="w-24 flex-shrink-0">
                                <img
                                  src={`https://image.tmdb.org/t/p/w185${credit.poster}`}
                                  alt={credit.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 py-4 pr-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold text-lg">{credit.title}</h3>
                                    <p className="text-muted-foreground">as {credit.character}</p>
                                  </div>
                                  <Badge variant="outline">{credit.year}</Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="movies">
                <p className="text-muted-foreground">Movie credits coming soon...</p>
              </TabsContent>

              <TabsContent value="tv">
                <p className="text-muted-foreground">TV credits coming soon...</p>
              </TabsContent>
            </Tabs>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
