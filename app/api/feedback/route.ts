import { NextRequest, NextResponse } from "next/server";

// Mock feedback data - in production, this would be stored in database
const mockFeedback: Array<{
  id: string;
  userId: string;
  trackId: string;
  playlistId: string;
  mood: string;
  rating: number;
  feedbackType: "like" | "dislike" | "skip" | "replay" | "rating";
  timestamp: string;
  context?: {
    timeOfDay?: string;
    deviceType?: string;
    sessionDuration?: number;
  };
}> = [];

export async function POST(request: NextRequest) {
  try {
    const { trackId, playlistId, mood, rating, feedbackType, context } =
      await request.json();

    // Validation
    if (!trackId || typeof trackId !== "string") {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    if (
      !feedbackType ||
      !["like", "dislike", "skip", "replay", "rating"].includes(feedbackType)
    ) {
      return NextResponse.json(
        {
          error:
            "Valid feedback type is required (like, dislike, skip, replay, rating)",
        },
        { status: 400 }
      );
    }

    if (
      feedbackType === "rating" &&
      (rating === undefined || rating < 1 || rating > 5)
    ) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 for rating feedback type" },
        { status: 400 }
      );
    }

    const feedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: "user_1", // In production, get from auth
      trackId,
      playlistId: playlistId || "",
      mood,
      rating: rating || 0,
      feedbackType,
      timestamp: new Date().toISOString(),
      context: context || {},
    };

    mockFeedback.push(feedback);

    // In a real app, this would trigger ML model updates
    console.log("Feedback received for learning:", feedback);

    return NextResponse.json({
      feedback,
      success: true,
      message: "Feedback recorded successfully",
    });
  } catch (error) {
    console.error("Error recording feedback:", error);
    return NextResponse.json(
      { error: "Failed to record feedback" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_1";
    const mood = searchParams.get("mood");
    const trackId = searchParams.get("trackId");

    let filteredFeedback = mockFeedback.filter((f) => f.userId === userId);

    if (mood) {
      filteredFeedback = filteredFeedback.filter((f) => f.mood === mood);
    }

    if (trackId) {
      filteredFeedback = filteredFeedback.filter((f) => f.trackId === trackId);
    }

    // Calculate aggregated stats
    const stats = {
      totalFeedback: filteredFeedback.length,
      averageRating:
        filteredFeedback.length > 0
          ? filteredFeedback.reduce((acc, f) => acc + f.rating, 0) /
            filteredFeedback.length
          : 0,
      feedbackByType: filteredFeedback.reduce((acc, f) => {
        acc[f.feedbackType] = (acc[f.feedbackType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      feedback: filteredFeedback,
      stats,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
