"use client";

import { useActionState } from "react";
import { updateSalonSettings } from "@/lib/actions/settings";

type Salon = {
  name: string;
  address: string;
  phone: string;
  email: string | null;
  instagram: string | null;
  tagline: string | null;
  aboutText: string | null;
};

export function SettingsForm({ salon }: { salon: Salon }) {
  const [state, formAction, pending] = useActionState(updateSalonSettings, undefined);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-ink">
        Salon name
        <input
          name="name"
          required
          defaultValue={salon.name}
          className="rounded-sm border border-line bg-paper-soft px-3 py-2.5 text-ink outline-none focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink">
        Tagline <span className="text-ink-soft">(shown under the name)</span>
        <input
          name="tagline"
          defaultValue={salon.tagline ?? ""}
          className="rounded-sm border border-line bg-paper-soft px-3 py-2.5 text-ink outline-none focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink">
        Address
        <input
          name="address"
          required
          defaultValue={salon.address}
          className="rounded-sm border border-line bg-paper-soft px-3 py-2.5 text-ink outline-none focus:border-primary"
        />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
          Phone
          <input
            name="phone"
            required
            defaultValue={salon.phone}
            className="rounded-sm border border-line bg-paper-soft px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
          Email
          <input
            name="email"
            type="email"
            defaultValue={salon.email ?? ""}
            className="rounded-sm border border-line bg-paper-soft px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-ink">
        Instagram <span className="text-ink-soft">(optional)</span>
        <input
          name="instagram"
          defaultValue={salon.instagram ?? ""}
          className="rounded-sm border border-line bg-paper-soft px-3 py-2.5 text-ink outline-none focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink">
        About text <span className="text-ink-soft">(shown on the booking page)</span>
        <textarea
          name="aboutText"
          defaultValue={salon.aboutText ?? ""}
          className="min-h-24 resize-none rounded-sm border border-line bg-paper-soft px-3 py-2.5 text-ink outline-none focus:border-primary"
        />
      </label>

      {state?.error && <p className="text-sm text-primary">{state.error}</p>}
      {state?.success && <p className="text-sm" style={{ color: "var(--color-massage)" }}>Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 self-start rounded-sm bg-primary px-5 py-2.5 text-sm text-paper-soft hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
