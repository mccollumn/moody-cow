// Face-api.js service for real facial expression analysis
import * as faceapi from "face-api.js";

export interface FacialExpressionResult {
  mood: string;
  confidence: number;
  expressions: Record<string, number>;
  detectionTime: number;
}

export class FacialAnalysisService {
  private static instance: FacialAnalysisService;
  private isLoaded = false;
  private modelUrls = "/models"; // Models will be served from public/models

  static getInstance(): FacialAnalysisService {
    if (!FacialAnalysisService.instance) {
      FacialAnalysisService.instance = new FacialAnalysisService();
    }
    return FacialAnalysisService.instance;
  }

  async loadModels(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Load face-api.js models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelUrls),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelUrls),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.modelUrls),
        faceapi.nets.faceExpressionNet.loadFromUri(this.modelUrls),
      ]);

      this.isLoaded = true;
      console.log("Face-api.js models loaded successfully");
    } catch (error) {
      console.error("Error loading face-api.js models:", error);
      throw new Error("Failed to load facial analysis models");
    }
  }

  async analyzeFacialExpression(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<FacialExpressionResult> {
    if (!this.isLoaded) {
      await this.loadModels();
    }

    const startTime = Date.now();

    try {
      // Detect face with expressions
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (!detection) {
        throw new Error("No face detected in the image");
      }

      const expressions = detection.expressions;
      const detectionTime = Date.now() - startTime;

      // Convert face-api expressions to our mood categories
      const mood = this.expressionsToMood(expressions);
      const confidence = this.calculateConfidence(expressions, mood);

      return {
        mood,
        confidence,
        expressions: this.normalizeExpressions(expressions),
        detectionTime,
      };
    } catch (error) {
      console.error("Error analyzing facial expression:", error);
      throw new Error("Failed to analyze facial expression");
    }
  }

  private expressionsToMood(expressions: faceapi.FaceExpressions): string {
    // Map face-api expressions to our mood categories
    const getExpressionValue = (key: keyof faceapi.FaceExpressions): number => {
      const value = expressions[key];
      return typeof value === "number" ? value : 0;
    };

    const expressionValues = {
      happy: getExpressionValue("happy"),
      sad: getExpressionValue("sad"),
      angry: getExpressionValue("angry"),
      surprised: getExpressionValue("surprised"),
      fearful: getExpressionValue("fearful"),
      disgusted: getExpressionValue("disgusted"),
      neutral: getExpressionValue("neutral"),
    };

    // Find the dominant expression
    const dominantExpression = Object.entries(expressionValues).reduce(
      (prev, curr) => (prev[1] > curr[1] ? prev : curr)
    )[0];

    // Map to our mood categories
    const moodMapping: Record<string, string> = {
      happy: "happy",
      sad: "sad",
      angry: "angry",
      surprised: "surprise",
      fearful: "fear",
      disgusted: "disgust",
      neutral: "neutral",
    };

    return moodMapping[dominantExpression] || "neutral";
  }

  private calculateConfidence(
    expressions: faceapi.FaceExpressions,
    mood: string
  ): number {
    const moodToExpressionMap: Record<string, keyof faceapi.FaceExpressions> = {
      happy: "happy",
      sad: "sad",
      angry: "angry",
      surprise: "surprised",
      fear: "fearful",
      disgust: "disgusted",
      neutral: "neutral",
    };

    const expressionKey = moodToExpressionMap[mood];
    if (expressionKey && typeof expressions[expressionKey] === "number") {
      return expressions[expressionKey] as number;
    }
    return 0;
  }

  private normalizeExpressions(
    expressions: faceapi.FaceExpressions
  ): Record<string, number> {
    const normalizeValue = (value: unknown): number => {
      return typeof value === "number" ? Math.round(value * 100) / 100 : 0;
    };

    return {
      happy: normalizeValue(expressions.happy),
      sad: normalizeValue(expressions.sad),
      angry: normalizeValue(expressions.angry),
      surprised: normalizeValue(expressions.surprised),
      fearful: normalizeValue(expressions.fearful),
      disgusted: normalizeValue(expressions.disgusted),
      neutral: normalizeValue(expressions.neutral),
    };
  }

  async analyzeVideoStream(
    video: HTMLVideoElement
  ): Promise<FacialExpressionResult> {
    return this.analyzeFacialExpression(video);
  }

  async analyzeImageFile(file: File): Promise<FacialExpressionResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await this.analyzeFacialExpression(img);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }
}

export const facialAnalysisService = FacialAnalysisService.getInstance();
