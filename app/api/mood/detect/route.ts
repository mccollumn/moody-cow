import { NextRequest, NextResponse } from "next/server";

// Mock sentiment analysis - in production, use a proper sentiment analysis library
const analyzeSentiment = (text: string) => {
  const positiveWords = [
    "happy",
    "joy",
    "excited",
    "love",
    "great",
    "amazing",
    "wonderful",
    "fantastic",
    "excellent",
    "good",
  ];
  const negativeWords = [
    "sad",
    "angry",
    "hate",
    "terrible",
    "awful",
    "bad",
    "horrible",
    "disappointed",
    "frustrated",
    "upset",
  ];
  const energeticWords = [
    "energetic",
    "pumped",
    "hyped",
    "active",
    "dynamic",
    "vigorous",
  ];
  const calmWords = [
    "calm",
    "peaceful",
    "relaxed",
    "serene",
    "tranquil",
    "mellow",
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;
  let energeticScore = 0;
  let calmScore = 0;

  words.forEach((word) => {
    if (positiveWords.some((pw) => word.includes(pw))) positiveScore++;
    if (negativeWords.some((nw) => word.includes(nw))) negativeScore++;
    if (energeticWords.some((ew) => word.includes(ew))) energeticScore++;
    if (calmWords.some((cw) => word.includes(cw))) calmScore++;
  });

  // Determine dominant mood
  const scores = {
    happy: positiveScore,
    sad: negativeScore,
    energetic: energeticScore,
    calm: calmScore,
    neutral: Math.max(
      0,
      words.length - positiveScore - negativeScore - energeticScore - calmScore
    ),
  };

  const dominantMood = Object.entries(scores).reduce((a, b) =>
    scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores]
      ? a
      : b
  )[0] as keyof typeof scores;
  const confidence = Math.min(
    0.95,
    Math.max(0.1, scores[dominantMood] / words.length)
  );

  return { mood: dominantMood, confidence };
};

// Mock facial expression analysis - in production, use face-api.js or similar
const analyzeFacialExpression = async () => {
  // This is a mock implementation
  // In a real app, you would:
  // 1. Decode the base64 image
  // 2. Use face-api.js or TensorFlow.js model to detect facial expressions
  // 3. Return the detected mood and confidence

  const moods = ["happy", "sad", "angry", "surprise", "fear", "neutral"];
  const randomMood = moods[Math.floor(Math.random() * moods.length)];
  const confidence = 0.6 + Math.random() * 0.3; // Random confidence between 0.6-0.9

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { mood: randomMood, confidence };
};

export async function POST(request: NextRequest) {
  try {
    const { method, inputData, imageData } = await request.json();

    if (!method || (method !== "facial" && method !== "text")) {
      return NextResponse.json(
        { error: 'Invalid method. Must be "facial" or "text"' },
        { status: 400 }
      );
    }

    let result;

    if (method === "text") {
      if (!inputData || typeof inputData !== "string") {
        return NextResponse.json(
          { error: "inputData is required for text analysis" },
          { status: 400 }
        );
      }
      result = analyzeSentiment(inputData);
    } else if (method === "facial") {
      if (!imageData || typeof imageData !== "string") {
        return NextResponse.json(
          { error: "imageData is required for facial analysis" },
          { status: 400 }
        );
      }
      result = await analyzeFacialExpression();
    }

    return NextResponse.json({
      ...result,
      method,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Mood detection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
