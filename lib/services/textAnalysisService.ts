// Sentiment analysis service for text-based mood detection
export interface TextSentimentResult {
  mood: string;
  confidence: number;
  score: number;
  comparative: number;
  words: string[];
  positive: string[];
  negative: string[];
}

interface AnalysisResult {
  score: number;
  comparative: number;
  words: string[];
  positive: string[];
  negative: string[];
}

export class TextAnalysisService {
  private static instance: TextAnalysisService;

  // Simple sentiment word lists for basic analysis
  private positiveWords = [
    "happy",
    "joy",
    "excited",
    "awesome",
    "great",
    "fantastic",
    "wonderful",
    "love",
    "amazing",
    "brilliant",
    "cheerful",
    "delighted",
    "pleased",
    "satisfied",
    "thrilled",
    "ecstatic",
    "elated",
    "euphoric",
    "motivated",
    "inspired",
    "energetic",
    "pumped",
    "enthusiastic",
    "passionate",
    "optimistic",
  ];

  private negativeWords = [
    "sad",
    "angry",
    "frustrated",
    "upset",
    "disappointed",
    "depressed",
    "miserable",
    "awful",
    "terrible",
    "horrible",
    "hate",
    "furious",
    "annoyed",
    "irritated",
    "worried",
    "anxious",
    "stressed",
    "overwhelmed",
    "exhausted",
    "tired",
    "lonely",
    "hurt",
    "betrayed",
    "devastated",
    "heartbroken",
  ];

  private calmWords = [
    "peaceful",
    "relaxed",
    "serene",
    "tranquil",
    "quiet",
    "gentle",
    "soothing",
    "meditative",
    "zen",
  ];
  private energeticWords = [
    "energetic",
    "pumped",
    "motivated",
    "active",
    "dynamic",
    "vigorous",
    "lively",
    "spirited",
  ];

  static getInstance(): TextAnalysisService {
    if (!TextAnalysisService.instance) {
      TextAnalysisService.instance = new TextAnalysisService();
    }
    return TextAnalysisService.instance;
  }

  // Custom sentiment analysis without external dependencies
  private performSentimentAnalysis(text: string): AnalysisResult {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const positive: string[] = [];
    const negative: string[] = [];

    let score = 0;

    words.forEach((word) => {
      if (this.positiveWords.includes(word)) {
        positive.push(word);
        score += 1;
      } else if (this.negativeWords.includes(word)) {
        negative.push(word);
        score -= 1;
      }
    });

    const comparative = words.length > 0 ? score / words.length : 0;

    return {
      score,
      comparative,
      words,
      positive,
      negative,
    };
  }

  analyzeSentiment(text: string): TextSentimentResult {
    if (!text || text.trim().length === 0) {
      throw new Error("Text input is required for sentiment analysis");
    }

    const result = this.performSentimentAnalysis(text);
    const mood = this.scoreToMood(result.score, result.comparative);
    const confidence = this.calculateConfidence(
      result.score,
      result.comparative
    );

    return {
      mood,
      confidence,
      score: result.score,
      comparative: result.comparative,
      words: result.words,
      positive: result.positive,
      negative: result.negative,
    };
  }

  private scoreToMood(score: number, comparative: number): string {
    // Use both absolute score and comparative score for better accuracy
    const normalizedScore = comparative;

    if (normalizedScore >= 0.5) return "happy";
    if (normalizedScore >= 0.1) return "energetic";
    if (normalizedScore >= -0.1) return "neutral";
    if (normalizedScore >= -0.3) return "sad";
    if (normalizedScore >= -0.5) return "angry";
    return "sad";
  }

  private calculateConfidence(score: number, comparative: number): number {
    // Calculate confidence based on the strength of the sentiment
    const absComparative = Math.abs(comparative);

    // Normalize confidence to 0-1 range
    // Higher absolute comparative scores indicate stronger sentiment
    if (absComparative >= 0.5) return 0.9;
    if (absComparative >= 0.3) return 0.8;
    if (absComparative >= 0.1) return 0.7;
    if (absComparative >= 0.05) return 0.6;
    return 0.5; // Minimum confidence for any text input
  }

