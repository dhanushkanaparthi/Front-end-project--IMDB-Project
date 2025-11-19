/*
  # IMDB Project Database Schema
  
  This migration creates the complete database structure for a production-ready IMDB-style application
  with advanced features including offline sync, conflict resolution, and performance optimization.

  ## 1. New Tables
  
  ### `profiles`
  User profile data synchronized with auth.users
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User email
  - `full_name` (text) - Display name
  - `avatar_url` (text) - Profile image URL
  - `theme_preference` (text) - Theme setting (light/dark/auto/high-contrast)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `movies`
  Core movie data with TMDb integration
  - `id` (uuid, primary key)
  - `tmdb_id` (integer, unique) - TMDb API identifier
  - `title` (text) - Movie title
  - `original_title` (text) - Original language title
  - `overview` (text) - Plot summary
  - `poster_path` (text) - Poster image path
  - `backdrop_path` (text) - Backdrop image path
  - `release_date` (date) - Release date
  - `runtime` (integer) - Duration in minutes
  - `genres` (jsonb) - Array of genre objects
  - `vote_average` (numeric) - TMDb rating
  - `vote_count` (integer) - Number of votes
  - `popularity` (numeric) - TMDb popularity score
  - `status` (text) - Release status
  - `tagline` (text) - Movie tagline
  - `budget` (bigint) - Production budget
  - `revenue` (bigint) - Box office revenue
  - `imdb_id` (text) - IMDB identifier
  - `metadata` (jsonb) - Additional flexible data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `last_synced_at` (timestamptz) - Last TMDb sync

  ### `actors`
  Actor/person data with detailed information
  - `id` (uuid, primary key)
  - `tmdb_id` (integer, unique) - TMDb API identifier
  - `name` (text) - Actor name
  - `biography` (text) - Actor bio
  - `birthday` (date) - Birth date
  - `deathday` (date) - Death date (if applicable)
  - `place_of_birth` (text) - Birthplace
  - `profile_path` (text) - Profile image path
  - `popularity` (numeric) - TMDb popularity score
  - `gender` (integer) - Gender code (TMDb standard)
  - `known_for_department` (text) - Primary role (Acting/Directing/etc)
  - `also_known_as` (jsonb) - Alternate names array
  - `imdb_id` (text) - IMDB identifier
  - `homepage` (text) - Official website
  - `metadata` (jsonb) - Additional data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `last_synced_at` (timestamptz)

  ### `credits`
  Links actors to movies with role details
  - `id` (uuid, primary key)
  - `movie_id` (uuid, foreign key) - References movies
  - `actor_id` (uuid, foreign key) - References actors
  - `character_name` (text) - Character played
  - `credit_type` (text) - cast/crew
  - `department` (text) - Department (for crew)
  - `job` (text) - Specific job (for crew)
  - `order_position` (integer) - Billing order
  - `created_at` (timestamptz)

  ### `reviews`
  User reviews with revision history and voting
  - `id` (uuid, primary key)
  - `movie_id` (uuid, foreign key) - References movies
  - `user_id` (uuid, foreign key) - References profiles
  - `rating` (integer) - Rating 1-10
  - `title` (text) - Review title
  - `content` (text) - Review body
  - `is_published` (boolean) - Published status
  - `is_deleted` (boolean) - Soft delete flag
  - `version` (integer) - Revision counter
  - `helpful_count` (integer) - Helpful votes
  - `unhelpful_count` (integer) - Unhelpful votes
  - `wilson_score` (numeric) - Ranking score
  - `flagged_count` (integer) - Abuse flags
  - `moderation_status` (text) - approved/pending/rejected
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `published_at` (timestamptz)

  ### `review_revisions`
  Complete revision history for reviews
  - `id` (uuid, primary key)
  - `review_id` (uuid, foreign key) - References reviews
  - `version` (integer) - Version number
  - `title` (text) - Title at this version
  - `content` (text) - Content at this version
  - `rating` (integer) - Rating at this version
  - `edited_by` (uuid) - User who made edit
  - `created_at` (timestamptz)

  ### `review_votes`
  Helpful/unhelpful votes on reviews
  - `id` (uuid, primary key)
  - `review_id` (uuid, foreign key) - References reviews
  - `user_id` (uuid, foreign key) - References profiles
  - `vote_type` (text) - helpful/unhelpful
  - `created_at` (timestamptz)

  ### `review_drafts`
  Auto-saved drafts with offline support
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `movie_id` (uuid, foreign key) - References movies
  - `review_id` (uuid) - References reviews (if editing)
  - `rating` (integer)
  - `title` (text)
  - `content` (text)
  - `client_timestamp` (timestamptz) - Client-side save time
  - `vector_clock` (jsonb) - For conflict resolution
  - `sync_status` (text) - pending/synced/conflict
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `watchlists`
  User watchlists with offline sync support
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `movie_id` (uuid, foreign key) - References movies
  - `added_at` (timestamptz) - When added
  - `notes` (text) - Personal notes
  - `priority` (integer) - Watch priority
  - `watched` (boolean) - Watched status
  - `watched_at` (timestamptz) - When watched
  - `client_id` (text) - Client device identifier
  - `vector_clock` (jsonb) - For conflict resolution
  - `sync_version` (integer) - Sync version counter
  - `is_deleted` (boolean) - Soft delete flag
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `watchlist_sync_log`
  Tracks sync operations for conflict resolution
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `watchlist_id` (uuid, foreign key) - References watchlists
  - `operation` (text) - add/remove/update
  - `client_id` (text) - Client device identifier
  - `vector_clock` (jsonb) - Clock at operation time
  - `data_snapshot` (jsonb) - Data state
  - `created_at` (timestamptz)

  ### `theme_preferences`
  Per-user theme settings with sync support
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `theme_mode` (text) - light/dark/auto/high-contrast
  - `custom_colors` (jsonb) - Custom color overrides
  - `reduce_motion` (boolean) - Motion preference
  - `high_contrast` (boolean) - High contrast mode
  - `font_size` (text) - small/medium/large
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `api_cache`
  Server-side cache for TMDb API responses
  - `id` (uuid, primary key)
  - `cache_key` (text, unique) - Unique cache identifier
  - `endpoint` (text) - API endpoint
  - `response_data` (jsonb) - Cached response
  - `etag` (text) - ETag for validation
  - `tags` (text[]) - Cache invalidation tags
  - `expires_at` (timestamptz) - Expiration time
  - `hit_count` (integer) - Cache hit counter
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `rate_limits`
  Track API rate limiting per user/IP
  - `id` (uuid, primary key)
  - `identifier` (text) - User ID or IP address
  - `endpoint_pattern` (text) - API endpoint pattern
  - `tokens` (integer) - Available tokens
  - `last_refill` (timestamptz) - Last token refill
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  
  - Enable RLS on all tables
  - Profiles: Users can read all, update own
  - Movies/Actors: Public read, no direct writes (admin only via API)
  - Credits: Public read, no direct writes
  - Reviews: Users can CRUD own, read published others
  - Review operations: Users control own votes/drafts
  - Watchlists: Users can only access own data
  - Theme preferences: Users can only access own data
  - API cache: Public read for performance
  - Rate limits: System-managed only

  ## 3. Performance Indexes
  
  - Full-text search on movies and actors
  - Composite indexes for common queries
  - GIN indexes for JSONB fields
  - B-tree indexes for foreign keys and timestamps

  ## 4. Notes
  
  - Uses vector clocks for offline conflict resolution
  - Implements soft deletes for data recovery
  - Includes Wilson score for review ranking
  - Supports tag-based cache invalidation
  - Prepared for i18n with alternate titles/names
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  theme_preference text DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto', 'high-contrast')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id integer UNIQUE NOT NULL,
  title text NOT NULL,
  original_title text,
  overview text,
  poster_path text,
  backdrop_path text,
  release_date date,
  runtime integer,
  genres jsonb DEFAULT '[]'::jsonb,
  vote_average numeric(3,1) DEFAULT 0,
  vote_count integer DEFAULT 0,
  popularity numeric(10,3) DEFAULT 0,
  status text DEFAULT 'Released',
  tagline text,
  budget bigint DEFAULT 0,
  revenue bigint DEFAULT 0,
  imdb_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_synced_at timestamptz DEFAULT now()
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view movies"
  ON movies FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create actors table
CREATE TABLE IF NOT EXISTS actors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id integer UNIQUE NOT NULL,
  name text NOT NULL,
  biography text,
  birthday date,
  deathday date,
  place_of_birth text,
  profile_path text,
  popularity numeric(10,3) DEFAULT 0,
  gender integer DEFAULT 0,
  known_for_department text,
  also_known_as jsonb DEFAULT '[]'::jsonb,
  imdb_id text,
  homepage text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_synced_at timestamptz DEFAULT now()
);

ALTER TABLE actors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view actors"
  ON actors FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create credits table
CREATE TABLE IF NOT EXISTS credits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  character_name text,
  credit_type text NOT NULL CHECK (credit_type IN ('cast', 'crew')),
  department text,
  job text,
  order_position integer DEFAULT 999,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view credits"
  ON credits FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  title text NOT NULL,
  content text NOT NULL,
  is_published boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  version integer DEFAULT 1,
  helpful_count integer DEFAULT 0,
  unhelpful_count integer DEFAULT 0,
  wilson_score numeric(10,8) DEFAULT 0,
  flagged_count integer DEFAULT 0,
  moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reviews"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (is_published = true AND is_deleted = false);

CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create review_revisions table
CREATE TABLE IF NOT EXISTS review_revisions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL,
  edited_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view revisions of accessible reviews"
  ON review_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id = review_revisions.review_id
      AND (reviews.user_id = auth.uid() OR reviews.is_published = true)
    )
  );

-- Create review_votes table
CREATE TABLE IF NOT EXISTS review_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all votes"
  ON review_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own votes"
  ON review_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON review_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON review_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create review_drafts table
CREATE TABLE IF NOT EXISTS review_drafts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 10),
  title text,
  content text,
  client_timestamp timestamptz NOT NULL,
  vector_clock jsonb DEFAULT '{}'::jsonb,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE review_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own drafts"
  ON review_drafts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  notes text,
  priority integer DEFAULT 0,
  watched boolean DEFAULT false,
  watched_at timestamptz,
  client_id text NOT NULL,
  vector_clock jsonb DEFAULT '{}'::jsonb,
  sync_version integer DEFAULT 0,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watchlist"
  ON watchlists FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create watchlist_sync_log table
CREATE TABLE IF NOT EXISTS watchlist_sync_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  watchlist_id uuid REFERENCES watchlists(id) ON DELETE CASCADE,
  operation text NOT NULL CHECK (operation IN ('add', 'remove', 'update')),
  client_id text NOT NULL,
  vector_clock jsonb DEFAULT '{}'::jsonb,
  data_snapshot jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE watchlist_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync log"
  ON watchlist_sync_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create theme_preferences table
CREATE TABLE IF NOT EXISTS theme_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme_mode text DEFAULT 'auto' CHECK (theme_mode IN ('light', 'dark', 'auto', 'high-contrast')),
  custom_colors jsonb DEFAULT '{}'::jsonb,
  reduce_motion boolean DEFAULT false,
  high_contrast boolean DEFAULT false,
  font_size text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE theme_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own theme"
  ON theme_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create api_cache table
CREATE TABLE IF NOT EXISTS api_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key text UNIQUE NOT NULL,
  endpoint text NOT NULL,
  response_data jsonb NOT NULL,
  etag text,
  tags text[] DEFAULT ARRAY[]::text[],
  expires_at timestamptz NOT NULL,
  hit_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache for performance"
  ON api_cache FOR SELECT
  TO authenticated, anon
  USING (expires_at > now());

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier text NOT NULL,
  endpoint_pattern text NOT NULL,
  tokens integer NOT NULL DEFAULT 0,
  last_refill timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(identifier, endpoint_pattern)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access to rate_limits (system managed)

-- Create indexes for performance

-- Movies indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movies(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_movies_vote_average ON movies(vote_average DESC);
CREATE INDEX IF NOT EXISTS idx_movies_title_trgm ON movies USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_movies_genres ON movies USING gin(genres);

-- Actors indexes
CREATE INDEX IF NOT EXISTS idx_actors_tmdb_id ON actors(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_actors_name_trgm ON actors USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_actors_popularity ON actors(popularity DESC);

-- Credits indexes
CREATE INDEX IF NOT EXISTS idx_credits_movie_id ON credits(movie_id);
CREATE INDEX IF NOT EXISTS idx_credits_actor_id ON credits(actor_id);
CREATE INDEX IF NOT EXISTS idx_credits_order ON credits(order_position);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_wilson_score ON reviews(wilson_score DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published, is_deleted);

-- Review operations indexes
CREATE INDEX IF NOT EXISTS idx_review_revisions_review_id ON review_revisions(review_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_drafts_user_movie ON review_drafts(user_id, movie_id);

-- Watchlist indexes
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_movie_id ON watchlists(movie_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_sync ON watchlists(user_id, sync_version);
CREATE INDEX IF NOT EXISTS idx_watchlist_sync_log_user ON watchlist_sync_log(user_id, created_at DESC);

-- API cache indexes
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_tags ON api_cache USING gin(tags);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, endpoint_pattern);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actors_updated_at BEFORE UPDATE ON actors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_drafts_updated_at BEFORE UPDATE ON review_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theme_preferences_updated_at BEFORE UPDATE ON theme_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_cache_updated_at BEFORE UPDATE ON api_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();