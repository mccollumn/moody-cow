// Spotify Web API service for real music data and playlist generation
import SpotifyWebApi from "spotify-web-api-node";
import { Track, Playlist } from "@/lib/features/musicSlice";

export interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface SpotifySearchOptions {
  mood: string;
  genre?: string[];
  artist?: string;
  limit?: number;
  market?: string;
  energyLevel?: number; // 0-1 scale
}

export interface SpotifyTrackFeatures {
  danceability: number;
  energy: number;
  valence: number; // musical positivity
  tempo: number;
  acousticness: number;
  instrumentalness: number;
}

export class SpotifyService {
  private static instance: SpotifyService;
  private spotifyApi: SpotifyWebApi;
  private isAuthenticated = false;

  // Mood to audio features mapping
  private moodToFeatures: Record<string, Partial<SpotifyTrackFeatures>> = {
    happy: { valence: 0.7, energy: 0.7, danceability: 0.6 },
    sad: { valence: 0.2, energy: 0.3, acousticness: 0.6 },
    energetic: { energy: 0.8, danceability: 0.8, tempo: 120 },
    calm: { energy: 0.3, valence: 0.5, acousticness: 0.7 },
    angry: { energy: 0.9, valence: 0.2, tempo: 140 },
    neutral: { valence: 0.5, energy: 0.5 },
    romantic: { valence: 0.6, energy: 0.4, acousticness: 0.5 },
    party: { danceability: 0.9, energy: 0.8, valence: 0.8 },
    focus: { energy: 0.4, instrumentalness: 0.6, acousticness: 0.3 },
    workout: { energy: 0.9, danceability: 0.7, tempo: 130 },
  };

  // Mood to genre mapping
  private moodToGenres: Record<string, string[]> = {
    happy: ["pop", "indie-pop", "funk", "soul", "dance"],
    sad: ["indie", "singer-songwriter", "blues", "folk", "ambient"],
    energetic: ["electronic", "dance", "house", "techno", "rock"],
    calm: ["ambient", "classical", "chill", "lo-fi", "acoustic"],
    angry: ["rock", "metal", "punk", "hard-rock", "alternative"],
    neutral: ["pop", "indie", "alternative", "rock"],
    romantic: ["r-n-b", "soul", "jazz", "indie", "acoustic"],
    party: ["dance", "pop", "electronic", "hip-hop", "funk"],
    focus: ["classical", "ambient", "instrumental", "lo-fi", "post-rock"],
    workout: ["electronic", "rock", "hip-hop", "pop", "dance"],
  };

  constructor(config: SpotifyConfig) {
    this.spotifyApi = new SpotifyWebApi({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    });
  }

  static getInstance(config?: SpotifyConfig): SpotifyService {
    if (!SpotifyService.instance && config) {
      SpotifyService.instance = new SpotifyService(config);
    }
    return SpotifyService.instance;
  }

  async authenticate(): Promise<void> {
    try {
      // Use client credentials flow for app-only authentication
      const data = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(data.body.access_token);
      this.isAuthenticated = true;

      // Set up token refresh
      setTimeout(() => {
        this.authenticate();
      }, (data.body.expires_in - 60) * 1000); // Refresh 1 minute before expiry

      console.log("Spotify authentication successful");
    } catch (error) {
      console.error("Spotify authentication failed:", error);
      throw new Error("Failed to authenticate with Spotify");
    }
  }