  // Enhanced mood detection with keyword analysis
  analyzeEnhancedMood(text: string): TextSentimentResult {
    const basicResult = this.analyzeSentiment(text);

    // Define mood keywords for better classification
    const moodKeywords = {
      happy: [
        "joy",
        "excited",
        "awesome",
        "great",
        "fantastic",
        "wonderful",
        "love",
        "amazing",
        "brilliant",
        "cheerful",
      ],
      energetic: [
        "pumped",
        "motivated",
        "active",
        "dynamic",
        "vigorous",
        "lively",
        "spirited",
        "enthusiastic",
      ],
      calm: [
        "peaceful",
        "relaxed",
        "serene",
        "tranquil",
        "quiet",
        "gentle",
        "soothing",
        "meditative",
      ],
      sad: [
        "sad",
        "depressed",
        "down",
        "blue",
        "melancholy",
        "heartbroken",
        "disappointed",
        "grieving",
      ],
      angry: [
        "angry",
        "furious",
        "mad",
        "irritated",
        "frustrated",
        "annoyed",
        "rage",
        "livid",
      ],
      anxious: [
        "anxious",
        "worried",
        "nervous",
        "stressed",
        "tense",
        "concerned",
        "uneasy",
        "restless",
      ],
      neutral: [
        "okay",
        "fine",
        "normal",
        "usual",
        "typical",
        "standard",
        "regular",
      ],
    };

    const lowerText = text.toLowerCase();
    let keywordMood = "neutral";
    let maxKeywordMatches = 0;

    // Count keyword matches for each mood
    Object.entries(moodKeywords).forEach(([mood, keywords]) => {
      const matches = keywords.filter((keyword) =>
        lowerText.includes(keyword)
      ).length;
      if (matches > maxKeywordMatches) {
        maxKeywordMatches = matches;
        keywordMood = mood;
      }
    });

    // If we found significant keyword matches, use that mood with higher confidence
    if (maxKeywordMatches > 0) {
      return {
        ...basicResult,
        mood: keywordMood,
        confidence: Math.min(0.95, basicResult.confidence + 0.2), // Boost confidence
      };
    }

    return basicResult;
  }

  // Detect energy level from text
  detectEnergyLevel(text: string): "low" | "medium" | "high" {
    const energyKeywords = {
      high: [
        "excited",
        "pumped",
        "energetic",
        "hyped",
        "thrilled",
        "enthusiastic",
        "vibrant",
      ],
      low: [
        "tired",
        "exhausted",
        "sleepy",
        "drained",
        "weary",
        "lethargic",
        "sluggish",
      ],
    };

    const lowerText = text.toLowerCase();
    const highEnergyMatches = energyKeywords.high.filter((keyword) =>
      lowerText.includes(keyword)
    ).length;
    const lowEnergyMatches = energyKeywords.low.filter((keyword) =>
      lowerText.includes(keyword)
    ).length;

    if (highEnergyMatches > lowEnergyMatches) return "high";
    if (lowEnergyMatches > highEnergyMatches) return "low";
    return "medium";
  }

  // Get mood suggestions based on detected sentiment
  getMoodSuggestions(mood: string): string[] {
    const suggestions: Record<string, string[]> = {
      happy: [
        "Keep the positive vibes going!",
        "Share your joy with uplifting music",
        "Celebrate this moment",
      ],
      energetic: [
        "Channel that energy into action",
        "Try some upbeat, motivational tracks",
        "Get moving with high-tempo music",
      ],
      calm: [
        "Embrace the tranquility",
        "Enjoy some peaceful, ambient sounds",
        "Take time to relax and reflect",
      ],
      sad: [
        "It's okay to feel this way",
        "Try some comforting music",
        "Be gentle with yourself",
      ],
      angry: [
        "Take deep breaths",
        "Try some calming music to cool down",
        "Channel that energy positively",
      ],
      anxious: [
        "Focus on breathing",
        "Try some relaxing, meditative music",
        "Ground yourself in the present",
      ],
      neutral: [
        "Explore different music styles",
        "Maybe try something new today",
        "See what mood strikes you",
      ],
    };

    return suggestions[mood] || suggestions.neutral;
  }
}

export const textAnalysisService = TextAnalysisService.getInstance();
