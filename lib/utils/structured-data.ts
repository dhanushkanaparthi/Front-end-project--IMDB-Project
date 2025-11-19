export interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  rating: number;
  vote_count: number;
  genres: string[];
  runtime?: number;
  director?: string;
}

export interface Actor {
  id: string;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string;
}

export function generateMovieSchema(movie: Movie, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview,
    image: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
    datePublished: movie.release_date,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: movie.rating,
      ratingCount: movie.vote_count,
      bestRating: 10,
      worstRating: 0,
    },
    genre: movie.genres,
    ...(movie.runtime && { duration: `PT${movie.runtime}M` }),
    ...(movie.director && {
      director: {
        '@type': 'Person',
        name: movie.director,
      },
    }),
    url,
  };
}

export function generatePersonSchema(actor: Actor, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: actor.name,
    description: actor.biography,
    birthDate: actor.birthday,
    birthPlace: actor.place_of_birth,
    image: `https://image.tmdb.org/t/p/original${actor.profile_path}`,
    url,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateReviewSchema(review: {
  author: string;
  rating: number;
  content: string;
  date: string;
  movieName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Movie',
      name: review.movieName,
    },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 10,
      worstRating: 0,
    },
    reviewBody: review.content,
    datePublished: review.date,
  };
}
