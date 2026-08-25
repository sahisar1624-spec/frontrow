"use client";

import { useState, type FormEvent } from "react";
import type { BusinessInput } from "@/lib/types";

const BUSINESS_TYPE_IDEAS = [
  "Coffee shop",
  "Hair salon",
  "Boutique clothing store",
  "Independent bookstore",
  "Food truck",
  "Yoga studio",
  "Landscaping company",
  "Pet grooming service",
  "Bakery",
  "Auto repair shop",
];

const GOAL_IDEAS = [
  "Get more foot traffic",
  "Sell more online",
  "Get more bookings or appointments",
  "Grow my Instagram/Facebook following",
  "Build local brand awareness",
  "Fill seats for an upcoming event",
];

interface BusinessFormProps {
  onSubmit: (input: BusinessInput) => void;
  loading: boolean;
}

export default function BusinessForm({ onSubmit, loading }: BusinessFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [goal, setGoal] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!businessType.trim() || !targetAudience.trim() || !goal.trim()) return;
    onSubmit({
      businessName: businessName.trim() || undefined,
      businessType: businessType.trim(),
      targetAudience: targetAudience.trim(),
      goal: goal.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-brand-ink">
          Business name <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Maple & Co."
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-brand-ink">
          What kind of business is it?
        </label>
        <input
          id="businessType"
          required
          list="business-type-ideas"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          placeholder="e.g. neighborhood coffee shop"
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <datalist id="business-type-ideas">
          {BUSINESS_TYPE_IDEAS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor="targetAudience" className="block text-sm font-medium text-brand-ink">
          Who are you trying to reach?
        </label>
        <input
          id="targetAudience"
          required
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="e.g. busy parents in downtown Austin who work remotely"
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="goal" className="block text-sm font-medium text-brand-ink">
          What&rsquo;s your goal right now?
        </label>
        <input
          id="goal"
          required
          list="goal-ideas"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. get more foot traffic on weekday mornings"
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <datalist id="goal-ideas">
          {GOAL_IDEAS.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Writing your content pack…" : "Generate my content pack ✨"}
      </button>
    </form>
  );
}
