import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Schema for meta-affirmations response
const MetaAffirmationResponseSchema = z.object({
  insights: z.object({
    primaryPattern: z.string().describe("The main recurring pattern identified across all thoughts"),
    rootCause: z.string().describe("The underlying belief or fear driving these patterns"),
    recommendation: z.string().describe("Brief recommendation for the user's growth journey"),
  }),
  metaAffirmations: z.array(
    z.object({
      text: z.string().describe("A powerful root-cause affirmation addressing the core pattern"),
      targetPattern: z.string().describe("Which pattern this affirmation specifically addresses"),
      explanation: z.string().describe("Why this affirmation targets the root cause"),
    })
  ).min(1).max(3),
});

const META_SYSTEM_PROMPT = `You are an expert in the Self-Talk Solution methodology and cognitive behavioral therapy. Your role is to analyze a user's OVERALL pattern of negative thoughts and create powerful "meta-affirmations" that address ROOT CAUSES rather than surface-level symptoms.

## Your Task:
Given a user's history of cognitive distortions and thought themes, identify the DEEPER patterns and create 1-3 transformative affirmations that address the underlying beliefs.

## Guidelines:
1. Look for connections between different thoughts - what's the common thread?
2. Identify the core fear or limiting belief driving multiple surface thoughts
3. Create affirmations that would address MANY of their issues at once
4. Use present tense, personal "I" statements
5. Make them powerful but believable
6. Focus on identity-level change (Level 4 Self-Talk)

## Example:
If a user has thoughts about "not being good enough at work", "fear of judgment from colleagues", and "imposter syndrome", the root cause might be "seeking external validation for self-worth". A meta-affirmation would be: "My worth comes from within. I am enough exactly as I am, regardless of others' opinions."`;

export async function POST(req: Request) {
  try {
    // Require authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Get user patterns
    const patterns = await convex.query(api.queries.getUserPatternsByClerkId, { clerkId: userId });

    if (!patterns) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!patterns.isPro) {
      return NextResponse.json(
        { error: "Meta-affirmations are a Pro feature" },
        { status: 403 }
      );
    }

    if (patterns.totalTransformations < 5) {
      return NextResponse.json(
        { error: "Need at least 5 transformations to generate meta-affirmations", required: 5, current: patterns.totalTransformations },
        { status: 400 }
      );
    }

    // Get more detailed pattern data for the AI
    const detailedPatterns = await convex.query(api.queries.getUserPatterns);

    // Build the prompt with user's pattern history
    const distortionsList = patterns.topDistortions.length > 0
      ? patterns.topDistortions.join(", ")
      : "various cognitive distortions";

    const themesList = patterns.topThemes.length > 0
      ? patterns.topThemes.join(", ")
      : "various life areas";

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: MetaAffirmationResponseSchema,
      system: META_SYSTEM_PROMPT,
      prompt: `Analyze this user's thought patterns and generate meta-affirmations:

## User's Pattern History (${patterns.totalTransformations} transformations):

**Top Cognitive Distortions:**
${distortionsList}

**Common Themes:**
${themesList}

Based on these patterns, identify the ROOT CAUSE driving their negative self-talk and create 1-3 powerful meta-affirmations that address the underlying beliefs, not just surface symptoms.`,
    });

    return NextResponse.json({
      insights: object.insights,
      metaAffirmations: object.metaAffirmations.map((aff, index) => ({
        id: `meta-${Date.now()}-${index}`,
        ...aff,
      })),
      patternsAnalyzed: patterns.totalTransformations,
    });
  } catch (error) {
    console.error("Error generating meta-affirmations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to generate meta-affirmations", details: errorMessage },
      { status: 500 }
    );
  }
}
