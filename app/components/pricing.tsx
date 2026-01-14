"use client"

import { useState } from "react"
import { Check, X, CreditCard, Lock, Shield, Target, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

const plans = [
  {
    id: "free",
    name: "Free",
    badge: "Forever Free",
    badgeVariant: "secondary" as const,
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for getting started",
    features: [
      { name: "10 AI transformations (lifetime)", included: true },
      { name: "Unlimited practice sessions", included: true },
      { name: "Full gamification", included: true },
      { name: "Leaderboard access", included: true },
      { name: "Activity heatmap", included: true },
      { name: "Basic stats", included: true },
    ],
    buttonText: "Start Free",
    buttonVariant: "outline" as const,
    highlighted: false,
    disabled: false,
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    badgeVariant: "default" as const,
    monthlyPrice: 9.99,
    annualPrice: 79,
    description: "For serious practitioners",
    features: [
      { name: "Everything in Free", included: true },
      { name: "Unlimited transformations", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom categories", included: true },
      { name: "Export affirmations", included: true },
      { name: "Priority support", included: true },
      { name: "Dark mode", included: true },
    ],
    buttonText: "Start 7-Day Free Trial",
    buttonVariant: "default" as const,
    highlighted: true,
    disabled: false,
    note: "No credit card required",
  },
]

const allFeatures = [
  { name: "Transformations", free: "10 lifetime", pro: "Unlimited" },
  { name: "Practice sessions", free: true, pro: true },
  { name: "Gamification & XP", free: true, pro: true },
  { name: "Leaderboard", free: true, pro: true },
  { name: "Activity heatmap", free: true, pro: true },
  { name: "Basic stats", free: true, pro: true },
  { name: "Advanced analytics", free: false, pro: true },
  { name: "Custom categories", free: false, pro: true },
  { name: "Export affirmations", free: false, pro: true },
  { name: "Priority support", free: false, pro: true },
  { name: "Dark mode", free: false, pro: true },
]

const faqs = [
  {
    question: "Can I upgrade or downgrade anytime?",
    answer:
      "Yes! You can upgrade to Pro immediately and get instant access to all features. Downgrades take effect at the end of your billing period.",
  },
  {
    question: "What happens if I downgrade?",
    answer:
      "All your data stays safe — your affirmations, progress, and stats are preserved. You'll just lose access to Pro features like unlimited transformations and advanced analytics.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day money-back guarantee. If you're not satisfied for any reason, contact us within 30 days of purchase for a full refund.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Absolutely. We use Stripe for payment processing, the same provider trusted by millions of businesses worldwide. We never store your card details on our servers.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay through our secure Stripe integration.",
  },
]

const trustSignals = [
  { icon: CreditCard, text: "Secure payment via Stripe" },
  { icon: Lock, text: "Cancel anytime" },
  { icon: Shield, text: "30-day money-back guarantee" },
  { icon: Target, text: "No hidden fees" },
]

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isSignedIn } = useAuth()

  const handleCheckout = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to upgrade")
      return
    }

    setIsLoading(true)

    try {
      const priceId = isAnnual
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID

      if (!priceId) {
        toast.error("Pricing not configured. Please try again later.")
        return
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, isAnnual }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
            Simple, Transparent Pricing
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">Start free. Upgrade when you're ready.</p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Save 34% — 4 months free
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
                plan.highlighted && "border-primary shadow-md ring-1 ring-primary/20",
                plan.disabled && "opacity-60",
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Badge
                    variant={plan.badgeVariant}
                    className={cn(plan.highlighted && "bg-primary text-primary-foreground")}
                  >
                    {plan.badge}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-2xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && <span className="text-muted-foreground">/{isAnnual ? "yr" : "mo"}</span>}
                </div>
                <CardDescription className="mt-1">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-2 text-sm">
                      <Check
                        className={cn("mt-0.5 h-4 w-4 shrink-0", plan.highlighted ? "text-primary" : "text-green-500")}
                      />
                      <span className="text-muted-foreground">{feature.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-2">
                  {plan.id === "pro" ? (
                    <Button
                      variant={plan.buttonVariant}
                      className={cn("w-full", plan.highlighted && "shadow-sm")}
                      onClick={handleCheckout}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        plan.buttonText
                      )}
                    </Button>
                  ) : (
                    <Button
                      asChild={!plan.disabled}
                      variant={plan.buttonVariant}
                      className={cn("w-full", plan.highlighted && "shadow-sm")}
                      disabled={plan.disabled}
                    >
                      {plan.disabled ? (
                        <span>{plan.buttonText}</span>
                      ) : (
                        <Link href="/create">{plan.buttonText}</Link>
                      )}
                    </Button>
                  )}
                  {plan.note && <p className="text-center text-xs text-muted-foreground">{plan.note}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="mx-auto flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Compare all features
            <ChevronDown className={cn("h-4 w-4 transition-transform", showComparison && "rotate-180")} />
          </button>

          {showComparison && (
            <Card className="mt-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Feature</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Free</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-primary">Pro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allFeatures.map((feature, index) => (
                        <tr key={feature.name} className={index < allFeatures.length - 1 ? "border-b" : ""}>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{feature.name}</td>
                          <td className="px-4 py-3 text-center">
                            {typeof feature.free === "string" ? (
                              <span className="text-sm text-muted-foreground">{feature.free}</span>
                            ) : feature.free ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center bg-primary/5">
                            {typeof feature.pro === "string" ? (
                              <span className="text-sm font-medium text-primary">{feature.pro}</span>
                            ) : feature.pro ? (
                              <Check className="mx-auto h-4 w-4 text-primary" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Trust Signals */}
      <section className="px-4 py-12 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {trustSignals.map((signal) => (
              <div key={signal.text} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <signal.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{signal.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16">
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

      {/* Bottom CTA */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Still not sure? Start free.</h2>
          <p className="mb-6 text-muted-foreground">Try Mindshift free forever. Upgrade only when you're ready.</p>
          <Button asChild size="lg">
            <Link href="/create">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
