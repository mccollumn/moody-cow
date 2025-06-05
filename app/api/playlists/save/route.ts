import { NextRequest, NextResponse } from "next/server";

// Mock saved playlists - in production, this would come from database
const mockSavedPlaylists: Array<{
  id: string;
  name: string;
  description: string;
  mood: string;
  tracks: Array<{
    spotifyId: string;
    name: string;
    artist: string;
    album: string;
    duration: number;
    previewUrl?: string;
    imageUrl?: string;
  }>;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}> = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_1";

    const userPlaylists = mockSavedPlaylists.filter(
      (playlist) => playlist.userId === userId
    );

    return NextResponse.json({
      playlists: userPlaylists,
      total: userPlaylists.length,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching saved playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved playlists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      description,
      mood,
      tracks,
      isPublic = false,
    } = await request.json();

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Playlist name is required" },
        { status: 400 }
      );
    }

    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json(
        { error: "Tracks array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const newPlaylist = {
      id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || `A ${mood} playlist`,
      mood,
      tracks,
      userId: "user_1", // In production, get from auth
      isPublic: Boolean(isPublic),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSavedPlaylists.push(newPlaylist);

    return NextResponse.json({
      playlist: newPlaylist,
      success: true,
      message: "Playlist saved successfully",
    });
  } catch (error) {
    console.error("Error saving playlist:", error);
    return NextResponse.json(
      { error: "Failed to save playlist" },
      { status: 500 }
    );
  }
}
