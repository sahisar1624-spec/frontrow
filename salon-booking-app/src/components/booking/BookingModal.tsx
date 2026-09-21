"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createBooking, getSlotsForService } from "@/lib/actions/booking";
import { categoryColor } from "@/lib/category-style";
import { formatDisplayTime } from "@/lib/data";

type Service = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  categorySlug: string;
  categoryName: string;
};

const DAYS_AHEAD = 21;

function upcomingDates() {
  const dates: { iso: string; weekday: string; day: number; month: string }[] = [];
  const now = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dates.push({
      iso,
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return dates;
}

type Step = "time" | "details" | "confirmed";

export function BookingModal({
  service,
  salon,
  onClose,
}: {
  service: Service;
  salon: { name: string; address: string; phone: string };
  onClose: () => void;
}) {
  const dates = useMemo(() => upcomingDates(), []);
  const [step, setStep] = useState<Step>("time");
  const [selectedDate, setSelectedDate] = useState(dates[0].iso);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, startSlotsTransition] = useTransition();
  const [submitting, startSubmitTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<
    Extract<Awaited<ReturnType<typeof createBooking>>, { ok: true }>["confirmation"] | null
  >(null);

  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });

  useEffect(() => {
    startSlotsTransition(async () => {
      setSelectedTime(null);
      setSlots(null);
      const result = await getSlotsForService(service.id, selectedDate);
      setSlots(result);
    });
  }, [selectedDate, service.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const color = categoryColor(service.categorySlug);

  function handleContinueToDetails() {
    if (!selectedTime) return;
    setStep("details");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTime) return;
    setError(null);
    startSubmitTransition(async () => {
      const result = await createBooking({
        serviceId: service.id,
        date: selectedDate,
        startTime: selectedTime,
        name: form.name,
        phone: form.phone,
        email: form.email,
        note: form.note || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        if (result.error.toLowerCase().includes("taken")) {
          setStep("time");
          startSlotsTransition(async () => {
            const fresh = await getSlotsForService(service.id, selectedDate);
            setSlots(fresh);
          });
        }
        return;
      }
      setConfirmation(result.confirmation);
      setStep("confirmed");
    });
  }

  const dateLabel = dates.find((d) => d.iso === selectedDate);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[1px] md:items-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-paper-soft shadow-xl md:rounded-xl">
        <div
          className="flex items-start justify-between gap-4 px-6 py-5"
          style={{ borderBottom: `1px solid var(--color-line)` }}
        >
          <div>
            <p className="text-xs" style={{ color }}>
              {service.categoryName}
            </p>
            <p className="font-display text-xl text-ink">{service.name}</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {service.durationMin} min · ${service.price.toFixed(0)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none text-ink-soft hover:text-ink"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "time" && (
            <>
              <p className="mb-3 font-display text-lg text-ink">Choose a day</p>
              <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
                {dates.map((d) => {
                  const isActive = d.iso === selectedDate;
                  return (
                    <button
                      key={d.iso}
                      onClick={() => setSelectedDate(d.iso)}
                      className="flex shrink-0 flex-col items-center rounded-sm px-3 py-2 text-sm transition-colors"
                      style={{
                        background: isActive ? color : "transparent",
                        color: isActive ? "var(--color-paper-soft)" : "var(--color-ink)",
                        border: `1px solid ${isActive ? color : "var(--color-line)"}`,
                      }}
                    >
                      <span className="text-xs opacity-80">{d.weekday}</span>
                      <span className="font-display text-base">{d.day}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mb-3 font-display text-lg text-ink">
                {dateLabel ? `${dateLabel.weekday}, ${dateLabel.month} ${dateLabel.day}` : "Choose a time"}
              </p>

              {loadingSlots && <p className="text-sm text-ink-soft">Finding open times…</p>}

              {!loadingSlots && slots && slots.length === 0 && (
                <p className="text-sm text-ink-soft">
                  No open times this day — try another date.
                </p>
              )}

              {!loadingSlots && slots && slots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((time) => {
                    const isActive = time === selectedTime;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className="rounded-sm px-2 py-2 text-sm transition-colors"
                        style={{
                          background: isActive ? color : "var(--color-paper)",
                          color: isActive ? "var(--color-paper-soft)" : "var(--color-ink)",
                          border: `1px solid ${isActive ? color : "var(--color-line)"}`,
                        }}
                      >
                        {formatDisplayTime(time)}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === "details" && (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="rounded-sm bg-paper px-4 py-3 text-sm text-ink-soft">
                {dateLabel && `${dateLabel.weekday}, ${dateLabel.month} ${dateLabel.day}`} at{" "}
                {selectedTime && formatDisplayTime(selectedTime)}
              </div>

              <label className="flex flex-col gap-1 text-sm text-ink">
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
                  placeholder="Your name"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-ink">
                Phone
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
                  placeholder="(555) 555-5555"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-ink">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
                  placeholder="you@email.com"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-ink">
                Anything we should know? <span className="text-ink-soft">(optional)</span>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  className="min-h-20 resize-none rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
                  placeholder="First time getting a gel manicure, allergic to..."
                />
              </label>

              {error && <p className="text-sm text-primary">{error}</p>}

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("time")}
                  className="rounded-sm border border-line px-4 py-2.5 text-sm text-ink-soft hover:text-ink"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-sm px-4 py-2.5 text-sm text-paper-soft transition-colors disabled:opacity-60"
                  style={{ background: "var(--color-primary)" }}
                >
                  {submitting ? "Booking…" : "Confirm booking"}
                </button>
              </div>
            </form>
          )}

          {step === "confirmed" && confirmation && (
            <div className="flex flex-col gap-4 text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: color }}
              >
                <span className="text-2xl text-paper-soft">✓</span>
              </div>
              <p className="font-display text-2xl text-ink">You&apos;re all set</p>
              <p className="text-sm text-ink-soft">
                We&apos;ve emailed your confirmation too.
              </p>
              <div className="mx-auto flex w-full flex-col gap-1 rounded-sm bg-paper px-5 py-4 text-left text-sm">
                <p className="font-display text-base text-ink">{confirmation.serviceName}</p>
                <p className="text-ink-soft">
                  {dateLabel && `${dateLabel.weekday}, ${dateLabel.month} ${dateLabel.day}`} at{" "}
                  {formatDisplayTime(confirmation.startTime)}
                </p>
                <p className="text-ink-soft">
                  {confirmation.durationMin} min · ${confirmation.price.toFixed(0)}
                </p>
                <div className="my-2 border-t border-line" />
                <p className="text-ink-soft">{salon.name}</p>
                <p className="text-ink-soft">{salon.address}</p>
                <p className="text-ink-soft">{salon.phone}</p>
              </div>
              <button
                onClick={onClose}
                className="mt-1 rounded-sm border border-line px-4 py-2.5 text-sm text-ink hover:border-primary hover:text-primary"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {step === "time" && (
          <div className="px-6 py-4" style={{ borderTop: "1px solid var(--color-line)" }}>
            <button
              onClick={handleContinueToDetails}
              disabled={!selectedTime}
              className="w-full rounded-sm px-4 py-2.5 text-sm text-paper-soft transition-colors disabled:opacity-40"
              style={{ background: "var(--color-primary)" }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
