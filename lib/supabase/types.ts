export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          theme_preference: 'light' | 'dark' | 'auto' | 'high-contrast'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          theme_preference?: 'light' | 'dark' | 'auto' | 'high-contrast'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          theme_preference?: 'light' | 'dark' | 'auto' | 'high-contrast'
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          tmdb_id: number
          title: string
          original_title: string | null
          overview: string | null
          poster_path: string | null
          backdrop_path: string | null
          release_date: string | null
          runtime: number | null
          genres: Json
          vote_average: number
          vote_count: number
          popularity: number
          status: string | null
          tagline: string | null
          budget: number
          revenue: number
          imdb_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
          last_synced_at: string
        }
        Insert: {
          id?: string
          tmdb_id: number
          title: string
          original_title?: string | null
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          runtime?: number | null
          genres?: Json
          vote_average?: number
          vote_count?: number
          popularity?: number
          status?: string | null
          tagline?: string | null
          budget?: number
          revenue?: number
          imdb_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          last_synced_at?: string
        }
        Update: {
          id?: string
          tmdb_id?: number
          title?: string
          original_title?: string | null
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          runtime?: number | null
          genres?: Json
          vote_average?: number
          vote_count?: number
          popularity?: number
          status?: string | null
          tagline?: string | null
          budget?: number
          revenue?: number
          imdb_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          last_synced_at?: string
        }
      }
      actors: {
        Row: {
          id: string
          tmdb_id: number
          name: string
          biography: string | null
          birthday: string | null
          deathday: string | null
          place_of_birth: string | null
          profile_path: string | null
          popularity: number
          gender: number
          known_for_department: string | null
          also_known_as: Json
          imdb_id: string | null
          homepage: string | null
          metadata: Json
          created_at: string
          updated_at: string
          last_synced_at: string
        }
        Insert: {
          id?: string
          tmdb_id: number
          name: string
          biography?: string | null
          birthday?: string | null
          deathday?: string | null
          place_of_birth?: string | null
          profile_path?: string | null
          popularity?: number
          gender?: number
          known_for_department?: string | null
          also_known_as?: Json
          imdb_id?: string | null
          homepage?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          last_synced_at?: string
        }
        Update: {
          id?: string
          tmdb_id?: number
          name?: string
          biography?: string | null
          birthday?: string | null
          deathday?: string | null
          place_of_birth?: string | null
          profile_path?: string | null
          popularity?: number
          gender?: number
          known_for_department?: string | null
          also_known_as?: Json
          imdb_id?: string | null
          homepage?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          last_synced_at?: string
        }
      }
      credits: {
        Row: {
          id: string
          movie_id: string
          actor_id: string
          character_name: string | null
          credit_type: 'cast' | 'crew'
          department: string | null
          job: string | null
          order_position: number
          created_at: string
        }
        Insert: {
          id?: string
          movie_id: string
          actor_id: string
          character_name?: string | null
          credit_type: 'cast' | 'crew'
          department?: string | null
          job?: string | null
          order_position?: number
          created_at?: string
        }
        Update: {
          id?: string
          movie_id?: string
          actor_id?: string
          character_name?: string | null
          credit_type?: 'cast' | 'crew'
          department?: string | null
          job?: string | null
          order_position?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          movie_id: string
          user_id: string
          rating: number
          title: string
          content: string
          is_published: boolean
          is_deleted: boolean
          version: number
          helpful_count: number
          unhelpful_count: number
          wilson_score: number
          flagged_count: number
          moderation_status: 'approved' | 'pending' | 'rejected'
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          movie_id: string
          user_id: string
          rating: number
          title: string
          content: string
          is_published?: boolean
          is_deleted?: boolean
          version?: number
          helpful_count?: number
          unhelpful_count?: number
          wilson_score?: number
          flagged_count?: number
          moderation_status?: 'approved' | 'pending' | 'rejected'
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          movie_id?: string
          user_id?: string
          rating?: number
          title?: string
          content?: string
          is_published?: boolean
          is_deleted?: boolean
          version?: number
          helpful_count?: number
          unhelpful_count?: number
          wilson_score?: number
          flagged_count?: number
          moderation_status?: 'approved' | 'pending' | 'rejected'
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          movie_id: string
          added_at: string
          notes: string | null
          priority: number
          watched: boolean
          watched_at: string | null
          client_id: string
          vector_clock: Json
          sync_version: number
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: string
          added_at?: string
          notes?: string | null
          priority?: number
          watched?: boolean
          watched_at?: string | null
          client_id: string
          vector_clock?: Json
          sync_version?: number
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string
          added_at?: string
          notes?: string | null
          priority?: number
          watched?: boolean
          watched_at?: string | null
          client_id?: string
          vector_clock?: Json
          sync_version?: number
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      theme_preferences: {
        Row: {
          id: string
          user_id: string
          theme_mode: 'light' | 'dark' | 'auto' | 'high-contrast'
          custom_colors: Json
          reduce_motion: boolean
          high_contrast: boolean
          font_size: 'small' | 'medium' | 'large'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme_mode?: 'light' | 'dark' | 'auto' | 'high-contrast'
          custom_colors?: Json
          reduce_motion?: boolean
          high_contrast?: boolean
          font_size?: 'small' | 'medium' | 'large'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme_mode?: 'light' | 'dark' | 'auto' | 'high-contrast'
          custom_colors?: Json
          reduce_motion?: boolean
          high_contrast?: boolean
          font_size?: 'small' | 'medium' | 'large'
          created_at?: string
          updated_at?: string
        }
      }
      api_cache: {
        Row: {
          id: string
          cache_key: string
          endpoint: string
          response_data: Json
          etag: string | null
          tags: string[]
          expires_at: string
          hit_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cache_key: string
          endpoint: string
          response_data: Json
          etag?: string | null
          tags?: string[]
          expires_at: string
          hit_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cache_key?: string
          endpoint?: string
          response_data?: Json
          etag?: string | null
          tags?: string[]
          expires_at?: string
          hit_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
