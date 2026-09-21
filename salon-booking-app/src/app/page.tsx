import { getSalon, getServiceCategories, getWorkingHours } from "@/lib/data";
import { Hero, HoursStrip } from "@/components/booking/Hero";
import { ServicesSection } from "@/components/booking/ServicesSection";

// The hero's "open now" status depends on the current time, and admin edits
// to hours/services/settings should show up immediately — never cache this page.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [salon, categories, hours] = await Promise.all([
    getSalon(),
    getServiceCategories(),
    getWorkingHours(),
  ]);

  return (
    <main className="flex-1">
      <Hero
        name={salon.name}
        tagline={salon.tagline}
        address={salon.address}
        phone={salon.phone}
        hours={hours}
      />

      <ServicesSection
        categories={categories}
        salon={{ name: salon.name, address: salon.address, phone: salon.phone }}
      />

      {salon.aboutText && (
        <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <p className="max-w-xl font-display text-2xl leading-snug text-ink">
            {salon.aboutText}
          </p>
        </section>
      )}

      <footer className="border-t border-line bg-paper-soft">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-col gap-1">
            <p className="font-display text-xl text-ink">{salon.name}</p>
            <p className="text-sm text-ink-soft">{salon.address}</p>
            <a
              href={`tel:${salon.phone.replace(/[^\d+]/g, "")}`}
              className="w-fit text-sm text-ink-soft underline decoration-line underline-offset-4 hover:decoration-primary"
            >
              {salon.phone}
            </a>
            {salon.email && (
              <a href={`mailto:${salon.email}`} className="w-fit text-sm text-ink-soft underline decoration-line underline-offset-4 hover:decoration-primary">
                {salon.email}
              </a>
            )}
            {salon.instagram && <p className="text-sm text-ink-soft">{salon.instagram}</p>}
          </div>

          <div>
            <p className="mb-2 text-xs text-ink-soft">Hours</p>
            <HoursStrip hours={hours} />
          </div>
        </div>
      </footer>
    </main>
  );
}
