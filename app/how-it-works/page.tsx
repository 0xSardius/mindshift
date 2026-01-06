import type { Metadata } from "next"
import { HowItWorks } from "@/components/how-it-works"

export const metadata: Metadata = {
  title: "How Mindshift Works - Science-Backed Mental Transformation",
  description:
    "Learn how Mindshift uses AI-powered affirmations and active typing practice to rewire negative thought patterns based on CBT and neuroscience.",
}

export default function HowItWorksPage() {
  return <HowItWorks />
}
