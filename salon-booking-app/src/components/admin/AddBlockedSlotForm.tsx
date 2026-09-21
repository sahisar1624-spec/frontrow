"use client";

import { useActionState, useState } from "react";
import { addBlockedSlot } from "@/lib/actions/schedule";

export function AddBlockedSlotForm() {
  const [state, formAction, pending] = useActionState(addBlockedSlot, undefined);
  const [wholeDay, setWholeDay] = useState(false);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-sm border border-line bg-paper-soft p-5"
    >
      <p className="font-display text-lg text-ink">Block off time</p>

      <label className="flex flex-col gap-1 text-sm text-ink">
        Date
        <input
          type="date"
          name="date"
          required
          className="rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="wholeDay"
          checked={wholeDay}
          onChange={(e) => setWholeDay(e.target.checked)}
        />
        Block the whole day
      </label>

      {!wholeDay && (
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
            From
            <input
              type="time"
              name="startTime"
              className="rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
            To
            <input
              type="time"
              name="endTime"
              className="rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary"
            />
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm text-ink">
        Reason <span className="text-ink-soft">(optional)</span>
        <input
          name="reason"
          placeholder="Lunch, holiday, staff training…"
          className="rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary"
        />
      </label>

      {state?.error && <p className="text-sm text-primary">{state.error}</p>}
      {state && "success" in state && state.success && (
        <p className="text-sm" style={{ color: "var(--color-massage)" }}>
          Added — see it in the list.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 self-start rounded-sm bg-primary px-4 py-2 text-sm text-paper-soft hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
