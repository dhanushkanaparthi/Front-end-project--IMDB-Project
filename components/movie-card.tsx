'use client';

import { motion } from 'framer-motion';
import { Star, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface MovieCardProps {
  id: string;
  title: string;
  posterPath: string | null;
  rating: number;
  releaseDate: string | null;
  onAddToWatchlist?: () => void;
  inWatchlist?: boolean;
}

export function MovieCard({
  id,
  title,
  posterPath,
  rating,
  releaseDate,
  onAddToWatchlist,
  inWatchlist = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/placeholder-movie.jpg';

  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

  const handleAddClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToWatchlist && !isAdding) {
      setIsAdding(true);
      await onAddToWatchlist();
      setTimeout(() => setIsAdding(false), 1000);
    }
  };

  return (
    <Link href={`/movie/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="overflow-hidden h-full cursor-pointer group">
          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            <motion.img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="absolute top-2 right-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="icon"
                variant={inWatchlist ? 'secondary' : 'default'}
                className="h-8 w-8 rounded-full"
                onClick={handleAddClick}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isAdding ? [1, 1.2, 1] : 1,
                    rotate: isAdding ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {inWatchlist ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </motion.div>
              </Button>
            </motion.div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
              {title}
            </h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{year}</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
