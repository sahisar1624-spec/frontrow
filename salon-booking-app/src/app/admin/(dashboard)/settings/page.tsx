import { getSalon } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const salon = await getSalon();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-ink">Salon info</h1>
      <p className="mb-6 max-w-lg text-sm text-ink-soft">
        This is what clients see on the booking page and in their confirmation email.
      </p>
      <SettingsForm salon={salon} />
    </div>
  );
}
