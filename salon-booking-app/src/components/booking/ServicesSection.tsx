"use client";

import { useState } from "react";
import { categoryColor } from "@/lib/category-style";
import { BookingModal } from "./BookingModal";

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  services: Service[];
};

export function ServicesSection({
  categories,
  salon,
}: {
  categories: Category[];
  salon: { name: string; address: string; phone: string };
}) {
  const withServices = categories.filter((c) => c.services.length > 0);
  const [activeSlug, setActiveSlug] = useState(withServices[0]?.slug ?? "");
  const [bookingService, setBookingService] = useState<
    (Service & { categorySlug: string; categoryName: string }) | null
  >(null);

  const active = withServices.find((c) => c.slug === activeSlug) ?? withServices[0];

  if (!active) {
    return (
      <section id="services" className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-ink-soft">
          Services are being set up — check back soon, or call us to book.
        </p>
      </section>
    );
  }

  return (
    <section id="services" className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="mb-10 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.16em] text-ink-soft" style={{ letterSpacing: "0.08em" }}>
          Services
        </p>
        <h2 className="font-display text-4xl text-ink">Pick something for you</h2>
      </div>

      {/* The swatch strip — like choosing a polish colour */}
      <div className="-mx-6 mb-8 flex gap-3 overflow-x-auto px-6 pb-2" role="tablist" aria-label="Service categories">
        {withServices.map((cat) => {
          const isActive = cat.slug === active.slug;
          const color = categoryColor(cat.slug);
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSlug(cat.slug)}
              className="flex shrink-0 flex-col items-center gap-2 rounded-sm px-1 py-1 transition-opacity"
              style={{ opacity: isActive ? 1 : 0.55 }}
            >
              <span
                className="block h-11 w-11 rounded-full transition-transform"
                style={{
                  background: color,
                  transform: isActive ? "scale(1)" : "scale(0.82)",
                  boxShadow: isActive ? `0 0 0 3px var(--color-paper), 0 0 0 5px ${color}` : "none",
                }}
              />
              <span
                className="font-display text-sm"
                style={{ color: isActive ? "var(--color-ink)" : "var(--color-ink-soft)" }}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="flex flex-col gap-3">
        {active.services.map((service) => (
          <li
            key={service.id}
            className="flex items-center justify-between gap-4 rounded-sm border border-line bg-paper-soft py-4 pl-5 pr-4"
            style={{ borderLeft: `3px solid ${categoryColor(active.slug)}` }}
          >
            <div className="min-w-0">
              <p className="font-display text-lg text-ink">{service.name}</p>
              {service.description && (
                <p className="mt-0.5 text-sm text-ink-soft">{service.description}</p>
              )}
              <p className="mt-1 text-sm text-ink-soft">{service.durationMin} min</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="font-display text-lg text-ink">${service.price.toFixed(0)}</span>
              <button
                onClick={() =>
                  setBookingService({
                    ...service,
                    categorySlug: active.slug,
                    categoryName: active.name,
                  })
                }
                className="rounded-sm border border-ink/15 bg-transparent px-4 py-1.5 text-sm text-ink transition-colors hover:border-primary hover:text-primary"
              >
                Book
              </button>
            </div>
          </li>
        ))}
      </ul>

      {bookingService && (
        <BookingModal
          service={bookingService}
          salon={salon}
          onClose={() => setBookingService(null)}
        />
      )}
    </section>
  );
}
