import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// Schema for the AI response
const AffirmationResponseSchema = z.object({
  analysis: z.object({
    detectedLevel: z.number().min(1).max(5).describe("The Self-Talk level (1-5) of the input"),
    cognitiveDistortion: z.string().describe("The primary cognitive distortion identified"),
    theme: z.string().describe("The theme category (e.g., self-worth, confidence, capability)"),
    reframingApproach: z.string().describe("Brief explanation of the reframing strategy"),
  }),
  affirmations: z.array(
    z.object({
      text: z.string().describe("The transformed affirmation text"),
      level: z.number().min(3).max(4).describe("The Self-Talk level of this affirmation (3 or 4)"),
      reasoning: z.string().describe("Brief explanation of why this transformation works"),
    })
  ).min(3).max(5),
});

const SYSTEM_PROMPT = `You are an expert in the Self-Talk Solution methodology by Shad Helmstetter and cognitive behavioral therapy. Your role is to transform negative self-talk into effective, personalized affirmations.

## The Five Levels of Self-Talk:
- Level 1 (Negative Acceptance): "I can't...", "I'll never...", "That's just the way I am..."
- Level 2 (Recognition & Need to Change): "I need to...", "I should..." (aware but not changing)
- Level 3 (Decision to Change): "I never...", "I no longer..." (present tense rejection of old patterns)
- Level 4 (The Better You): "I am..." statements in present tense (new programming, identity-based)
- Level 5 (Universal Affirmation): Highest level of spiritual self-talk

## Transformation Rules:
1. ALWAYS use present tense ("I am..." not "I will be...")
2. ALWAYS be personal (use "I" statements)
3. ALWAYS be positive (state what you ARE doing, not what you're NOT doing)
4. ALWAYS be specific (tied to the actual negative pattern, not generic)
5. Make Level 3 affirmations transitional and believable
6. Make Level 4 affirmations aspirational and identity-based

## Cognitive Distortions to Identify:
- All-or-nothing thinking (black and white)
- Overgeneralization ("always", "never")
- Mental filtering (focusing only on negatives)
- Catastrophizing (assuming worst case)
- Personalization (blaming self for everything)
- Emotional reasoning (feelings as facts)
- Should statements (rigid rules)
- Labeling (defining self by mistakes)

## Output Requirements:
- Generate 3-5 affirmations
- Include 1-2 Level 3 options (transitional, easier to believe)
- Include 2-3 Level 4 options (aspirational, identity-based)
- Keep affirmations concise (under 15 words ideally)
- Make them feel authentic, not generic`;

export async function POST(req: Request) {
  try {
    const { negativeThought } = await req.json();

    if (!negativeThought || negativeThought.length < 10) {
      return NextResponse.json(
        { error: "Negative thought must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20241022"),
      schema: AffirmationResponseSchema,
      system: SYSTEM_PROMPT,
      prompt: `Transform this negative self-talk into empowering affirmations:

"${negativeThought}"

Analyze the self-talk level, identify the cognitive distortion, and generate 3-5 transformed affirmations following the Self-Talk Solution methodology.`,
    });

    // Transform to the format expected by the frontend
    const response = {
      analysis: {
        cognitiveDistortion: object.analysis.cognitiveDistortion,
        reframingApproach: object.analysis.reframingApproach,
        detectedLevel: object.analysis.detectedLevel,
        theme: object.analysis.theme,
        targetLevel: 4, // Most affirmations target Level 4
      },
      affirmations: object.affirmations.map((aff, index) => ({
        id: `aff-${Date.now()}-${index}`,
        text: aff.text,
        analysis: {
          cognitiveDistortion: object.analysis.cognitiveDistortion,
          reframingApproach: aff.reasoning,
          detectedLevel: object.analysis.detectedLevel,
          theme: object.analysis.theme,
          targetLevel: aff.level,
        },
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating affirmations:", error);

    // Return more specific error message for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to generate affirmations", details: errorMessage },
      { status: 500 }
    );
  }
}
