import { NextRequest, NextResponse } from "next/server";
import { spotifyService } from "@/lib/services/spotifyService";

// Fallback mock data for when Spotify API is unavailable
const MOCK_TRACKS = {
  happy: [
    {
      spotifyId: "track_happy_1",
      name: "Happy",
      artist: "Pharrell Williams",
      album: "Girl",
      duration: 232000,
      previewUrl: "https://example.com/preview1.mp3",
      imageUrl: "https://via.placeholder.com/300x300/FFD93D/000000?text=Happy",
    },
    {
      spotifyId: "track_happy_2",
      name: "Good as Hell",
      artist: "Lizzo",
      album: "Cuz I Love You",
      duration: 219000,
      previewUrl: "https://example.com/preview2.mp3",
      imageUrl: "https://via.placeholder.com/300x300/FFD93D/000000?text=Good",
    },
  ],
  sad: [
    {
      spotifyId: "track_sad_1",
      name: "Someone Like You",
      artist: "Adele",
      album: "21",
      duration: 285000,
      previewUrl: "https://example.com/preview4.mp3",
      imageUrl:
        "https://via.placeholder.com/300x300/6BB6FF/FFFFFF?text=Someone",
    },
  ],
  energetic: [
    {
      spotifyId: "track_energetic_1",
      name: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      album: "Uptown Special",
      duration: 270000,
      previewUrl: "https://example.com/preview6.mp3",
      imageUrl: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Uptown",
    },
  ],
  calm: [
    {
      spotifyId: "track_calm_1",
      name: "Weightless",
      artist: "Marconi Union",
      album: "Ambient",
      duration: 485000,
      previewUrl: "https://example.com/preview8.mp3",
      imageUrl: "https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Weight",
    },
  ],
  neutral: [
    {
      spotifyId: "track_neutral_1",
      name: "Perfect",
      artist: "Ed Sheeran",
      album: "÷ (Divide)",
      duration: 263000,
      previewUrl: "https://example.com/preview10.mp3",
      imageUrl:
        "https://via.placeholder.com/300x300/C7C7C7/000000?text=Perfect",
    },
  ],
};

function generateFallbackPlaylist(mood: string, limit: number = 20) {
  const normalizedMood = mood.toLowerCase();
  let trackMood = normalizedMood;

  // Map similar moods
  if (["angry", "frustrated"].includes(normalizedMood)) {
    trackMood = "energetic";
  } else if (["fear", "anxious"].includes(normalizedMood)) {
    trackMood = "calm";
  } else if (["surprise", "excited"].includes(normalizedMood)) {
    trackMood = "happy";
  } else if (["disgust", "disappointed"].includes(normalizedMood)) {
    trackMood = "sad";
  }

  const tracks =
    MOCK_TRACKS[trackMood as keyof typeof MOCK_TRACKS] || MOCK_TRACKS.neutral;

  // Duplicate tracks to reach limit if needed
  const expandedTracks = [];
  while (expandedTracks.length < limit) {
    expandedTracks.push(...tracks);
  }

  const selectedTracks = expandedTracks.slice(0, limit);

  return {
    id: `fallback-${mood}-${Date.now()}`,
    name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`,
    description: `A ${mood} playlist (fallback mode)`,
    mood,
    tracks: selectedTracks,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mood, genre, artists, energyLevel, limit = 20 } = body;

    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    // Try to use Spotify service first
    try {
      const playlist = await spotifyService.generateMoodPlaylist({
        mood,
        genre,
        artist: artists?.[0], // Use first artist if provided
        energyLevel,
        limit,
      });

      return NextResponse.json({
        success: true,
        playlist,
        source: "spotify",
      });
    } catch (spotifyError) {
      console.warn("Spotify API failed, using fallback:", spotifyError);

      // Fallback to mock data if Spotify fails
      const fallbackPlaylist = generateFallbackPlaylist(mood, limit);

      return NextResponse.json({
        success: true,
        playlist: fallbackPlaylist,
        source: "fallback",
        warning: "Using fallback data due to Spotify API unavailability",
      });
    }
  } catch (error) {
    console.error("Error generating playlist:", error);
    return NextResponse.json(
      {
        error: "Failed to generate playlist",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
