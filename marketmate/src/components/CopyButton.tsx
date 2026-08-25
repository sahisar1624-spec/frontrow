"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context) — fail quietly.
    }
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="shrink-0 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-brand-ink hover:bg-brand/10"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
