import { NextRequest, NextResponse } from "next/server";

// Mock preferences data - in production, this would come from database
let mockPreferences = {
  userId: "user_1",
  preferredGenres: ["pop", "rock", "indie"],
  preferredArtists: ["The Beatles", "Radiohead", "Taylor Swift"],
  energyLevel: 0.7,
  privacySettings: {
    cameraEnabled: true,
    textInputEnabled: true,
    shareData: false,
  },
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
  },
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    return NextResponse.json({
      preferences: mockPreferences,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch user preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();

    // Validate energy level if provided
    if (updates.energyLevel !== undefined) {
      if (
        typeof updates.energyLevel !== "number" ||
        updates.energyLevel < 0 ||
        updates.energyLevel > 1
      ) {
        return NextResponse.json(
          { error: "Energy level must be a number between 0 and 1" },
          { status: 400 }
        );
      }
    }

    // Validate genres if provided
    if (updates.preferredGenres !== undefined) {
      if (!Array.isArray(updates.preferredGenres)) {
        return NextResponse.json(
          { error: "Preferred genres must be an array" },
          { status: 400 }
        );
      }
    }

    // Validate artists if provided
    if (updates.preferredArtists !== undefined) {
      if (!Array.isArray(updates.preferredArtists)) {
        return NextResponse.json(
          { error: "Preferred artists must be an array" },
          { status: 400 }
        );
      }
    }

    // Update preferences
    mockPreferences = {
      ...mockPreferences,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      preferences: mockPreferences,
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update user preferences" },
      { status: 500 }
    );
  }
}
