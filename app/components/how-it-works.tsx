"use client"

import { Brain, Sparkles, Keyboard, Trophy, TrendingUp, Check, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const problemStats = [
  { value: "77%", label: "are negative", color: "bg-red-50 text-red-700 border-red-200" },
  { value: "95%", label: "are repetitive", color: "bg-muted text-muted-foreground border-border" },
  { value: "Most", label: "go unnoticed", color: "bg-blue-50 text-blue-700 border-blue-200" },
]

const scienceSteps = [
  {
    step: 1,
    title: "Neural Pathways",
    description: "Your brain has grooves for negative thoughts. Like paths in a forest from repeated walking.",
  },
  {
    step: 2,
    title: "Active Engagement",
    description: "Manual typing forces full attention. You can't type 'I am capable' while thinking 'I'm worthless.'",
  },
  {
    step: 3,
    title: "Repetition Rewires",
    description: "New neural pathways form through repetition. 10 reps creates the new groove.",
  },
  {
    step: 4,
    title: "Pattern Replacement",
    description: "Over 30 days, the positive pattern becomes automatic. The old pathway weakens.",
  },
]

const methodCards = [
  {
    icon: Sparkles,
    title: "AI Transformation",
    points: [
      "Enter your negative thought",
      "Get personalized affirmations based on CBT principles",
      "Choose the one that resonates",
    ],
  },
  {
    icon: Keyboard,
    title: "Active Practice",
    points: ["Type your affirmation 10 times", "Manual typing engages brain fully", "Takes 2-3 minutes"],
  },
  {
    icon: Trophy,
    title: "Build Consistency",
    points: ["Earn XP and maintain your streak", "Level up through 50 levels", "Compete on leaderboards"],
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    points: ["See your practice patterns", "Unlock achievement badges", "Watch neural pathways strengthen"],
  },
]

const timeline = [
  { week: "Week 1", result: "Awareness increases" },
  { week: "Week 2", result: "Automatic thoughts slow" },
  { week: "Week 3", result: "New patterns emerge" },
  { week: "Week 4", result: "Positive self-talk becomes natural" },
]

const benefits = [
  "Reduced negative self-talk",
  "Increased self-confidence",
  "Better stress management",
  "Improved relationships",
  "Greater emotional resilience",
]

const comparisonRows = [
  { feature: "Affirmations", others: "Generic", mindshift: "AI-personalized" },
  { feature: "Method", others: "Passive reading", mindshift: "Active typing" },
  { feature: "Motivation", others: "None", mindshift: "Gamification" },
  { feature: "Accountability", others: "Solo", mindshift: "Community leaderboard" },
  { feature: "Progress", others: "Unclear", mindshift: "Visual heatmap" },
]

const faqs = [
  {
    question: "How long does it take to see results?",
    answer:
      "Most users notice increased awareness in the first week. Significant shifts in thought patterns typically occur within 2-4 weeks of consistent daily practice.",
  },
  {
    question: "Why typing instead of reading?",
    answer:
      "Active engagement through typing forces your full attention, making the neural rewiring process much more effective than passive reading or listening. You can't type a positive affirmation while simultaneously thinking a negative thought.",
  },
  {
    question: "Is the science proven?",
    answer:
      "Yes. Mindshift is based on Cognitive Behavioral Therapy (CBT) principles and neuroscience research on neuroplasticity. The approach draws from Dr. Shad Helmstetter's Self-Talk research and established CBT techniques.",
  },
  {
    question: "What if I miss a day?",
    answer:
      "Your streak resets, but all your progress (level, XP, affirmations) is saved. The key is getting back on track. Missing one day won't undo your neural rewiring progress.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your Pro subscription at any time. You'll keep access until the end of your billing period, then revert to the free tier with all your progress intact.",
  },
]

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Science-backed methodology
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
            How Mindshift Works
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground text-balance">
            The science-backed approach to transforming negative self-talk into lasting positive change.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="relative h-32 w-32 md:h-40 md:w-40">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-primary/20 animate-pulse" />
              <div className="absolute inset-4 flex items-center justify-center rounded-full bg-card shadow-lg">
                <Brain className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              </div>
              <Sparkles className="absolute -right-2 top-2 h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-foreground">
            Your Mind Runs 77,000 Thoughts Per Day
          </h2>
          <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
            {problemStats.map((stat) => (
              <Card key={stat.label} className={`border ${stat.color} text-center`}>
                <CardContent className="p-4 md:p-6">
                  <p className="text-2xl font-bold md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-muted-foreground leading-relaxed">
            These automatic negative thoughts shape your reality, relationships, and self-image.{" "}
            <span className="font-medium text-foreground">But you can reprogram them.</span>
          </p>
        </div>
      </section>

      {/* The Science Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-foreground">
            Why Manual Typing Works
          </h2>
          <p className="mb-10 text-center text-muted-foreground">The neuroscience behind active engagement</p>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-8">
              {scienceSteps.map((item, index) => (
                <div
                  key={item.step}
                  className={`relative flex gap-4 md:gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Step number */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md md:absolute md:left-1/2 md:-translate-x-1/2">
                    {item.step}
                  </div>
                  {/* Content card */}
                  <Card className={`flex-1 md:w-5/12 ${index % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground italic">
            Based on Self-Talk Solution by Shad Helmstetter, PhD and Cognitive Behavioral Therapy principles
          </p>
        </div>
      </section>

      {/* The Method Section */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-foreground">How Mindshift Works</h2>
          <p className="mb-10 text-center text-muted-foreground">Four steps to transform your thinking</p>
          <div className="grid gap-4 md:grid-cols-2">
            {methodCards.map((card) => (
              <Card key={card.title} className="h-full">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-foreground">
            What You'll Experience
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Transformation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={item.week} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.week}</p>
                        <p className="text-sm text-muted-foreground">{item.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Benefits list */}
            <Card className="bg-green-50/50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-green-900">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-foreground">
            Why Mindshift vs Other Apps?
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Feature</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Other Apps</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-primary">Mindshift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, index) => (
                      <tr key={row.feature} className={index < comparisonRows.length - 1 ? "border-b" : ""}>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{row.feature}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{row.others}</td>
                        <td className="px-4 py-3 text-sm font-medium text-primary">{row.mindshift}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-foreground">
            Start Your Transformation Today
          </h2>
          <p className="mb-10 text-center text-muted-foreground">Choose the plan that works for you</p>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Free Forever</CardTitle>
                <CardDescription>Get started with the basics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>5 transformations/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Practice unlimited</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Basic leaderboard</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href="/create">Start Free</Link>
                </Button>
              </CardContent>
            </Card>
            {/* Pro Plan */}
            <Card className="border-primary bg-primary/5 relative overflow-hidden">
              <Badge className="absolute right-4 top-4">Popular</Badge>
              <CardHeader>
                <CardTitle>
                  Go Pro <span className="text-xl font-normal text-muted-foreground">$4.99/mo</span>
                </CardTitle>
                <CardDescription>Unlock your full potential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited transformations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Custom categories</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/create">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Ready to Transform Your Thinking?</h2>
          <p className="mb-6 text-muted-foreground">
            Join thousands who have already started their journey to positive self-talk.
          </p>
          <Button asChild size="lg">
            <Link href="/create">
              Start Free Today
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