  async searchTracksByMood(options: SpotifySearchOptions): Promise<Track[]> {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      const { mood, genre, artist, limit = 20, market = "US" } = options;

      // Get genres for the mood
      const moodGenres =
        genre || this.moodToGenres[mood] || this.moodToGenres.neutral;
      const selectedGenre =
        moodGenres[Math.floor(Math.random() * moodGenres.length)];

      // Build search query
      let query = `genre:${selectedGenre}`;
      if (artist) {
        query += ` artist:${artist}`;
      }

      // Add mood-specific attributes to query
      const features = this.moodToFeatures[mood];
      if (features) {
        if (features.energy && features.energy > 0.7) query += " energy:high";
        if (features.valence && features.valence > 0.7)
          query += " valence:high";
        if (features.danceability && features.danceability > 0.7)
          query += " danceability:high";
      }

      const searchResult = await this.spotifyApi.searchTracks(query, {
        limit,
        market,
      });

      const tracks = searchResult.body.tracks?.items || [];
      return this.convertSpotifyTracksToTracks(tracks);
    } catch (error) {
      console.error("Error searching tracks by mood:", error);
      throw new Error("Failed to search tracks by mood");
    }
  }

  async generateMoodPlaylist(options: SpotifySearchOptions): Promise<Playlist> {
    const tracks = await this.searchTracksByMood(options);

    // If we don't have enough tracks, try with broader search
    if (tracks.length < (options.limit || 20) / 2) {
      const fallbackTracks = await this.searchTracksByMood({
        ...options,
        genre: undefined, // Remove genre restriction
      });
      tracks.push(
        ...fallbackTracks.slice(0, (options.limit || 20) - tracks.length)
      );
    }

    // Filter tracks by audio features if needed
    const filteredTracks = await this.filterTracksByAudioFeatures(
      tracks,
      options.mood,
      options.energyLevel
    );

    return {
      id: `mood-${options.mood}-${Date.now()}`,
      name: `${this.capitalizeMood(options.mood)} Vibes`,
      description: `A ${options.mood} playlist curated just for you`,
      mood: options.mood,
      genre: options.genre?.[0],
      energy: options.energyLevel,
      tracks: filteredTracks.slice(0, options.limit || 20),
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getTrackAudioFeatures(
    trackIds: string[]
  ): Promise<Record<string, SpotifyTrackFeatures>> {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      const features = await this.spotifyApi.getAudioFeaturesForTracks(
        trackIds
      );
      const result: Record<string, SpotifyTrackFeatures> = {};

      features.body.audio_features.forEach(
        (feature: SpotifyTrackFeatures | null, index: number) => {
          if (feature) {
            result[trackIds[index]] = {
              danceability: feature.danceability,
              energy: feature.energy,
              valence: feature.valence,
              tempo: feature.tempo,
              acousticness: feature.acousticness,
              instrumentalness: feature.instrumentalness,
            };
          }
        }
      );

      return result;
    } catch (error) {
      console.error("Error getting audio features:", error);
      return {};
    }
  }

  async getRecommendations(options: SpotifySearchOptions): Promise<Track[]> {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      const { mood, genre, limit = 20, market = "US" } = options;
      const features = this.moodToFeatures[mood] || this.moodToFeatures.neutral;
      const moodGenres =
        genre || this.moodToGenres[mood] || this.moodToGenres.neutral;

      const recommendations = await this.spotifyApi.getRecommendations({
        seed_genres: moodGenres.slice(0, 5), // Spotify allows max 5 seeds
        limit,
        market,
        target_energy: features.energy,
        target_valence: features.valence,
        target_danceability: features.danceability,
        target_tempo: features.tempo,
      });

      return this.convertSpotifyTracksToTracks(recommendations.body.tracks);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw new Error("Failed to get recommendations");
    }
  }

  private async filterTracksByAudioFeatures(
    tracks: Track[],
    mood: string,
    energyLevel?: number
  ): Promise<Track[]> {
    if (tracks.length === 0) return tracks;

    try {
      const trackIds = tracks.map((track) => track.spotifyId);
      const features = await this.getTrackAudioFeatures(trackIds);
      const moodFeatures = this.moodToFeatures[mood];

      return tracks.filter((track) => {
        const trackFeatures = features[track.spotifyId];
        if (!trackFeatures || !moodFeatures) return true;

        // Check if track matches mood criteria
        let matches = 0;
        let criteria = 0;

        if (moodFeatures.energy !== undefined) {
          criteria++;
          if (Math.abs(trackFeatures.energy - moodFeatures.energy) < 0.3)
            matches++;
        }

        if (moodFeatures.valence !== undefined) {
          criteria++;
          if (Math.abs(trackFeatures.valence - moodFeatures.valence) < 0.3)
            matches++;
        }

        if (energyLevel !== undefined) {
          criteria++;
          if (Math.abs(trackFeatures.energy - energyLevel) < 0.2) matches++;
        }

        // Track passes if it matches at least 60% of criteria
        return criteria === 0 || matches / criteria >= 0.6;
      });
    } catch (error) {
      console.warn("Error filtering tracks by audio features:", error);
      return tracks; // Return original tracks if filtering fails
    }
  }

  private convertSpotifyTracksToTracks(
    spotifyTracks: Array<{
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album?: { name?: string; images?: Array<{ url?: string }> };
      duration_ms: number;
      preview_url?: string | null;
    }>
  ): Track[] {
    return spotifyTracks.map((track) => ({
      spotifyId: track.id,
      name: track.name,
      artist: track.artists
        .map((artist: { name: string }) => artist.name)
        .join(", "),
      album: track.album?.name,
      duration: track.duration_ms,
      previewUrl: track.preview_url || undefined,
      imageUrl: track.album?.images?.[0]?.url,
    }));
  }

  private capitalizeMood(mood: string): string {
    return mood.charAt(0).toUpperCase() + mood.slice(1);
  }

  // Method to create actual Spotify playlist (requires user authentication)
  async createSpotifyPlaylist(
    userId: string,
    name: string,
    description: string,
    trackUris: string[]
  ): Promise<string> {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      // Create playlist
      const playlist = await this.spotifyApi.createPlaylist(name, {
        description,
        public: false,
      });

      // Add tracks to playlist
      if (trackUris.length > 0) {
        await this.spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);
      }

      return playlist.body.id;
    } catch (error) {
      console.error("Error creating Spotify playlist:", error);
      throw new Error("Failed to create Spotify playlist");
    }
  }
}

// Default instance with environment variables
export const spotifyService = SpotifyService.getInstance({
  clientId: process.env.SPOTIFY_CLIENT_ID || "",
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  redirectUri:
    process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/auth/callback",
});
